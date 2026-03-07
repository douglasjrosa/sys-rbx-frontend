import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method !== "GET" ) {
		return res.status( 405 ).json( { message: "Only GET requests are allowed" } )
	}

	try {
		const token = process.env.ATORIZZATION_TOKEN
		const { userId } = req.query

		if ( !userId ) {
			return res.status( 400 ).json( { message: "userId is required" } )
		}

		const url = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/config-comissaos?filters[user][id][$eq]=${ userId }&sort[0]=ano:desc&sort[1]=mes:desc`
		const response = await axios.get( url, {
			headers: {
				Authorization: `Bearer ${ token }`,
				"Content-Type": "application/json",
			},
		} )

		const data = response.data?.data || []
		return res.status( 200 ).json( data )
	} catch ( error: any ) {
		const status = error.response?.status || 500
		const data = error.response?.data || { message: "Internal Server Error" }
		return res.status( status ).json( data )
	}
}
