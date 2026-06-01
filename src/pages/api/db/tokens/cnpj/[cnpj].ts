import type { NextApiRequest, NextApiResponse } from "next"
import axios from "axios"
import { requireAdminSession } from "../lib/requireAdmin"

export default async function handler (
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireAdminSession( req, res )
	if ( !session ) return

	if ( req.method !== "GET" ) {
		return res.status( 405 ).json( { message: "Only GET requests are allowed" } )
	}

	const { cnpj } = req.query
	if ( !cnpj || Array.isArray( cnpj ) ) {
		return res.status( 400 ).json( { message: "CNPJ is required" } )
	}

	try {
		const strapiToken = process.env.ATORIZZATION_TOKEN
		const url = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/tokens`
			+ `?filters[cnpj][$eq]=${ encodeURIComponent( cnpj ) }`
		const response = await axios.get( url, {
			headers: {
				Authorization: `Bearer ${ strapiToken }`,
				"Content-Type": "application/json",
			},
		} )
		const [ token ] = response.data?.data ?? []
		if ( !token ) {
			return res.status( 404 ).json( { message: "Token not found" } )
		}
		return res.status( 200 ).json( { data: token } )
	} catch ( error: any ) {
		console.error( "[tokens GET cnpj]", error?.message || error )
		return res.status( 500 ).json( {
			message: error?.response?.data?.error?.message || "Internal Server Error",
		} )
	}
}
