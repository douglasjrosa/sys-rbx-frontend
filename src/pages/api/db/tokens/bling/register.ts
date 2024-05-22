import { NextApiRequest, NextApiResponse } from "next"

const strapiToken = process.env.ATORIZZATION_TOKEN
const strapiEndpoint = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/tokens`

const accountExists = async ( cnpj: string ): Promise<number> => {
	const filters = `/?filters[cnpj][$eq]=${ cnpj }`
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
	return searchAccount.data?.length > 0 ? searchAccount.data[0].id : 0
}

export default async function POST ( req: NextApiRequest, res: NextApiResponse ) {
	if ( req.method !== "POST" ) {
		res.status( 405 ).json( { error: "Método não permitido. Apenas POST é permitido." } )
		return
	}
	
	try {
		const data = JSON.parse( req.body )
		const accountId = await accountExists( data.data.cnpj )

		const method = accountId ? "PUT" : "POST"
		const strapiEndpointComplement = accountId ? `/${ accountId }` : ""
		
		const response = await fetch( strapiEndpoint + strapiEndpointComplement, {
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
