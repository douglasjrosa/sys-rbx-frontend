import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

export default async function PutTabelaPreco (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method !== "PUT" ) {
		return res.status( 405 ).send( { message: "Only PUT requests are allowed" } )
	}

	const id = req.query.id
	if ( !id || Array.isArray( id ) ) {
		return res.status( 400 ).send( { message: "Missing or invalid id" } )
	}

	const { itens, obs } = req.body
	const token = process.env.ATORIZZATION_TOKEN

	const axiosInstance = axios.create( {
		baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${ token }`,
		},
	} )

	const payload: Record<string, unknown> = {}
	if ( itens !== undefined ) payload.itens = itens
	if ( obs !== undefined ) payload.obs = obs

	try {
		const response = await axiosInstance.put( `/tabela-precos/${ id }`, {
			data: payload,
		} )
		res.status( 200 ).json( response.data )
	} catch ( error: any ) {
		console.error( "Error updating tabela-preco:", error?.response?.data || error )
		res.status( 500 ).json( {
			error: error?.response?.data || "Internal server error",
		} )
	}
}
