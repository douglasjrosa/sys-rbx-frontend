import type { NextApiRequest, NextApiResponse } from "next"
import { requireAdminSession } from "./lib/requireAdmin"
import {
	deleteTokenById,
	getTokenById,
	parseRequestBody,
	updateTokenById,
} from "./lib/strapiTokenClient"

export default async function handler (
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireAdminSession( req, res )
	if ( !session ) return

	const { id } = req.query
	if ( !id || Array.isArray( id ) ) {
		return res.status( 400 ).json( { message: "Token id is required" } )
	}

	if ( req.method === "GET" ) {
		try {
			const result = await getTokenById( id )
			return res.status( 200 ).json( result )
		} catch ( error: any ) {
			console.error( "[tokens GET id]", error?.message || error )
			return res.status( 500 ).json( {
				message: error?.response?.data?.error?.message || "Internal Server Error",
			} )
		}
	}

	if ( req.method === "PUT" ) {
		try {
			const payload = parseRequestBody( req.body )
			const data = ( payload.data ?? payload ) as Record<string, unknown>
			const result = await updateTokenById( id, data )
			return res.status( 200 ).json( result )
		} catch ( error: any ) {
			console.error( "[tokens PUT]", error?.message || error )
			return res.status( 500 ).json( {
				message: error?.response?.data?.error?.message || "Internal Server Error",
			} )
		}
	}

	if ( req.method === "DELETE" ) {
		try {
			const result = await deleteTokenById( id )
			return res.status( 200 ).json( result )
		} catch ( error: any ) {
			console.error( "[tokens DELETE]", error?.message || error )
			return res.status( 500 ).json( {
				message: error?.response?.data?.error?.message || "Internal Server Error",
			} )
		}
	}

	return res.status( 405 ).json( { message: "Method not allowed" } )
}
