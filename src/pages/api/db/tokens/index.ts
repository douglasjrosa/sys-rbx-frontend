import type { NextApiRequest, NextApiResponse } from "next"
import axios from "axios"
import { requireAdminSession } from "./lib/requireAdmin"
import {
	createToken,
	parseRequestBody,
	upsertTokenByCnpj,
} from "./lib/strapiTokenClient"

export default async function handler (
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireAdminSession( req, res )
	if ( !session ) return

	const strapiToken = process.env.ATORIZZATION_TOKEN
	const baseUrl = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/tokens`

	if ( req.method === "GET" ) {
		try {
			const response = await axios.get(
				`${ baseUrl }?pagination[pageSize]=100&sort[0]=account:asc`,
				{
					headers: {
						Authorization: `Bearer ${ strapiToken }`,
						"Content-Type": "application/json",
					},
				}
			)
			return res.status( 200 ).json( response.data )
		} catch ( error: any ) {
			console.error( "[tokens GET]", error?.message || error )
			return res.status( 500 ).json( {
				message: error?.response?.data?.error?.message || "Internal Server Error",
			} )
		}
	}

	if ( req.method === "POST" ) {
		try {
			const payload = parseRequestBody( req.body )
			const data = ( payload.data ?? payload ) as Record<string, unknown>
			if ( !data.cnpj || !data.account ) {
				return res.status( 400 ).json( {
					message: "cnpj and account are required",
				} )
			}
			const result = await upsertTokenByCnpj( data )
			return res.status( 200 ).json( result )
		} catch ( error: any ) {
			console.error( "[tokens POST]", error?.message || error )
			return res.status( 500 ).json( {
				message: error?.response?.data?.error?.message || "Internal Server Error",
			} )
		}
	}

	return res.status( 405 ).json( { message: "Method not allowed" } )
}
