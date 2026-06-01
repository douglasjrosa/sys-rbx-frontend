import { NextApiRequest, NextApiResponse } from "next"
import {
	parseRequestBody,
	upsertTokenByCnpj,
} from "../lib/strapiTokenClient"

export default async function POST ( req: NextApiRequest, res: NextApiResponse ) {
	if ( req.method !== "POST" ) {
		res.status( 405 ).json( { error: "Método não permitido. Apenas POST é permitido." } )
		return
	}

	try {
		const payload = parseRequestBody( req.body )
		const data = ( payload.data ?? payload ) as Record<string, unknown>
		if ( !data.cnpj ) {
			res.status( 400 ).json( { error: "CNPJ is required" } )
			return
		}
		const result = await upsertTokenByCnpj( data )
		res.status( 200 ).json( result )
	} catch ( error ) {
		console.error( "Erro:", error )
		res.status( 500 ).json( { error: "Erro ao registrar o token" } )
	}
}
