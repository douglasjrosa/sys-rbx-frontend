import { POST_Strapi } from "@/pages/api/lib/request_strapi/post"
import { NextApiRequest, NextApiResponse } from "next"

export default async function SyncProdutos (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> {
	if ( req.method !== "POST" ) {
		return res.status( 405 ).send( { message: "Only POST requests are allowed" } )
	}

	try {
		const { empresaId, produtos, deleteMissing, keepProdIds } = req.body
		const url = `/produtos/sync`
		const payload: Record<string, unknown> = { empresaId, produtos: produtos || [] }
		if ( deleteMissing !== undefined ) payload.deleteMissing = deleteMissing
		if ( Array.isArray( keepProdIds ) ) payload.keepProdIds = keepProdIds

		const response = await POST_Strapi( payload, url )

		res.status( 200 ).json( response )
	} catch ( error: any ) {
		console.error( "Error in SyncProdutos proxy:", error?.response?.data || error.message )

		res.status( error?.response?.status || 400 ).json( {
			error: error?.response?.data?.error || error.message || "Unknown error"
		} )
	}
}
