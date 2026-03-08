import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

export default async function PostUser (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method === "GET" ) {
		try {
			const id = req.query.id

			const populate = "populate[empresa_emitente][fields][0]=razao&populate[empresa_emitente][fields][1]=CNPJ&populate[empresa_emitente][fields][2]=nome"
			const url = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/users/${ id }?${ populate }`
			const Token: any = process.env.ATORIZZATION_TOKEN
			const Response = await axios( url, {
				method: "GET",
				data: req.body,
				headers: {
					Authorization: `Bearer ${ Token }`,
					"Content-Type": "application/json",
				},
			} )
			res.status( 200 ).json( Response.data )
		} catch ( error: any ) {
			res.status( 400 ).json( error.response.data?.error )
			console.error( error.response.data?.error )
			console.error( error.response.data?.error.details )
		}
	} else {
		res.status( 405 ).json( { message: "Only GET requests are allowed" } )
	}
}
