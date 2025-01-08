/* eslint-disable no-undef */
import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { GetLoteProposta } from "../../lib/get_lote_nProposta"
import { GetTrelloId } from "../../lib/get_trello_id"
import { ErroTrello } from "../../lib/errtrello"
import { IncidentRecord } from "../lib/businesses"


export default async function PostTrello (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method === "POST" ) {
		const { numero } = req.query

		const requestPedido = await axios( {
			url: `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/pedidos/${ numero }?populate=*`,
			headers: {
				Authorization: `Bearer ${ process.env.ATORIZZATION_TOKEN }`,
				"Content-Type": "application/json",
			},
		} )
		const pedido = requestPedido.data.data

		const lote = await GetLoteProposta( numero )

		const items = pedido.attributes.itens
		const cliente = pedido.attributes.empresa.data.attributes.nome
		const negocio = pedido.attributes.business.data.attributes.nBusiness
		const negocioId = pedido.attributes.business.data.id
		const frete =
			pedido.attributes.frete === "" ? "Fob" : pedido.attributes.frete
		const estrega = pedido.attributes.dataEntrega
		const VendedorName = pedido.attributes.user.data.attributes.username
		const fornecedorName = pedido.attributes.fornecedorId.data.attributes.nome
		const pedidoCliente = pedido.attributes.cliente_pedido

		const Prefuncionario = await GetTrelloId()
		const funcionario = Prefuncionario.filter( ( f: string ) => f !== null )


		const apiKey = process.env.TRELLO_API_KEY
		const apiToken = process.env.TRELLO_API_TOKEN
		const idBoard = process.env.TRELLO_BOARD_ID
		const idList = process.env.TRELLO_LIST_ID

		try {
			const cardsSent = []
			for ( const i of items ) {
				const Prenlote = lote.filter( ( f: any ) => (
					f.attributes.produtosId == i.prodId &&
					f.attributes.qtde == i.Qtd &&
					f.attributes.item_id == i.id
				) )
					.map( ( p: any ) => p.attributes.lote )
				const nlote = Prenlote[ 0 ]

				const trimmedClientName = cliente.replace( /(\w+\s\w+)\s.*/, '$1' )
				const qtde = ` - ${ i.Qtd }`
				const trimmedProdName = " - " + i.nomeProd.replace( / - \d+ x \d+ x \d+cm\(alt.\)/g, "" )

				let measures = `- Medidas: ${ i.comprimento } x ${ i.largura } x ${ i.altura ? i.altura + "cm(alt.) " : "cm(larg.) " } `
				measures = i.comprimento ? measures : ""

				const expo = i.expo ? " - EXP" : ""
				const mont = i.mont ? " - MONT" : ""

				const weight = i.pesoCx ? ` - Peso: ${ i.pesoCx }kg` : ""

				const lot = ` - Lote: ${ nlote }`

				const nomeCard = trimmedClientName + qtde + trimmedProdName + measures + expo + mont + weight + lot

				const dataBoard = JSON.stringify( {
					idList,
					boardId: idBoard,
					name: nomeCard,
					desc: `Negocio: Nº.${ negocioId },
						Proposta / Pedido: Nº.${ numero },
						Bling Pedido: Nº.${ numero },
						Vendedor( a ): ${ VendedorName },
						Empresa: ${ fornecedorName },
						Tipo de frete: ${ frete },
						Pedido do cliente: Nº.${ pedidoCliente === null ? '' : pedidoCliente },
						Lote: Nº.${ nlote },
						Modelo: ${ i.titulo } `,
					due: estrega + 'T16:00:00.000Z',
					dueReminder: 2880,
					pos: "top",
				} )

				let config = {
					method: "post",
					maxBodyLength: Infinity,
					url: `https://api.trello.com/1/cards?idList=${ idList }&key=${ apiKey }&token=${ apiToken }`,
					headers: {
						"Content-Type": "application/json"
					},
					data: dataBoard,
				}

				const cardSent = await axios.request( config ).then( async ( res: any ) => {
					const resposta = `card id: ${ res.data.id } pode ser acessado pelo link: ${ res.data.shortUrl } `
					const text = {
						msg: resposta,
						date: new Date().toISOString(),
						user: "Sistema",
					}
					await IncidentRecord( text, negocioId )
					return resposta
				} ).catch( async ( err: any ) => {
					const data = {
						log: {
							key: apiKey,
							token: apiToken,
							idList,
							boardId: idBoard,
							name: nomeCard,
							lista_de_menbros: funcionario,
							negocio: negocio,
							Proposta: numero,
							Vendedor: VendedorName,
							Empresa: fornecedorName,
							Tipo_de_frete: frete,
							Lote: nlote,
							Modelo: i.titulo,
							erro_status: err.response.status,
							erro_message: err.response.data,
						},
					}
					return await ErroTrello( data )
				} )

				cardsSent.push( cardSent )
			}
			
			res.status( 201 ).json( cardsSent )
		} catch ( error: any ) {
			res.status( error.status || 400 ).json( error )
		}
	} else {
		return res.status( 405 ).send( { message: "Only POST requests are allowed" } )
	}
}
