import { NextApiRequest, NextApiResponse } from "next"
import axios from "axios"

export default async function GetSyncList (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method !== "GET" ) {
		return res.status( 405 ).send( { message: "Only GET requests are allowed" } )
	}

	try {
		const { limit = 50, start = 0 } = req.query
		const token = process.env.ATORIZZATION_TOKEN
		const url = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/empresas?fields[0]=id&fields[1]=CNPJ&fields[2]=nome&pagination[limit]=${ limit }&pagination[start]=${ start }&filters[status][$eq]=true`

		const response = await axios.get( url, {
			headers: {
				Authorization: `Bearer ${ token }`,
				"Content-Type": "application/json",
			},
		} )

		res.status( 200 ).json( response.data )
	} catch ( error: any ) {
		console.error( "Error in GetSyncList proxy:", error?.response?.data || error.message )
		res.status( error?.response?.status || 400 ).json( error?.response?.data || error.message )
	}
}
