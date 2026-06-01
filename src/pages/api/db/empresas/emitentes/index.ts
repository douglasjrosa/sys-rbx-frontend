import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

/**
 * Returns empresas marked as emitente (isEmitente = true).
 * Used by proposal EmitenteSelect and seller profile form.
 */
export default async function handler (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method !== "GET" ) {
		return res.status( 405 ).json( { message: "Only GET requests are allowed" } )
	}

	try {
		const token = process.env.ATORIZZATION_TOKEN
		const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL

		const empresasRes = await axios.get(
			`${ baseUrl }/empresas?filters[isEmitente][$eq]=true`
			+ "&pagination[pageSize]=100"
			+ "&fields[0]=nome&fields[1]=razao&fields[2]=CNPJ"
			+ "&sort[0]=razao:asc",
			{
				headers: {
					Authorization: `Bearer ${ token }`,
					"Content-Type": "application/json",
				},
			}
		)

		const data = empresasRes.data?.data ?? []
		return res.status( 200 ).json( { data } )
	} catch ( error: any ) {
		console.error( "[empresas/emitentes]", error?.message || error )
		return res.status( 500 ).json( {
			message: error?.response?.data?.error?.message || "Internal Server Error",
		} )
	}
}
