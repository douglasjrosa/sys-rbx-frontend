import { DELETE_Strapi } from "@/pages/api/lib/request_strapi/delete"
import { NextApiRequest, NextApiResponse } from "next"

export default async function DeleteProduto (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> {
	if ( req.method !== "DELETE" ) {
		return res.status( 405 ).send( { message: "Only DELETE requests are allowed" } )
	}

	try {
		const { id } = req.query

		if ( !id ) {
			return res.status( 400 ).json( { error: "ID is required" } )
		}

		const response = await DELETE_Strapi( `/produtos/${ id }` )

		res.status( 200 ).json( response )
	} catch ( error: any ) {
		// 404 = product not found in Strapi (already deleted or never synced) - treat as success
		if ( error?.response?.status === 404 ) {
			return res.status( 200 ).json( { deleted: false, message: "Product not found in Strapi (already removed or not synced)" } )
		}

		console.error( "Error in DeleteProduto proxy:", error?.response?.data || error.message )

		res.status( error?.response?.status || 400 ).json( {
			error: error?.response?.data?.error || error.message || "Unknown error"
		} )
	}
}
