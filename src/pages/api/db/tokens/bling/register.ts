import { NextApiRequest, NextApiResponse } from "next"

const strapiToken = process.env.ATORIZZATION_TOKEN
const strapiEndpoint = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/tokens`

const accountExists = async ( account: string ): Promise<boolean> => {
	const filters = `/filters[account][$eq]=${ account }`
	const response = await fetch( strapiEndpoint + filters, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${ strapiToken }`,
		},
	} )

	if ( !response.ok ) {
		throw new Error( `Erro ao fazer a requisição. Status: ${ response.status }` )
	}

	const searchAccount = await response.json()
	return searchAccount.data.length > 0
}

export default async function POST ( req: NextApiRequest, res: NextApiResponse ) {
	if ( req.method !== "POST" ) {
		res.status( 405 ).json( { error: "Método não permitido. Apenas POST é permitido." } )
		return
	}

	try {
		const data = JSON.parse( req.body )
		const method = await accountExists( data.data.account ) ? "PUT" : "POST"

		const response = await fetch( strapiEndpoint, {
			method,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${ strapiToken }`,
			},
			body: JSON.stringify( data ),
		} )

		if ( !response.ok ) {
			throw new Error( `Erro ao registrar o token. Status: ${ response.status }` )
		}

		const result = await response.json()
		res.status( 200 ).json( result )
	} catch ( error ) {
		console.error( "Erro:", error )
		res.status( 500 ).json( { error: "Erro ao registrar o token" } )
	}
}
