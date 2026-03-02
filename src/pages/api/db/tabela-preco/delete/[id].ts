import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

export default async function DeleteTabelaPreco (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method !== "DELETE" ) {
		return res.status( 405 ).send( { message: "Only DELETE requests are allowed" } )
	}

	const id = req.query.id
	if ( !id || Array.isArray( id ) ) {
		return res.status( 400 ).send( { message: "Missing or invalid id" } )
	}

	const token = process.env.ATORIZZATION_TOKEN

	try {
		await axios.delete( `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/tabela-precos/${ id }`, {
			headers: {
				Authorization: `Bearer ${ token }`,
				"Content-Type": "application/json",
			},
		} )
		res.status( 200 ).json( { success: true } )
	} catch ( error: any ) {
		console.error( "Error deleting tabela-preco:", error?.response?.data || error )
		res.status( 500 ).json( {
			error: error?.response?.data || "Internal server error",
		} )
	}
}
