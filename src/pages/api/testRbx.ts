import { NextApiRequest, NextApiResponse } from "next"
import { nLote } from "./db/nLote"

const token = process.env.ATORIZZATION_TOKEN

export default async function GetEmpresa (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method === "POST" ) {
		try {
			const data = JSON.parse( req.body )
			const { userEmail } = data
			const julyDate = "2024-07-31T23:59:59.999Z"
			const request = await fetch( `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/lotes?filters[updatedAt][$gt]=${ encodeURIComponent( julyDate )}&populate=*`, {
				headers: {
					Authorization: `Bearer ${ token }`,
					"Content-Type": "application/json",
				},
			} )
			const lotes = await request.json()

			const php = []

			for ( const l of lotes.data ) {

				const {
					CNPJClinet,
					CNPJEmitente,
					produtosId,
					business,
					lote,
					qtde
				} = l.attributes

				const formData = new FormData()
				formData.append( "cliente[CNPJ]", CNPJClinet )
				formData.append( "emitente[CNPJ]", CNPJEmitente )
				formData.append( "idProduto", produtosId )
				formData.append( "negocioId", business?.data?.id || 0 )
				formData.append( "nLote", lote )
				formData.append( "qtde", qtde )

				const response = await fetch( `${ process.env.RIBERMAX_API_URL }/lotes`, {
					method: "POST",
					headers: {
						Token: process.env.ATORIZZATION_TOKEN_RIBERMAX,
						Email: userEmail,
					} as HeadersInit,
					body: formData
				} )
				const responseData = await response.json()
				php.push( responseData )
			}

			res.status( 201 ).json( php )
 
		} catch ( error: any ) {
			console.error( error )
			res.status( 400 ).json( error )
		}
	} else {
		return res.status( 405 ).send( { message: "Only POST requests are allowed" } )
	}
}
