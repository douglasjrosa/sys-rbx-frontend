import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

export default async function PostTabelaPreco (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method !== "POST" ) {
		return res.status( 405 ).send( { message: "Only POST requests are allowed" } )
	}

	const { itens, empresaId, userId } = req.body
	const token = process.env.ATORIZZATION_TOKEN

	const axiosInstance = axios.create( {
		baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${ token }`,
		},
	} )

	try {
		const response = await axiosInstance.post( "/tabela-precos", {
			data: {
				itens,
				empresa: empresaId,
				user: userId,
			},
		} )

		res.status( 200 ).json( response.data )
	} catch ( error: any ) {
		console.error( "Error creating tabela-preco:", error?.response?.data || error )
		res.status( 500 ).json( {
			error: error?.response?.data || "Internal server error",
		} )
	}
}
