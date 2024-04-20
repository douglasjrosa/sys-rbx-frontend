
export async function refreshToken (
	client_id: string,
	client_secret: string,
	refresh_token: string
) {
	const newToken = await fetch( "https://localhost:3000/api/bling/auth/refresh", {
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

	await fetch( "https://localhost:3000/api/db/tokens/bling/update", {
		method: "PUT",
		body: JSON.stringify( { id, access_token, expires_in, refresh_token } )
	} ).then( r => r.json() )

	return access_token
}

export async function getBlingToken ( account: string ) {
	return await fetch( `/api/bling/auth?account=${ account }` ).then( r => r.json() ).then( ( access_token: string | any ) => {
		if ( typeof access_token !== "string" ) {
			console.error( { access_token } )
			throw new Error( "Erro ao tentar obter o access_token" )
		}
		return access_token
	} )
}