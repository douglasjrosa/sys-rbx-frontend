import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

export default async function PostUser (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method === "DELETE" ) {
		try {
			const id = req.query.id
			const url = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/config-vendas/${ id }`
			const Token: any = process.env.ATORIZZATION_TOKEN
			const Response = await axios( url, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${ Token }`,
					"Content-Type": "application/json",
				},
			} )
			const resposta = Response.data.data
			res.status( 200 ).json( resposta )
		} catch ( error: any ) {
			res.status( 400 ).json( error )
			console.error( error.response.data?.error )
			console.error( error.response.data?.error.details )
		}
	} else {
		res.status( 405 ).json( { message: "Only DELETE requests are allowed" } )
	}
}
