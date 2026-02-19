function getBaseUrl (): string {
	const url = process.env.NEXT_PUBLIC_BASE_URL || `https://${ process.env.NEXT_PUBLIC_VERCEL_URL }`
	if ( process.env.NODE_ENV === 'development' && url?.includes( 'localhost' ) ) {
		return url.replace( /^https:/, 'http:' )
	}
	return url
}

export const blingApiEndpoint = process.env.BLING_API_V3_ENDPOINT as string

export async function refreshToken (
	client_id: string,
	client_secret: string,
	refresh_token: string
) {
	const newToken = await fetch( `${ getBaseUrl() }/api/bling/auth/refresh`, {
		method: "POST",
		body: JSON.stringify( { client_id, client_secret, refresh_token } )
	} ).then( r => r.json() )

	if ( !newToken.hasOwnProperty( "access_token" ) ) {
		console.error( { newToken } )
		throw new Error( "Ocorreu um erro ao revalidar o Token na API do Bling" )
	}
	return newToken
}

export async function updateToken (
	id: string,
	access_token: string,
	expires_in: string,
	refresh_token: string
) {

		await fetch( `${ getBaseUrl() }/api/db/tokens/bling/update`, {
		method: "PUT",
		body: JSON.stringify( { id, access_token, expires_in, refresh_token } )
	} ).then( r => r.json() )

	return access_token
}

export async function getBlingToken ( account: string ): Promise<string> {
	const res = await fetch( `${ getBaseUrl() }/api/bling/auth?account=${ account }` )
	const data = await res.json()
	if ( !res.ok ) {
		throw new Error( data?.message || `Failed to get Bling token for account ${ account }` )
	}
	if ( typeof data !== 'string' ) {
		throw new Error( 'Invalid token response: expected string' )
	}
	return data
}