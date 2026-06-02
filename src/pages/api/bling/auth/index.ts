import { NextApiRequest, NextApiResponse } from "next"
import { resolveBlingAccessToken, BlingReauthRequiredError } from "../lib/resolveAccessToken"
import { normalizeCnpj } from "@/utils/blingOAuth"

export default async function getToken (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method !== "GET" ) {
		res.status( 405 ).json( { message: "Method not allowed" } )
		return
	}

	const account = req.query.account
	if ( typeof account !== "string" || !account ) {
		res.status( 400 ).json( { message: "Account is required" } )
		return
	}

	try {
		const token = await resolveBlingAccessToken( normalizeCnpj( account ) )
		res.status( 200 ).json( token )
	} catch ( error: unknown ) {
		const message = error instanceof Error
			? error.message
			: "Erro ao obter o token"
		console.error( "Bling auth error:", error )
		let status = 500
		if ( error instanceof BlingReauthRequiredError ) {
			status = 401
		} else if ( message.includes( "Nenhum token Bling" ) ) {
			status = 404
		}
		res.status( status ).json( { message, error: message } )
	}
}
