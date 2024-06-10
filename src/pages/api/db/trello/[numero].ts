/* eslint-disable no-undef */
import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { GetLoteProposta } from "../../lib/get_lote_nProposta"
import { GetTrelloId } from "../../lib/get_trello_id"
import { ErroTrello } from "../../lib/errtrello"
import { IncidentRecord } from "../lib/businesses"

interface TrelloCard {
	key: string
	token: string
	idList: string
	boardId: string
	name: string
	desc: string
	idMembers: string[]
	due: string
	dueReminder: number
	pos: string
}

const token = process.env.ATORIZZATION_TOKEN
const STRAPI = axios.create( {
	baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
	headers: {
		Authorization: `Bearer ${ token }`,
		"Content-Type": "application/json",
	},
} )

export default async function PostTrello (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method === "POST" ) {
		const { numero } = req.query
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL as string || `https://${ process.env.NEXT_PUBLIC_VERCEL_URL }`

		const requestPedido = await axios( {
			url: `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/pedidos/${ numero }?populate=*`,
			headers: {
				Authorization: `Bearer ${ process.env.ATORIZZATION_TOKEN }`,
				"Content-Type": "application/json",
			},
		} )
		const pedido = requestPedido.data.data
		console.log(pedido)

		const Bpedido = pedido.attributes.Bpedido
		const account = pedido.attributes.fornecedorId.data.attributes.CNPJ

		const blingOrder = await fetch( `${ baseUrl }/api/bling/${ account }/pedidos/vendas/${ Bpedido }` ).then( r => r.json() )
		const blingOrderNumber = blingOrder.data?.numero ?? ""

		const lote = await GetLoteProposta( numero )

		const items = pedido.attributes.itens
		const cliente = pedido.attributes.empresa.data.attributes.nome
		const negocio = pedido.attributes.business.data.attributes.nBusiness
		const negocioId = pedido.attributes.business.data.id
		const frete =
			pedido.attributes.frete === "" ? "Fob" : pedido.attributes.frete
		const pgto = pedido.attributes.condi
		const Prazo = pedido.attributes.prazo
		const estrega = pedido.attributes.dataEntrega
		const VendedorName = pedido.attributes.user.data.attributes.username
		const fornecedorName = pedido.attributes.fornecedorId.data.attributes.nome
		const userKey = "7f3afdbb72cb272f2ef99089cd9066c8"
		const userToken =
			"ad565886cde4f9d1466040864b94a879d2281ec2f83c43d9cf0d74dbd752509d"
		const pedidoCliente = pedido.attributes.cliente_pedido

		const Prefuncionario = await GetTrelloId()
		const funcionario = Prefuncionario.filter( ( f: string ) => f !== null )


		const list = "6438073ecc85f294325f74ac" //teste

		const Bord = "5fac445b3c5274707a309d61"

		//Membros
		const trelloMembers: string[] = [
			"5fd10678fbc6b504679737d4" /*Daniela*/,
			"63e13cb526cca27c0d30f648" /*Edna*/,
			"63e13887ef5b25eea224493e" /*Luciana*/,
			"5d7bbf629972e80b374829bb" /*Fábrica*/,
		]
		try {
			const promises = items.map( async ( i: any, index: number ) => {
				const Prenlote = lote
					.filter(
						( f: any ) =>
							f.attributes.produtosId == i.prodId &&
							f.attributes.qtde == i.Qtd &&
							f.attributes.item_id == i.id
					)
					.map( ( p: any ) => p.attributes.lote )
				const nlote = Prenlote[ 0 ]

				const type =
					i.mont === true && i.expo === false
						? "MONT"
						: i.mont === false && i.expo === true
							? "EXP"
							: i.mont === false && i.expo === false
								? ""
								: "EXP - MONT"

				const nomeCard = `${ cliente } - ${ i.Qtd } - ${ i.nomeProd } - Medidas ${ i.comprimento } x ${ i.largura } x ${ i.altura } - peso ${ i.pesoCx }(kg) - ${ type } - Lote Nº ${ nlote }`

				const dataBoard = JSON.stringify( {
					key: userKey,
					token: userToken,
					idList: list,
					boardId: Bord,
					name: nomeCard,
					desc: `Negocio: Nº. ${ negocio },
        Proposta: Nº. ${ numero },
        Vendedor(a): ${ VendedorName },
        Empresa: ${ fornecedorName },
        Tipo de frete: ${ frete },
        Bling ID: Nº. ${ Bpedido },
        Bling Pedido: Nº. ${ blingOrderNumber },
        Negocio Id: Nº. ${ negocioId },
        Pedido: Nº. ${ pedidoCliente === null ? '' : pedidoCliente },
        Lote: Nº. ${ nlote },
        Forma de pagamento: ${ pgto },
        ${ pgto === 'A Prazo' && ( `Prazo de pagamento: ${ Prazo }` ) }
        Modelo: ${ i.modelo }`,
					idMembers: trelloMembers,
					due: estrega + 'T16:00:00.000Z',
					dueReminder: 2880,
					pos: "top",
				} )

				let config = {
					method: "post",
					maxBodyLength: Infinity,
					url: "https://api.trello.com/1/cards",
					headers: {
						"Content-Type": "application/json",
						Cookie:
							"preAuthProps=s%3A5d7b946bb2d92e57d8d07e4d%3AisEnterpriseAdmin%3Dfalse.xktum%2BounyUl8SGrzLx%2BKGezb8C94Hysn%2FNSdI77YcY",
					},
					data: dataBoard,
				}


				const delay = ( ms: number ) =>
					new Promise( ( resolve ) => setTimeout( resolve, ms ) )
				await delay( 400 * index )

				return await axios
					.request( config )
					.then( async ( res: any ) => {
						const resposta = `card id: ${ res.data.id } pode ser acessado pelo link: ${ res.data.shortUrl }`
						const text = {
							msg: resposta,
							date: new Date().toISOString(),
							user: "Sistema",
						}
						await IncidentRecord( text, negocioId )
						return resposta
					} )
					.catch( async ( err: any ) => {
						const data = {
							log: {
								key: userKey,
								token: userToken,
								idList: list,
								boardId: Bord,
								name: nomeCard,
								lista_de_menbros: funcionario,
								negocio: negocio,
								Proposta: numero,
								Vendedor: VendedorName,
								Empresa: fornecedorName,
								Tipo_de_frete: frete,
								Bling: Bpedido,
								Lote: nlote,
								Forma_de_pagamento: pgto,
								Modelo: i.titulo,
								erro_status: err.response.status,
								erro_message: err.response.data,
							},
						}
						return await ErroTrello( data )
					} )
			} )

			const result = await Promise.all( promises )
			res.status( 201 ).json( result )
		} catch ( error: any ) {
			res.status( error.status || 400 ).json( error )
		}
	} else {
		return res.status( 405 ).send( { message: "Only POST requests are allowed" } )
	}
}
