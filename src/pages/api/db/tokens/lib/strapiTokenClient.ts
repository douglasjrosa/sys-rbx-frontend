import axios from "axios"

const STRAPI_TOKEN = () => process.env.ATORIZZATION_TOKEN as string
const STRAPI_BASE = () => `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/tokens`

const headers = () => ( {
	Authorization: `Bearer ${ STRAPI_TOKEN() }`,
	"Content-Type": "application/json",
} )

export async function findTokenIdByCnpj ( cnpj: string ): Promise<number | null> {
	const url = `${ STRAPI_BASE() }?filters[cnpj][$eq]=${ encodeURIComponent( cnpj ) }`
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

export async function createToken ( data: Record<string, unknown> ) {
	const response = await axios.post(
		STRAPI_BASE(),
		{ data },
		{ headers: headers() }
	)
	return response.data
}

export async function updateTokenById (
	id: string | number,
	data: Record<string, unknown>
) {
	const response = await axios.put(
		`${ STRAPI_BASE() }/${ id }`,
		{ data },
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
	const cnpj = data.cnpj as string | undefined
	if ( !cnpj ) {
		throw new Error( "CNPJ is required" )
	}
	const existingId = await findTokenIdByCnpj( cnpj )
	if ( existingId ) {
		return updateTokenById( existingId, data )
	}
	return createToken( data )
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
