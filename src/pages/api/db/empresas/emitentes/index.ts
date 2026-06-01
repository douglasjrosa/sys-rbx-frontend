import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { normalizeCnpj } from "@/utils/blingOAuth"

/**
 * Returns empresas marked as emitente (isEmitente = true).
 * Includes defaultEmitenteId from the Token with mainAccount = true.
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

		const [ empresasRes, tokensRes ] = await Promise.all( [
			axios.get(
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
			),
			axios.get(
				`${ baseUrl }/tokens?filters[mainAccount][$eq]=true`
				+ "&pagination[pageSize]=1"
				+ "&fields[0]=cnpj&fields[1]=mainAccount",
				{
					headers: {
						Authorization: `Bearer ${ token }`,
						"Content-Type": "application/json",
					},
				}
			),
		] )

		const data = empresasRes.data?.data ?? []
		const mainTokenCnpj = normalizeCnpj(
			tokensRes.data?.data?.[0]?.attributes?.cnpj ?? ""
		)

		let defaultEmitenteId: number | null = null
		if ( mainTokenCnpj ) {
			const match = data.find(
				( empresa: { attributes?: { CNPJ?: string } } ) => (
					normalizeCnpj( empresa.attributes?.CNPJ ?? "" ) === mainTokenCnpj
				)
			)
			defaultEmitenteId = match?.id ?? null
		}

		return res.status( 200 ).json( { data, defaultEmitenteId } )
	} catch ( error: any ) {
		console.error( "[empresas/emitentes]", error?.message || error )
		return res.status( 500 ).json( {
			message: error?.response?.data?.error?.message || "Internal Server Error",
		} )
	}
}
