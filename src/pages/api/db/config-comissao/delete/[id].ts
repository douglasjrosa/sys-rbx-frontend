import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method !== "DELETE" ) {
		return res.status( 405 ).json( { message: "Only DELETE requests are allowed" } )
	}

	try {
		const token = process.env.ATORIZZATION_TOKEN
		const { id } = req.query

		if ( !id ) {
			return res.status( 400 ).json( { message: "id is required" } )
		}

		await axios.delete(
			`${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/config-comissaos/${ id }`,
			{
				headers: {
					Authorization: `Bearer ${ token }`,
					"Content-Type": "application/json",
				},
			}
		)

		return res.status( 200 ).json( { success: true } )
	} catch ( error: any ) {
		const status = error.response?.status || 500
		const data = error.response?.data || { message: "Internal Server Error" }
		return res.status( status ).json( data )
	}
}
