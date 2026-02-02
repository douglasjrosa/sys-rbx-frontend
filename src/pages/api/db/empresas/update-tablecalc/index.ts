import { GET_Strapi } from "@/pages/api/lib/request_strapi/get"
import { NextApiRequest, NextApiResponse } from "next"

export default async function UpdateTableCalc (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> {
	if ( req.method !== "GET" ) {
		return res.status( 405 ).send( { message: "Only GET requests are allowed" } )
	}

	try {
		const { limit = 50, start = 0 } = req.query
		const url = `/update-tablecalc-all?limit=${ limit }&start=${ start }`

		const response = await GET_Strapi( url )

		res.status( 200 ).json( response )
	} catch ( error: any ) {
		console.error( "Error in UpdateTableCalc proxy:", error?.response?.data || error.message )

		res.status( error?.response?.status || 400 ).json( {
			error: error?.response?.data?.error || error.message || "Unknown error"
		} )
	}
}
