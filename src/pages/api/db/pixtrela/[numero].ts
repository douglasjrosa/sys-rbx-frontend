/* eslint-disable no-undef */
import axios from "axios"
import type { NextApiRequest, NextApiResponse } from "next"

type PedidoItem = {
	prodId?: number | string
	Qtd?: number | string
	nomeProd?: string
	versions?: unknown
}

type BoxTemplateData = {
	prodId: number
	empresaNome: string
	boxName: string
	subtasks: unknown[]
}

type ProductRow = {
	prodId?: number
	versions?: unknown
	templateData?: unknown
}

const FETCH_TIMEOUT_MS = 55_000

const strapiAuthHeaders = {
	Authorization: `Bearer ${process.env.ATORIZZATION_TOKEN}`,
	"Content-Type": "application/json",
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

function isBoxTemplateData(value: unknown): value is BoxTemplateData {
	if (!value || typeof value !== "object") return false
	const row = value as Record<string, unknown>
	return (
		Number.isFinite(Number(row.prodId)) &&
		typeof row.empresaNome === "string" &&
		typeof row.boxName === "string" &&
		Array.isArray(row.subtasks)
	)
}

async function fetchProductByProdId(prodId: number): Promise<ProductRow | null> {
	const response = await axios({
		url:
			`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/produtos` +
			`?filters[prodId][$eq]=${prodId}` +
			`&fields[0]=prodId&fields[1]=versions&fields[2]=templateData` +
			`&pagination[limit]=1`,
		headers: strapiAuthHeaders,
		timeout: FETCH_TIMEOUT_MS,
	})
	const row = response.data?.data?.[0]
	if (!row) return null
	const attrs = row.attributes ?? row
	return {
		prodId: Number(attrs.prodId ?? prodId),
		versions: attrs.versions,
		templateData: attrs.templateData ?? null,
	}
}

async function fetchRbxTemplateData(
	prodId: number,
	email: string,
): Promise<BoxTemplateData | null> {
	const rbxApiUrl = process.env.RIBERMAX_API_URL
	const rbxApiToken = process.env.RIBERMAX_API_TOKEN
	if (!rbxApiUrl || !rbxApiToken) return null

	const response = await axios({
		url: `${rbxApiUrl}/produtos`,
		params: { templateData: prodId },
		headers: {
			Email: email,
			Token: rbxApiToken,
			Accept: "application/json",
		},
		timeout: FETCH_TIMEOUT_MS,
		validateStatus: () => true,
	})
	if (
		response.status >= 200 &&
		response.status < 300 &&
		isBoxTemplateData(response.data)
	) {
		return {
			...response.data,
			prodId: Number(response.data.prodId),
		}
	}
	return null
}

export default async function postPixtrelaTasks(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Only POST requests are allowed" })
	}

	const pixtrelaApiUrl = (process.env.PIXTRELA_API_URL || "").replace(/\/+$/, "")
	const pixtrelaApiSecret = (process.env.PIXTRELA_API_SECRET || "").trim()
	if (!pixtrelaApiUrl || !pixtrelaApiSecret) {
		return res.status(503).json({
			message: "Pixtrela API is not configured (PIXTRELA_API_URL / SECRET).",
		})
	}

	const { numero } = req.query
	if (!numero || Array.isArray(numero)) {
		return res.status(400).json({ message: "Invalid pedido number" })
	}

	try {
		const requestPedido = await axios({
			url:
				`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/pedidos/${numero}` +
				`?populate[empresa][fields][0]=nome` +
				`&populate[empresa][fields][1]=email`,
			headers: strapiAuthHeaders,
			timeout: FETCH_TIMEOUT_MS,
		})
		const pedido = requestPedido.data.data
		const pedidoId = Number(pedido.id)
		const attrs = pedido.attributes
		const items = parsePedidoItens(attrs.itens)
		const empresaNome =
			attrs.empresa?.data?.attributes?.nome?.trim() || "Sem empresa"
		const empresaEmail =
			attrs.empresa?.data?.attributes?.email?.trim() || "sistema@ribermax.com"
		const deliveryDate = attrs.dataEntrega ?? null

		if (items.length === 0) {
			return res.status(400).json({ message: "Pedido has no items." })
		}

		const results: Array<{ externalKey: string; action: string }> = []
		let usedRbxFallback = false

		for (let index = 0; index < items.length; index += 1) {
			const item = items[index]
			const prodId = Number(item.prodId)
			if (!Number.isInteger(prodId) || prodId <= 0) {
				return res.status(400).json({
					message: `Item ${index} has invalid prodId.`,
				})
			}

			const product = await fetchProductByProdId(prodId)
			let template = isBoxTemplateData(product?.templateData)
				? {
						...(product!.templateData as BoxTemplateData),
						prodId: Number((product!.templateData as BoxTemplateData).prodId),
					}
				: null
			if (!template) {
				usedRbxFallback = true
				template = await fetchRbxTemplateData(prodId, empresaEmail)
			}
			if (!template) {
				return res.status(502).json({
					message: `Could not resolve templateData for prodId ${prodId}.`,
					usedRbxFallback,
				})
			}

			const versions = normalizeVersions(product?.versions ?? item.versions ?? [])
			const qty = Math.max(1, Math.round(Number(item.Qtd) || 1))
			const productName = String(item.nomeProd ?? template.boxName).trim()
			const name = `${empresaNome} - ${productName}`
			const externalKey = `${pedidoId}:${index}`

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
				timeout: FETCH_TIMEOUT_MS,
				validateStatus: () => true,
			})

			if (response.status < 200 || response.status >= 300) {
				return res.status(502).json({
					message: `Pixtrela rejected task for item ${index}.`,
					status: response.status,
					body: response.data,
					usedRbxFallback,
				})
			}

			results.push({
				externalKey,
				action: response.data?.action ?? "ok",
			})
		}

		return res.status(201).json({
			ok: true,
			results,
			usedRbxFallback,
		})
	} catch (error: any) {
		return res.status(error?.response?.status || 400).json({
			message: error?.message || "Failed to sync tasks to Pixtrela.",
			details: error?.response?.data,
		})
	}
}
