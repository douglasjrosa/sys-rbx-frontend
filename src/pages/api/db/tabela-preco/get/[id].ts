import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

export default async function GetTabelaPrecoById (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method !== "GET" ) {
		return res.status( 405 ).send( { message: "Only GET requests are allowed" } )
	}

	const id = req.query.id
	if ( !id || Array.isArray( id ) ) {
		return res.status( 400 ).send( { message: "Missing or invalid id" } )
	}

	const token = process.env.ATORIZZATION_TOKEN
	const url = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/tabela-precos/${ id }?populate=*`

	try {
		const response = await axios.get( url, {
			headers: { Authorization: `Bearer ${ token }` },
		} )
		const item = response.data?.data
		if ( !item ) {
			return res.status( 404 ).json( { error: "Tabela de preço não encontrada" } )
		}
		res.status( 200 ).json( {
			id: item.id,
			createdAt: item.attributes?.createdAt,
			obs: item.attributes?.obs ?? "",
			itens: item.attributes?.itens ?? [],
			empresa: item.attributes?.empresa?.data,
			user: item.attributes?.user?.data,
		} )
	} catch ( error: any ) {
		console.error( "Error fetching tabela-preco:", error?.response?.data || error )
		res.status( 500 ).json( {
			error: error?.response?.data || "Internal server error",
		} )
	}
}
