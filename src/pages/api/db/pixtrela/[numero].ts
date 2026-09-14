/* eslint-disable no-undef */
import axios, { type AxiosError } from "axios"
import type { NextApiRequest, NextApiResponse } from "next"
import { resolveProductOrderLabel } from "@/utils/productDisplayName"
import {
	findStrapiProductByProdId,
	isBoxTemplateData,
	toBoxTemplateData,
} from "../lib/strapi-product-template"

export const config = { maxDuration: 60 }

type PedidoItem = {
	prodId?: number | string
	Qtd?: number | string
	nomeProd?: string
	versions?: unknown
	modelo?: string
	comprimento?: string | number
	largura?: string | number
	altura?: string | number
}

type ProductRow = {
	prodId?: number
	versions?: unknown
	templateData?: unknown
}

type StageTrace = {
	stage: string
	durationMs: number
	detail?: string
}

type PixtrelaTaskSource = "legacy" | "existing" | "payload" | "rbx"

const STRAPI_TIMEOUT_MS = 12_000
const PIXTRELA_TIMEOUT_MS = 45_000

const strapiAuthHeaders = {
	Authorization: `Bearer ${process.env.ATORIZZATION_TOKEN}`,
	"Content-Type": "application/json",
}

function createTrace() {
	const startedAt = Date.now()
	const stages: StageTrace[] = []
	return {
		mark(stage: string, detail?: string) {
			stages.push({
				stage,
				durationMs: Date.now() - startedAt,
				detail,
			})
		},
		stages,
		totalMs: () => Date.now() - startedAt,
	}
}

function parsePedidoItens(itens: unknown): PedidoItem[] {
	if (itens == null) return []
	if (Array.isArray(itens)) return itens as PedidoItem[]
	if (typeof itens === "string") {
		const trimmed = itens.trim()
		if (!trimmed || trimmed === "null") return []
		try {
			const parsed = JSON.parse(trimmed)
			return Array.isArray(parsed) ? (parsed as PedidoItem[]) : []
		} catch {
			return []
		}
	}
	return []
}

function normalizeVersions(value: unknown): string[] {
	let rows: unknown[] = []
	if (Array.isArray(value)) {
		rows = value
	} else if (typeof value === "string") {
		const trimmed = value.trim()
		if (!trimmed || trimmed === "null") return []
		try {
			const parsed = JSON.parse(trimmed)
			if (Array.isArray(parsed)) rows = parsed
		} catch {
			return []
		}
	}
	const seen = new Set<string>()
	const out: string[] = []
	for (const entry of rows) {
		if (typeof entry !== "string" && typeof entry !== "number") continue
		const code = String(entry).trim()
		if (!code || !/^\d+$/.test(code) || seen.has(code)) continue
		seen.add(code)
		out.push(code)
	}
	return out
}

function isRbxTemplateSource(source: unknown): boolean {
	return source === "rbx"
}

function formatAxiosError(error: AxiosError): string {
	if (error.code === "ECONNABORTED") {
		return "request timed out"
	}
	const status = error.response?.status
	if (status) {
		return `HTTP ${status}`
	}
	return error.message || "request failed"
}

async function fetchProductByProdId(
	prodId: number,
	empresaId: number | null,
	trace: ReturnType<typeof createTrace>,
): Promise<ProductRow | null> {
	trace.mark(
		"strapi_product_start",
		`prodId=${prodId} empresaId=${empresaId ?? "any"}`,
	)
	const product = await findStrapiProductByProdId(prodId, empresaId)
	if (!product) {
		trace.mark("strapi_product_missing", `prodId=${prodId}`)
		return null
	}

	const versionsResponse = await axios({
		url:
			`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/produtos/${product.id}` +
			`?fields[0]=versions&publicationState=preview`,
		headers: strapiAuthHeaders,
		timeout: STRAPI_TIMEOUT_MS,
	})
	const versionsAttrs =
		versionsResponse.data?.data?.attributes ??
		versionsResponse.data?.data ??
		{}

	trace.mark(
		"strapi_product_ok",
		`prodId=${prodId} hasTemplate=${isBoxTemplateData(product.templateData)}`,
	)
	return {
		prodId: product.prodId,
		versions: versionsAttrs.versions,
		templateData: product.templateData,
	}
}

function errorPayload(
	trace: ReturnType<typeof createTrace>,
	stage: string,
	message: string,
	extra: Record<string, unknown> = {},
) {
	trace.mark(stage, message)
	return {
		ok: false,
		message,
		stage,
		trace: trace.stages,
		totalMs: trace.totalMs(),
		...extra,
	}
}

export default async function postPixtrelaTasks(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Only POST requests are allowed" })
	}

	const trace = createTrace()
	const pixtrelaApiUrl = (process.env.PIXTRELA_API_URL || "").replace(/\/+$/, "")
	const pixtrelaApiSecret = (process.env.PIXTRELA_API_SECRET || "").trim()
	if (!pixtrelaApiUrl || !pixtrelaApiSecret) {
		return res.status(503).json(
			errorPayload(
				trace,
				"config",
				"Pixtrela API is not configured (PIXTRELA_API_URL / SECRET).",
			),
		)
	}

	const { numero } = req.query
	if (!numero || Array.isArray(numero)) {
		return res.status(400).json(
			errorPayload(trace, "validate", "Invalid pedido number"),
		)
	}

	try {
		trace.mark("strapi_pedido_start", `pedido=${numero}`)
		const requestPedido = await axios({
			url:
				`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/pedidos/${numero}` +
				`?populate[empresa][fields][0]=nome` +
				`&populate[empresa][fields][1]=email` +
				`&populate[empresa][fields][2]=id`,
			headers: strapiAuthHeaders,
			timeout: STRAPI_TIMEOUT_MS,
		})
		trace.mark("strapi_pedido_ok", `pedido=${numero}`)

		const pedido = requestPedido.data.data
		const pedidoId = Number(pedido.id)
		const attrs = pedido.attributes
		const items = parsePedidoItens(attrs.itens)
		const empresaNome =
			attrs.empresa?.data?.attributes?.nome?.trim() || "Sem empresa"
		const empresaId = Number(attrs.empresa?.data?.id ?? attrs.empresaId ?? 0) || null
		const deliveryDate = attrs.dataEntrega ?? null

		if (items.length === 0) {
			return res.status(400).json(
				errorPayload(trace, "validate", "Pedido has no items."),
			)
		}

		const results: Array<{ externalKey: string; action: string }> = []
		let usedRbxFallback = false

		const prodIds: number[] = []
		for (let index = 0; index < items.length; index += 1) {
			const prodId = Number(items[index].prodId)
			if (!Number.isInteger(prodId) || prodId <= 0) {
				return res.status(400).json(
					errorPayload(
						trace,
						"validate",
						`Item ${index} has invalid prodId.`,
						{ itemIndex: index, prodId: items[index].prodId },
					),
				)
			}
			prodIds.push(prodId)
		}

		const productRows = await Promise.all(
			prodIds.map((prodId) => fetchProductByProdId(prodId, empresaId, trace)),
		)
		const productByProdId = new Map(
			prodIds.map((prodId, index) => [prodId, productRows[index]]),
		)

		for (let index = 0; index < items.length; index += 1) {
			const item = items[index]
			const prodId = prodIds[index]
			const product = productByProdId.get(prodId) ?? null
			const template = toBoxTemplateData(product?.templateData)
			if (!template) {
				usedRbxFallback = true
				trace.mark(
					"rbx_fallback_deferred",
					`prodId=${prodId} empresaId=${empresaId ?? "any"} (Pixtrela RBX)`,
				)
			} else {
				trace.mark(
					"strapi_template_payload",
					`prodId=${prodId} subtasks=${template.subtasks.length}`,
				)
			}

			const versions = normalizeVersions(product?.versions ?? item.versions ?? [])
			const qty = Math.max(1, Math.round(Number(item.Qtd) || 1))
			const productLabel =
				resolveProductOrderLabel(item).trim() ||
				template?.boxName?.trim() ||
				`produto ${prodId}`
			const name = `${empresaNome} - ${productLabel}`
			const externalKey = `${pedidoId}:${index}`

			trace.mark("pixtrela_task_start", `item=${index} prodId=${prodId}`)
			const response = await axios({
				method: "POST",
				url: `${pixtrelaApiUrl}/api/tasks`,
				headers: {
					"Content-Type": "application/json",
					Token: pixtrelaApiSecret,
					Accept: "application/json",
				},
				data: {
					name,
					qty,
					deliveryDate,
					externalKey,
					templateTaskCode: String(prodId),
					versions,
					template,
				},
				timeout: PIXTRELA_TIMEOUT_MS,
				validateStatus: () => true,
			})
			trace.mark(
				"pixtrela_task_response",
				`item=${index} status=${response.status}`,
			)

			if (response.status < 200 || response.status >= 300) {
				return res.status(502).json(
					errorPayload(
						trace,
						"pixtrela_task",
						`Pixtrela rejected task for item ${index}.`,
						{
							itemIndex: index,
							prodId,
							pixtrelaStatus: response.status,
							pixtrelaBody: response.data,
							usedRbxFallback,
						},
					),
				)
			}

			const templateSource = response.data?.templateSource as
				| PixtrelaTaskSource
				| undefined
			if (isRbxTemplateSource(templateSource)) {
				usedRbxFallback = true
			}

			results.push({
				externalKey,
				action: response.data?.action ?? "ok",
			})
		}

		trace.mark("done", `items=${results.length}`)
		return res.status(201).json({
			ok: true,
			results,
			usedRbxFallback,
			trace: trace.stages,
			totalMs: trace.totalMs(),
		})
	} catch (error: unknown) {
		const axiosError = axios.isAxiosError(error) ? error : null
		const stage = axiosError?.config?.url?.includes("/api/tasks")
			? "pixtrela_task"
			: "strapi"
		const detail = axiosError ? formatAxiosError(axiosError) : undefined
		const message =
			error instanceof Error
				? error.message
				: "Failed to sync tasks to Pixtrela."
		return res.status(axiosError?.response?.status === 504 ? 504 : 502).json(
			errorPayload(trace, stage, message, {
				detail,
				responseData: axiosError?.response?.data,
			}),
		)
	}
}
