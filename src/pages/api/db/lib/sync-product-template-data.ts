import axios from "axios"

const STRAPI_TIMEOUT_MS = 12_000
const RBX_TIMEOUT_MS = 55_000

type PedidoItemLike = {
	prodId?: number | string
}

type StrapiProductRow = {
	id: number
	prodId: number
	templateData: unknown
}

type BoxTemplateData = {
	prodId: number
	empresaNome: string
	boxName: string
	subtasks: unknown[]
}

function strapiHeaders() {
	return {
		Authorization: `Bearer ${process.env.ATORIZZATION_TOKEN}`,
		"Content-Type": "application/json",
	}
}

function rbxHeaders() {
	const token =
		process.env.RIBERMAX_API_TOKEN ||
		process.env.ATORIZZATION_TOKEN_RIBERMAX ||
		""
	return {
		Token: token,
		Accept: "application/json",
	}
}

export function parsePedidoItens(itens: unknown): PedidoItemLike[] {
	if (itens == null) return []
	if (Array.isArray(itens)) return itens as PedidoItemLike[]
	if (typeof itens === "string") {
		const trimmed = itens.trim()
		if (!trimmed || trimmed === "null") return []
		try {
			const parsed = JSON.parse(trimmed)
			return Array.isArray(parsed) ? (parsed as PedidoItemLike[]) : []
		} catch {
			return []
		}
	}
	return []
}

export function extractProdIds(items: PedidoItemLike[]): number[] {
	const seen = new Set<number>()
	const out: number[] = []
	for (const item of items) {
		const prodId = Number(item.prodId)
		if (!Number.isInteger(prodId) || prodId <= 0 || seen.has(prodId)) continue
		seen.add(prodId)
		out.push(prodId)
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

async function findStrapiProductByProdId(
	prodId: number,
): Promise<StrapiProductRow | null> {
	const response = await axios({
		method: "GET",
		url:
			`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/produtos` +
			`?filters[prodId][$eq]=${prodId}` +
			`&fields[0]=prodId&fields[1]=templateData` +
			`&pagination[limit]=1`,
		headers: strapiHeaders(),
		timeout: STRAPI_TIMEOUT_MS,
	})
	const row = response.data?.data?.[0]
	if (!row?.id) return null
	const attrs = row.attributes ?? row
	return {
		id: Number(row.id),
		prodId: Number(attrs.prodId ?? prodId),
		templateData: attrs.templateData ?? null,
	}
}

async function fetchTemplateDataFromRbx(
	prodId: number,
): Promise<BoxTemplateData | null> {
	const baseUrl = (process.env.RIBERMAX_API_URL || "").replace(/\/+$/, "")
	if (!baseUrl) return null

	const response = await axios({
		method: "GET",
		url: `${baseUrl}/produtos`,
		params: { templateData: prodId },
		headers: rbxHeaders(),
		timeout: RBX_TIMEOUT_MS,
		validateStatus: () => true,
	})

	const payload = response.data
	if (response.status < 200 || response.status >= 300) return null
	if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
		return null
	}
	if ("error" in payload) return null
	if (!isBoxTemplateData(payload)) return null
	return payload
}

async function saveTemplateDataOnStrapiProduct(
	strapiProductId: number,
	templateData: BoxTemplateData,
): Promise<void> {
	await axios({
		method: "PUT",
		url: `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/produtos/${strapiProductId}`,
		headers: strapiHeaders(),
		data: { data: { templateData } },
		timeout: STRAPI_TIMEOUT_MS,
	})
}

async function syncTemplateDataForProdId(prodId: number): Promise<void> {
	const product = await findStrapiProductByProdId(prodId)
	if (!product) return
	if (isBoxTemplateData(product.templateData)) return

	const templateData = await fetchTemplateDataFromRbx(prodId)
	if (!templateData) return

	await saveTemplateDataOnStrapiProduct(product.id, templateData)
}

/**
 * Ensures Strapi produto.templateData exists for each prodId (RBX fallback).
 * Intended for fire-and-forget background execution.
 */
export async function syncTemplateDataForProdIds(
	prodIds: readonly number[],
): Promise<void> {
	for (const prodId of prodIds) {
		try {
			await syncTemplateDataForProdId(prodId)
		} catch (error) {
			console.error(
				`templateData sync failed for prodId=${prodId}:`,
				error instanceof Error ? error.message : error,
			)
		}
	}
}

export async function syncTemplateDataForPedidoItems(
	itens: unknown,
): Promise<void> {
	const prodIds = extractProdIds(parsePedidoItens(itens))
	if (prodIds.length === 0) return
	await syncTemplateDataForProdIds(prodIds)
}

export async function syncTemplateDataForBusinessId(
	businessId: string,
): Promise<void> {
	const response = await axios({
		method: "GET",
		url:
			`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/businesses/${businessId}` +
			`?populate[pedidos][fields][0]=itens`,
		headers: strapiHeaders(),
		timeout: STRAPI_TIMEOUT_MS,
	})
	const pedidos = response.data?.data?.attributes?.pedidos?.data || []
	const items = pedidos.flatMap((pedido: { attributes?: { itens?: unknown } }) =>
		parsePedidoItens(pedido.attributes?.itens),
	)
	await syncTemplateDataForPedidoItems(items)
}

export function enqueueTemplateDataSyncForBusiness(
	businessId: string | number,
): void {
	const id = String(businessId).trim()
	if (!id) return
	void syncTemplateDataForBusinessId(id).catch((error) => {
		console.error(
			`templateData sync failed for business ${id}:`,
			error instanceof Error ? error.message : error,
		)
	})
}

export function enqueueTemplateDataSyncForPedidoItems(itens: unknown): void {
	void syncTemplateDataForPedidoItems(itens).catch((error) => {
		console.error(
			"templateData sync failed for pedido items:",
			error instanceof Error ? error.message : error,
		)
	})
}
