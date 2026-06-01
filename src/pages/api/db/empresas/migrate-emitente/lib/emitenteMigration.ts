import axios from "axios"
import { normalizeCnpj } from "@/utils/blingOAuth"

export const EMITENTE_MIGRATION_BATCH_SIZE = 20
export const EMITENTE_MIGRATION_REQUEST_SIZE = 1

const INDEX_CACHE_TTL_MS = 5 * 60 * 1000

const strapiHeaders = () => ( {
	Authorization: `Bearer ${ process.env.ATORIZZATION_TOKEN }`,
	"Content-Type": "application/json",
} )

const strapiBase = () => process.env.NEXT_PUBLIC_STRAPI_API_URL as string

export type MigrationResultStatus =
	| "updated_from_business"
	| "updated_from_main_account"
	| "skipped_already_set"
	| "error"

export interface MigrationItemResult {
	empresaId: number
	nome: string
	status: MigrationResultStatus
	emitenteId?: number
	emitenteLabel?: string
	businessId?: number
	message?: string
}

export interface MigrationBatchResult {
	processed: number
	updated: number
	skipped: number
	errors: number
	results: MigrationItemResult[]
}

interface StrapiEmpresa {
	id: number
	attributes?: {
		nome?: string
		CNPJ?: string
		isEmitente?: boolean
		empresaEmitente?: { data?: { id?: number } | null }
	}
}

export interface EmitenteIndex {
	ids: Set<number>
	cnpjToId: Map<string, number>
	labels: Map<number, string>
	mainAccountEmpresaId: number | null
}

let cachedEmitenteIndex: {
	index: EmitenteIndex
	expiresAt: number
} | null = null

async function strapiGet<T> ( path: string ): Promise<T> {
	try {
		const response = await axios.get( `${ strapiBase() }/${ path }`, {
			headers: strapiHeaders(),
			timeout: 25000,
		} )
		return response.data
	} catch ( error: unknown ) {
		if ( axios.isAxiosError( error ) ) {
			const strapiMessage = error.response?.data?.error?.message
			throw new Error(
				strapiMessage || error.message || "Strapi request failed"
			)
		}
		throw error
	}
}

async function strapiPut ( path: string, data: Record<string, unknown> ) {
	const response = await axios.put(
		`${ strapiBase() }/${ path }`,
		{ data },
		{ headers: strapiHeaders(), timeout: 25000 }
	)
	return response.data
}

function getEmpresaLabel ( attrs?: StrapiEmpresa["attributes"] ): string {
	return attrs?.nome || attrs?.CNPJ || "Empresa"
}

async function buildEmitenteIndex (): Promise<EmitenteIndex> {
	const [ empresasRes, tokensRes ] = await Promise.all( [
		strapiGet<{ data: StrapiEmpresa[] }>(
			"empresas?filters[isEmitente][$eq]=true"
			+ "&pagination[pageSize]=100"
			+ "&fields[0]=nome&fields[1]=razao&fields[2]=CNPJ"
		),
		strapiGet<{ data: Array<{ attributes?: { cnpj?: string } }> }>(
			"tokens?filters[mainAccount][$eq]=true"
			+ "&pagination[pageSize]=1"
			+ "&fields[0]=cnpj"
		),
	] )

	const empresas = empresasRes.data ?? []
	const ids = new Set<number>()
	const cnpjToId = new Map<string, number>()
	const labels = new Map<number, string>()

	for ( const empresa of empresas ) {
		ids.add( empresa.id )
		const cnpj = normalizeCnpj( empresa.attributes?.CNPJ ?? "" )
		if ( cnpj ) cnpjToId.set( cnpj, empresa.id )
		const label = empresa.attributes?.nome
			|| ( empresa.attributes as { razao?: string } )?.razao
			|| cnpj
			|| String( empresa.id )
		labels.set( empresa.id, label )
	}

	const mainTokenCnpj = normalizeCnpj(
		tokensRes.data?.[0]?.attributes?.cnpj ?? ""
	)
	const mainAccountEmpresaId = mainTokenCnpj
		? cnpjToId.get( mainTokenCnpj ) ?? null
		: null

	return { ids, cnpjToId, labels, mainAccountEmpresaId }
}

export async function getEmitenteIndex (): Promise<EmitenteIndex> {
	if ( cachedEmitenteIndex && Date.now() < cachedEmitenteIndex.expiresAt ) {
		return cachedEmitenteIndex.index
	}

	const index = await buildEmitenteIndex()
	cachedEmitenteIndex = {
		index,
		expiresAt: Date.now() + INDEX_CACHE_TTL_MS,
	}
	return index
}

export async function fetchPendingClientIds (): Promise<number[]> {
	const ids: number[] = []
	let page = 1

	while ( true ) {
		const response = await strapiGet<{
			data: StrapiEmpresa[]
			meta?: { pagination?: { pageCount?: number } }
		}>(
			"empresas?filters[empresaEmitente][id][$null]=true"
			+ "&filters[$or][0][isEmitente][$eq]=false"
			+ "&filters[$or][1][isEmitente][$null]=true"
			+ "&fields[0]=id"
			+ "&sort[0]=id:asc"
			+ `&pagination[page]=${ page }`
			+ "&pagination[pageSize]=100"
		)

		const batch = response.data ?? []
		if ( !batch.length ) break

		ids.push( ...batch.map( ( item ) => item.id ) )

		const pageCount = response.meta?.pagination?.pageCount ?? page
		if ( page >= pageCount ) break
		page += 1
	}

	return ids
}

export function buildMigrationBatches ( empresaIds: number[] ) {
	const batches: Array<{
		index: number
		label: string
		range: string
		empresaIds: number[]
	}> = []

	for ( let i = 0; i < empresaIds.length; i += EMITENTE_MIGRATION_BATCH_SIZE ) {
		const chunk = empresaIds.slice( i, i + EMITENTE_MIGRATION_BATCH_SIZE )
		const start = i + 1
		const end = i + chunk.length
		batches.push( {
			index: batches.length,
			label: `Lote ${ batches.length + 1 }`,
			range: `${ start }–${ end }`,
			empresaIds: chunk,
		} )
	}

	return batches
}

async function resolveEmitenteFromBusiness (
	empresaId: number,
	cnpjToId: Map<string, number>
): Promise<{ emitenteId: number | null; businessId: number | null }> {
	const response = await strapiGet<{
		data: Array<{
			id: number
			attributes?: {
				pedidos?: {
					data?: Array<{
						attributes?: {
							updatedAt?: string
							fornecedor?: string
							fornecedorId?: {
								data?: { id?: number } | null
							}
						}
					}>
				}
			}
		}>
	}>(
		"businesses?filters[empresa][id][$eq]=" + empresaId
		+ "&sort[0]=updatedAt:desc"
		+ "&pagination[pageSize]=1"
		+ "&fields[0]=updatedAt"
		+ "&populate[pedidos][populate][0]=fornecedorId"
		+ "&populate[pedidos][fields][0]=fornecedor"
		+ "&populate[pedidos][fields][1]=updatedAt"
	)

	const business = response.data?.[0]
	if ( !business ) {
		return { emitenteId: null, businessId: null }
	}

	const pedidos = business.attributes?.pedidos?.data ?? []
	if ( !pedidos.length ) {
		return { emitenteId: null, businessId: business.id }
	}

	const sortedPedidos = [ ...pedidos ].sort( ( a, b ) => {
		const aTime = new Date( a.attributes?.updatedAt ?? 0 ).getTime()
		const bTime = new Date( b.attributes?.updatedAt ?? 0 ).getTime()
		return bTime - aTime
	} )

	for ( const pedido of sortedPedidos ) {
		const relationId = pedido.attributes?.fornecedorId?.data?.id
		if ( relationId ) {
			return { emitenteId: relationId, businessId: business.id }
		}

		const cnpj = normalizeCnpj( pedido.attributes?.fornecedor ?? "" )
		if ( cnpj ) {
			const matchId = cnpjToId.get( cnpj )
			if ( matchId ) {
				return { emitenteId: matchId, businessId: business.id }
			}
		}
	}

	return { emitenteId: null, businessId: business.id }
}

function resolveTargetEmitenteId (
	candidateId: number | null,
	index: EmitenteIndex
): number | null {
	if ( candidateId && index.ids.has( candidateId ) ) {
		return candidateId
	}
	return index.mainAccountEmpresaId
}

export async function migrateSingleEmpresa (
	empresaId: number,
	index: EmitenteIndex
): Promise<MigrationItemResult> {
	try {
		const empresaRes = await strapiGet<{ data: StrapiEmpresa }>(
			`empresas/${ empresaId }`
			+ "?fields[0]=nome&fields[1]=CNPJ&fields[2]=isEmitente"
			+ "&populate[empresaEmitente][fields][0]=id"
		)
		const empresa = empresaRes.data

		if ( !empresa ) {
			return {
				empresaId,
				nome: String( empresaId ),
				status: "error",
				message: "Empresa not found",
			}
		}

		if ( empresa.attributes?.isEmitente ) {
			return {
				empresaId,
				nome: getEmpresaLabel( empresa.attributes ),
				status: "skipped_already_set",
				message: "Empresa is an emitente",
			}
		}

		if ( empresa.attributes?.empresaEmitente?.data?.id ) {
			return {
				empresaId,
				nome: getEmpresaLabel( empresa.attributes ),
				status: "skipped_already_set",
				message: "empresaEmitente already set",
			}
		}

		const { emitenteId: businessEmitenteId, businessId } =
			await resolveEmitenteFromBusiness( empresaId, index.cnpjToId )

		const targetEmitenteId = resolveTargetEmitenteId(
			businessEmitenteId,
			index
		)

		if ( !targetEmitenteId ) {
			return {
				empresaId,
				nome: getEmpresaLabel( empresa.attributes ),
				status: "error",
				businessId: businessId ?? undefined,
				message: "Could not resolve target emitente",
			}
		}

		await strapiPut( `empresas/${ empresaId }`, {
			empresaEmitente: targetEmitenteId,
		} )

		const usedMainAccount = businessEmitenteId == null
			|| !index.ids.has( businessEmitenteId )

		return {
			empresaId,
			nome: getEmpresaLabel( empresa.attributes ),
			status: usedMainAccount
				? "updated_from_main_account"
				: "updated_from_business",
			emitenteId: targetEmitenteId,
			emitenteLabel: index.labels.get( targetEmitenteId ),
			businessId: businessId ?? undefined,
		}
	} catch ( error: unknown ) {
		const message = error instanceof Error ? error.message : "Unknown error"
		return {
			empresaId,
			nome: String( empresaId ),
			status: "error",
			message,
		}
	}
}

function summarizeResults (
	results: MigrationItemResult[]
): MigrationBatchResult {
	const updated = results.filter(
		( item ) =>
			item.status === "updated_from_business"
			|| item.status === "updated_from_main_account"
	).length
	const skipped = results.filter(
		( item ) => item.status === "skipped_already_set"
	).length
	const errors = results.filter( ( item ) => item.status === "error" ).length

	return {
		processed: results.length,
		updated,
		skipped,
		errors,
		results,
	}
}

export async function migrateEmpresaEmitenteBatch (
	empresaIds: number[]
): Promise<MigrationBatchResult> {
	const index = await getEmitenteIndex()

	if ( !index.mainAccountEmpresaId && index.ids.size === 0 ) {
		throw new Error(
			"No emitente companies or mainAccount token found for fallback."
		)
	}

	const results: MigrationItemResult[] = []
	for ( const empresaId of empresaIds ) {
		results.push( await migrateSingleEmpresa( empresaId, index ) )
	}

	return summarizeResults( results )
}
