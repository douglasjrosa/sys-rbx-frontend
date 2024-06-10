/* eslint-disable no-undef */
import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { ErroPHP } from "../../lib/erroPHP"

const PHP = axios.create( {
	baseURL: process.env.RIBERMAX_API_URL,
	headers: {
		Token: process.env.ATORIZZATION_TOKEN_RIBERMAX,
		Email: process.env.ATORIZZATION_EMAIL,
	},
} )

export default async function postLotePHP (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method === "POST" ) {
		const { nPedido } = req.query

		const loteRequest = await axios( {
			url: `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/pedidos/${ nPedido }?populate=*`,
			headers: {
				Authorization: `Bearer ${ process.env.ATORIZZATION_TOKEN }`,
				"Content-Type": "application/json",
			},
		} )

		const lote = loteRequest.data.data

		const items = [lote]
		const promessas = []

		for ( const i of items ) {
			const formData = new FormData()
			formData.append( "cliente[CNPJ]", i.attributes.CNPJClinet )
			formData.append( "emitente[CNPJ]", i.attributes.CNPJEmitente )
			formData.append( "idProduto", i.attributes.produtosId )
			formData.append( "nLote", i.attributes.lote )
			formData.append( "qtde", i.attributes.qtde )

			const promessa = PHP.post( "/lotes", formData )
				.then( async ( response ) => {

					return {
						msg: await response.data.message,
						lote: await response.data.lotes,
					}
				} )
				.catch( async ( error ) => {

					const data = {
						log: {
							"cliente[CNPJ]": i.attributes.CNPJClinet,
							"emitente[CNPJ]": i.attributes.CNPJEmitente,
							idProduto: i.attributes.produtosId,
							nLote: i.attributes.lote,
							qtde: i.attributes.qtde,
							pedido: nPedido,
							error: error,
						},
					}
					return await ErroPHP( data )
				} )

			promessas.push( promessa )
		}

		const resposta = await Promise.all( promessas )
		res.json( resposta )
	} else {
		return res.status( 405 ).send( { message: "Only POST requests are allowed" } )
	}
}
