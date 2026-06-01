import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { requireAdminSession } from "../../tokens/lib/requireAdmin"

const TOKEN_FIELDS = [
	"client_id",
	"client_secret",
	"access_token",
	"refresh_token",
	"expires_in",
	"updatedAt",
	"cnpj",
	"mainAccount",
].join( "&fields[]=" )

export default async function handler (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method !== "GET" ) {
		return res.status( 405 ).json( { message: "Only GET requests are allowed" } )
	}

	const session = await requireAdminSession( req, res )
	if ( !session ) return

	try {
		const strapiToken = process.env.ATORIZZATION_TOKEN
		const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL

		const [ empresasRes, tokensRes ] = await Promise.all( [
			axios.get(
				`${ baseUrl }/empresas?filters[isEmitente][$eq]=true`
				+ "&pagination[pageSize]=100"
				+ "&fields[0]=nome&fields[1]=razao&fields[2]=CNPJ"
				+ "&sort[0]=razao:asc",
				{
					headers: {
						Authorization: `Bearer ${ strapiToken }`,
						"Content-Type": "application/json",
					},
				}
			),
			axios.get(
				`${ baseUrl }/tokens?pagination[pageSize]=100`
				+ `&fields[]=${ TOKEN_FIELDS }`,
				{
					headers: {
						Authorization: `Bearer ${ strapiToken }`,
						"Content-Type": "application/json",
					},
				}
			),
		] )

		const empresas = empresasRes.data?.data ?? []
		const tokens = tokensRes.data?.data ?? []

		const tokenByCnpj = new Map<string, ( typeof tokens )[0]>()
		for ( const token of tokens ) {
			const cnpj = token.attributes?.cnpj
			if ( cnpj ) tokenByCnpj.set( String( cnpj ), token )
		}

		const data = empresas.map( ( empresa: any ) => {
			const cnpj = empresa.attributes?.CNPJ ?? ""
			const matched = cnpj ? tokenByCnpj.get( String( cnpj ) ) : undefined

			return {
				id: empresa.id,
				attributes: {
					nome: empresa.attributes?.nome,
					razao: empresa.attributes?.razao,
					CNPJ: cnpj,
					token: matched
						? {
							id: matched.id,
							client_id: matched.attributes?.client_id,
							client_secret: matched.attributes?.client_secret,
							mainAccount: matched.attributes?.mainAccount ?? false,
							hasAccessToken: Boolean( matched.attributes?.access_token ),
							updatedAt: matched.attributes?.updatedAt,
							expires_in: matched.attributes?.expires_in,
						}
						: null,
				},
			}
		} )

		return res.status( 200 ).json( { data } )
	} catch ( error: any ) {
		console.error( "[bling/emitentes]", error?.message || error )
		return res.status( 500 ).json( {
			message: error?.response?.data?.error?.message || "Internal Server Error",
		} )
	}
}
