
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL as string || `https://${ process.env.NEXT_PUBLIC_VERCEL_URL }`

export const blingApiEndpoint = process.env.BLING_API_V3_ENDPOINT as string

export async function refreshToken (
	client_id: string,
	client_secret: string,
	refresh_token: string
) {
	const newToken = await fetch( `${ baseUrl }/api/bling/auth/refresh`, {
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

	await fetch( `${ baseUrl }/api/db/tokens/bling/update`, {
		method: "PUT",
		body: JSON.stringify( { id, access_token, expires_in, refresh_token } )
	} ).then( r => r.json() )

	return access_token
}

export async function getBlingToken ( account: string ) {
	return await fetch( `${ baseUrl }/api/bling/auth?account=${ account }` ).then( r => r.json() )
}