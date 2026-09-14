import axios from "axios"

const STRAPI_TIMEOUT_MS = 12_000

export type BoxTemplateData = {
	prodId: number
	empresaNome: string
	boxName: string
	subtasks: unknown[]
}

export type StrapiProductRow = {
	id: number
	prodId: number
	templateData: unknown
}

function strapiHeaders() {
	return {
		Authorization: `Bearer ${process.env.ATORIZZATION_TOKEN}`,
		"Content-Type": "application/json",
	}
}

export function normalizeTemplateData(value: unknown): unknown {
	if (value == null) return null
	if (typeof value === "string") {
		const trimmed = value.trim()
		if (!trimmed || trimmed === "null") return null
		try {
			return JSON.parse(trimmed)
		} catch {
			return null
		}
	}
	return value
}

export function isBoxTemplateData(value: unknown): value is BoxTemplateData {
	const normalized = normalizeTemplateData(value)
	if (!normalized || typeof normalized !== "object" || Array.isArray(normalized)) {
		return false
	}
	const row = normalized as Record<string, unknown>
	return (
		Number.isFinite(Number(row.prodId)) &&
		typeof row.empresaNome === "string" &&
		typeof row.boxName === "string" &&
		Array.isArray(row.subtasks)
	)
}

export function toBoxTemplateData(value: unknown): BoxTemplateData | null {
	const normalized = normalizeTemplateData(value)
	if (!isBoxTemplateData(normalized)) return null
	return {
		...(normalized as BoxTemplateData),
		prodId: Number((normalized as BoxTemplateData).prodId),
	}
}

function buildProductQuery(
	prodId: number,
	empresaId?: number | null,
	publicationState?: "live" | "preview",
): string {
	let url =
		`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/produtos` +
		`?filters[prodId][$eq]=${prodId}` +
		`&fields[0]=prodId&fields[1]=templateData` +
		`&pagination[limit]=1`
	if (empresaId) {
		url += `&filters[empresa][id][$eq]=${empresaId}`
	}
	if (publicationState) {
		url += `&publicationState=${publicationState}`
	}
	return url
}

export async function findStrapiProductByProdId(
	prodId: number,
	empresaId?: number | null,
): Promise<StrapiProductRow | null> {
	for (const publicationState of ["live", "preview"] as const) {
		const response = await axios({
			method: "GET",
			url: buildProductQuery(prodId, empresaId, publicationState),
			headers: strapiHeaders(),
			timeout: STRAPI_TIMEOUT_MS,
		})
		const row = response.data?.data?.[0]
		if (!row?.id) continue
		const attrs = row.attributes ?? row
		const templateData = normalizeTemplateData(attrs.templateData ?? null)
		if (isBoxTemplateData(templateData) || publicationState === "preview") {
			return {
				id: Number(row.id),
				prodId: Number(attrs.prodId ?? prodId),
				templateData,
			}
		}
	}
	return null
}

export async function saveTemplateDataOnStrapiProduct(
	strapiProductId: number,
	templateData: BoxTemplateData,
): Promise<void> {
	await axios({
		method: "PUT",
		url: `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/produtos/${strapiProductId}`,
		headers: strapiHeaders(),
		data: {
			data: {
				templateData,
				publishedAt: new Date().toISOString(),
			},
		},
		timeout: STRAPI_TIMEOUT_MS,
	})
}
