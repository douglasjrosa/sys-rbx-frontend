import axios from "axios"

const STRAPI_TOKEN = () => process.env.ATORIZZATION_TOKEN as string
const STRAPI_BASE = () => `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/tokens`

const headers = () => ( {
	Authorization: `Bearer ${ STRAPI_TOKEN() }`,
	"Content-Type": "application/json",
} )

export async function findTokenIdByCnpj ( cnpj: string ): Promise<number | null> {
	const digits = String( cnpj ).replace( /\D/g, "" )
	const url = `${ STRAPI_BASE() }?filters[cnpj][$eq]=${ encodeURIComponent( digits ) }`
	const response = await axios.get( url, { headers: headers() } )
	const first = response.data?.data?.[0]
	return first?.id ?? null
}

export async function getTokenById ( id: string | number ) {
	const response = await axios.get( `${ STRAPI_BASE() }/${ id }`, {
		headers: headers(),
	} )
	return response.data
}

export function parseRequestBody ( body: unknown ): Record<string, unknown> {
	if ( typeof body === "string" ) {
		return JSON.parse( body )
	}
	if ( body && typeof body === "object" ) {
		return body as Record<string, unknown>
	}
	return {}
}

export function normalizeTokenData (
	data: Record<string, unknown>
): Record<string, unknown> {
	const cnpj = String( data.cnpj ?? "" ).replace( /\D/g, "" )
	if ( !cnpj ) {
		throw new Error( "CNPJ is required" )
	}
	return {
		...data,
		cnpj,
		account: cnpj,
	}
}

export async function createToken ( data: Record<string, unknown> ) {
	const normalized = normalizeTokenData( data )
	const response = await axios.post(
		STRAPI_BASE(),
		{ data: normalized },
		{ headers: headers() }
	)
	return response.data
}

export async function updateTokenById (
	id: string | number,
	data: Record<string, unknown>
) {
	const normalized = normalizeTokenData( data )
	const response = await axios.put(
		`${ STRAPI_BASE() }/${ id }`,
		{ data: normalized },
		{ headers: headers() }
	)
	return response.data
}

export async function deleteTokenById ( id: string | number ) {
	const response = await axios.delete( `${ STRAPI_BASE() }/${ id }`, {
		headers: headers(),
	} )
	return response.data
}

export async function upsertTokenByCnpj ( data: Record<string, unknown> ) {
	const normalized = normalizeTokenData( data )
	const existingId = await findTokenIdByCnpj( normalized.cnpj as string )
	if ( existingId ) {
		return updateTokenById( existingId, normalized )
	}
	return createToken( normalized )
}
