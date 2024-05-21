import { NextApiRequest, NextApiResponse } from "next"

interface TokenData {
	id: string
	[ key: string ]: any // permite outros campos arbitrários
}

export default async function updateToken ( req: NextApiRequest, res: NextApiResponse ) {
	if ( req.method !== "PUT" ) {
		res.status( 405 ).json( { error: "Método não permitido. Apenas PUT é permitido." } )
		return
	}

	let data: TokenData
	try {
		data = JSON.parse( req.body )
	} catch ( error ) {
		res.status( 400 ).json( { error: "Corpo da requisição JSON inválido" } )
		return
	}

	if ( !data.id ) {
		res.status( 400 ).json( { error: "O campo 'id' é obrigatório" } )
		return
	}

	const strapiToken = process.env.ATORIZZATION_TOKEN
	if ( !strapiToken ) {
		res.status( 500 ).json( { error: "Token de autorização não configurado" } )
		return
	}

	const strapiEndpoint = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/tokens/${ data.id }`

	try {
		const response = await fetch( strapiEndpoint, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${ strapiToken }`,
			},
			body: JSON.stringify( { data } ),
		} )

		if ( !response.ok ) {
			const errorData = await response.json()
			res.status( response.status ).json( { error: errorData } )
			return
		}

		const result = await response.json()
		res.status( 200 ).json( result )
	} catch ( error ) {
		console.error( "Erro:", error )
		res.status( 500 ).json( { error: "Erro ao atualizar o token" } )
	}
}
