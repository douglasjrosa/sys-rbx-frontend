import { normalizeBlingApiV3Endpoint } from '@/pages/api/bling'

export type RefreshedBlingToken = {
	access_token: string
	expires_in: string | number
	refresh_token: string
}

export async function refreshOAuthToken (
	client_id: string,
	client_secret: string,
	refresh_token: string
): Promise<RefreshedBlingToken> {
	const url = normalizeBlingApiV3Endpoint(
		process.env.BLING_API_TOKEN_ENDPOINT as string | undefined
	)
	if ( !url ) {
		throw new Error( 'BLING_API_TOKEN_ENDPOINT is not configured' )
	}

	const credentials = Buffer
		.from( `${ client_id }:${ client_secret }` )
		.toString( 'base64' )

	const response = await fetch( url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Basic ${ credentials }`,
		},
		body: JSON.stringify( {
			grant_type: 'refresh_token',
			refresh_token,
		} ),
	} )

	const data = await response.json().catch( () => ( {} ) )
	if ( !response.ok || !data?.access_token ) {
		const description = data?.error?.description
			|| data?.error?.message
			|| 'Failed to refresh Bling OAuth token'
		throw new Error( description )
	}

	return data as RefreshedBlingToken
}
