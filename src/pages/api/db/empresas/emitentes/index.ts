import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

/**
 * Returns empresas that are in the emitente group (CNPJs from tokens).
 * Same logic as /negocios/proposta/[id] EmitenteSelect - lists only emitter companies.
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

		const tokensRes = await axios.get( `${ baseUrl }/tokens?pagination[pageSize]=100&fields[0]=cnpj&fields[1]=account`, {
			headers: {
				Authorization: `Bearer ${ token }`,
				"Content-Type": "application/json",
			},
		} )

		const tokens = tokensRes.data?.data ?? []
		const cnpjList = tokens
			.map( ( t: any ) => t.attributes?.cnpj )
			.filter( ( c: string ) => c && String( c ).trim() )
		const uniqueCnpjs = [ ...new Set( cnpjList ) ] as string[]

		if ( uniqueCnpjs.length === 0 ) {
			return res.status( 200 ).json( { data: [] } )
		}

		const filterParams = uniqueCnpjs
			.map( ( c, i ) => `filters[CNPJ][$in][${ i }]=${ encodeURIComponent( c ) }` )
			.join( "&" )
		const empresasRes = await axios.get(
			`${ baseUrl }/empresas?${ filterParams }&pagination[pageSize]=50&fields[0]=nome&fields[1]=razao&fields[2]=CNPJ`,
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
