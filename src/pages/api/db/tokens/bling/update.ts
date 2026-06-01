import { NextApiRequest, NextApiResponse } from "next"
import { parseRequestBody, updateTokenById } from "../lib/strapiTokenClient"

export default async function updateToken (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method !== "PUT" ) {
		res.status( 405 ).json( { error: "Método não permitido. Apenas PUT é permitido." } )
		return
	}

	try {
		const payload = parseRequestBody( req.body )
		const data = payload as Record<string, unknown>
		const id = data.id as string | number | undefined

		if ( !id ) {
			res.status( 400 ).json( { error: "O campo 'id' é obrigatório" } )
			return
		}

		const { id: _id, ...tokenData } = data
		const result = await updateTokenById( id, tokenData )
		res.status( 200 ).json( result )
	} catch ( error: any ) {
		console.error( "Erro:", error )
		res.status( 500 ).json( {
			error: error?.response?.data || "Erro ao atualizar o token",
		} )
	}
}
