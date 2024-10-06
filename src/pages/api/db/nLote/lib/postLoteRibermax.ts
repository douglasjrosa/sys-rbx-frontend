import { ErroPHP } from "@/pages/api/lib/erroPHP"
import axios from "axios"

const PHP = axios.create( {
	baseURL: process.env.RIBERMAX_API_URL,
	headers: {
		Token: process.env.ATORIZZATION_TOKEN_RIBERMAX,
		Email: process.env.ATORIZZATION_EMAIL,
	},
} )

export const PostLoteRibermmax = async ( propostaId: string ) => {
	const loteRequest = await axios( {
		url: `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/pedidos/${ propostaId }?populate=*`,
		headers: {
			Authorization: `Bearer ${ process.env.ATORIZZATION_TOKEN }`,
			"Content-Type": "application/json",
		},
	} )

	const pedido = loteRequest.data.data

	const formData = new FormData()
	formData.append( "cliente[CNPJ]", pedido.attributes.CNPJClinet )
	formData.append( "emitente[CNPJ]", pedido.attributes.CNPJEmitente )
	formData.append( "idProduto", pedido.attributes.produtosId )
	formData.append( "nLote", pedido.attributes.lote )
	formData.append( "qtde", pedido.attributes.qtde )

	return PHP.post( "/lotes", formData )
		.then( ( response ) => {

			return {
				msg: response.data.message,
				lote: response.data.lotes,
			}
		} )
		.catch( async ( error: any ) => {
			const data = {
				log: {
					"cliente[CNPJ]": pedido.attributes.CNPJClinet,
					"emitente[CNPJ]": pedido.attributes.CNPJEmitente,
					idProduto: pedido.attributes.produtosId,
					nLote: pedido.attributes.lote,
					qtde: pedido.attributes.qtde,
					pedido: propostaId,
					error: error,
				},
			}
			return await ErroPHP( data )
		} )
}
