import { NextApiRequest, NextApiResponse } from "next"
import {
	BlingReauthRequiredError,
} from "@/pages/api/bling/lib/resolveAccessToken"
import { blingApiEndpoint, getBlingToken } from "@/pages/api/bling"
import { isTokenExpired, normalizeCnpj } from "@/utils/blingOAuth"
import { requireAdminSession } from "../../tokens/lib/requireAdmin"

const BLING_TEST_PATH = "contatos/tipos"

async function fetchTokenExpiryState ( cnpj: string ) {
	const strapiToken = process.env.ATORIZZATION_TOKEN
	const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL
	if ( !strapiToken || !strapiUrl ) {
		return null
	}

	const response = await fetch(
		`${ strapiUrl }/tokens?filters[cnpj][$eq]=${ encodeURIComponent( cnpj ) }`
		+ "&fields[0]=expires_in&fields[1]=updatedAt&fields[2]=access_token",
		{
			headers: {
				Authorization: `Bearer ${ strapiToken }`,
				"Content-Type": "application/json",
			},
		}
	)
	if ( !response.ok ) return null

	const data = await response.json()
	const attrs = data.data?.[ 0 ]?.attributes
	if ( !attrs ) return null

	return {
		hadAccessToken: Boolean( attrs.access_token ),
		wasExpired: isTokenExpired(
			String( attrs.expires_in ),
			attrs.updatedAt
		),
	}
}

export default async function handler (
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireAdminSession( req, res )
	if ( !session ) return

	if ( req.method !== "POST" ) {
		return res.status( 405 ).json( { message: "Method not allowed" } )
	}

	const rawCnpj = req.query.cnpj
	const cnpj = normalizeCnpj(
		Array.isArray( rawCnpj ) ? rawCnpj[ 0 ] : String( rawCnpj ?? "" )
	)
	if ( !cnpj ) {
		return res.status( 400 ).json( {
			valid: false,
			message: "CNPJ inválido",
		} )
	}

	if ( !blingApiEndpoint ) {
		return res.status( 500 ).json( {
			valid: false,
			message: "BLING_API_V3_ENDPOINT is not configured",
		} )
	}

	try {
		const before = await fetchTokenExpiryState( cnpj )
		if ( before && !before.hadAccessToken ) {
			return res.status( 400 ).json( {
				valid: false,
				message: "Nenhum access token cadastrado. Autorize no Bling primeiro.",
			} )
		}

		const accessToken = await getBlingToken( cnpj )
		const testResponse = await fetch(
			`${ blingApiEndpoint }/${ BLING_TEST_PATH }`,
			{
				headers: {
					Authorization: `Bearer ${ accessToken }`,
					"Content-Type": "application/json",
				},
			}
		)

		if ( !testResponse.ok ) {
			let detail = testResponse.statusText
			try {
				const errorBody = await testResponse.json()
				detail = errorBody?.error?.description
					|| errorBody?.error?.message
					|| detail
			} catch {
				/* ignore parse errors */
			}
			return res.status( 200 ).json( {
				valid: false,
				message: `A API do Bling rejeitou o token: ${ detail }`,
				refreshed: before?.wasExpired ?? false,
			} )
		}

		return res.status( 200 ).json( {
			valid: true,
			message: before?.wasExpired
				? "Token renovado com sucesso e aceito pela API do Bling."
				: "Token válido e aceito pela API do Bling.",
			refreshed: before?.wasExpired ?? false,
		} )
	} catch ( error: unknown ) {
		const message = error instanceof Error
			? error.message
			: "Falha ao testar o token"
		const status = error instanceof BlingReauthRequiredError ? 401 : 500
		return res.status( status ).json( {
			valid: false,
			message,
		} )
	}
}
