import axios from "axios"
import { nLote } from "."
import { NextApiRequest, NextApiResponse } from "next"
import { ErroPHP } from "../../lib/erroPHP"

const token = process.env.ATORIZZATION_TOKEN
const STRAPI = axios.create( {
	baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
	headers: {
		Authorization: `Bearer ${ token }`,
		"Content-Type": "application/json",
	},
} )

const PHP = axios.create( {
	baseURL: process.env.RIBERMAX_API_URL,
	headers: {
		Token: process.env.ATORIZZATION_TOKEN_RIBERMAX,
		Email: process.env.ATORIZZATION_EMAIL,
	},
} )

export default async function GetEmpresa (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method === "POST" ) {
		const numero: any = req.query.psotLote

		const request = await STRAPI.get( `/pedidos/${ numero }?populate=*` )
		
		const pedido = request.data.data
		const items = pedido.attributes.itens
		const empresa = pedido.attributes.empresaId
		const empresaCNPJ = pedido.attributes.empresa.data.attributes.CNPJ
		const negocioId = pedido.attributes.business.data.id
		const fornecedor = pedido.attributes.fornecedorId
		const fornecedorCNPJ = pedido.attributes.fornecedorId.data.attributes.CNPJ
		const vendedor = pedido.attributes.user.data.id
		try {
			const lotes = []
			const php = []

			for ( const i of items ) {
				const NLote = await nLote()
				const idCliente = `${ i.id }`
				const strapiLote = {
					data: {
						lote: NLote,
						empresa: empresa,
						empresaId: empresa,
						business: negocioId,
						produtosId: i.prodId,
						emitente: fornecedor.data.attributes.titulo,
						emitenteId: fornecedor.data.id,
						qtde: i.Qtd,
						info: "",
						status: "",
						checklist: "",
						logs: "",
						vendedor: vendedor,
						nProposta: numero,
						CNPJClinet: empresaCNPJ,
						CNPJEmitente: fornecedorCNPJ,
						item_id: idCliente
					},
				}
				const res = await STRAPI.post( "/lotes", strapiLote )

				lotes.push( res.data.data )

				const formData = new FormData()
				formData.append( "cliente[CNPJ]", empresaCNPJ )
				formData.append( "emitente[CNPJ]", fornecedorCNPJ )
				formData.append( "idProduto", i.prodId )
				formData.append( "negocioId", negocioId )
				formData.append( "nLote", String( NLote ) )
				formData.append( "qtde", i.Qtd )

				php.push( PHP.post( "/lotes", formData )
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
								pedido: numero,
								error: error,
							},
						}
						return await ErroPHP( data )
					} )
				)
			}

			res.status( 201 ).json( { lotes, php } )

		} catch ( error: any ) {
			console.error( error )
			res.status( 400 ).json( error )
		}
	} else {
		return res.status( 405 ).send( { message: "Only POST requests are allowed" } )
	}
}
