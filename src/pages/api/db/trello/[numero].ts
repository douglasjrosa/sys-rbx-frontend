/* eslint-disable no-undef */
import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { GetTrelloId } from "../../lib/get_trello_id"
import { ErroTrello } from "../../lib/errtrello"
import { appendIncidentRecords } from "../lib/businesses"
import { buildProductDisplayName } from "@/utils/productDisplayName"
import {
	getTrelloAssemblyLabel,
	isOrderItemMont,
} from "@/utils/assemblyLabel"
import { ensureLotesForPedido } from "../lib/create-pedido-lotes"
import {
	fetchTrelloListCards,
	findExistingTrelloCard,
	type TrelloListCard,
} from "../lib/trelloListCards"
import { fetchBusinessIncidentRecord } from "../lib/businesses"
import { archiveTrelloCardsForBusiness } from "../lib/trelloArchiveCards"


export default async function PostTrello (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method === "DELETE" ) {
		const { numero } = req.query
		if ( !numero || Array.isArray( numero ) ) {
			return res.status( 400 ).json( { message: "Número do pedido inválido." } )
		}

		try {
			const requestPedido = await axios( {
				url: `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/pedidos/${ numero }?fields[0]=id&populate[business][fields][0]=id`,
				headers: {
					Authorization: `Bearer ${ process.env.ATORIZZATION_TOKEN }`,
					"Content-Type": "application/json",
				},
			} )
			const businessId =
				requestPedido.data?.data?.attributes?.business?.data?.id
			if ( !businessId ) {
				return res.status( 400 ).json( { message: "Negócio não encontrado." } )
			}

			const incidentRecord = await fetchBusinessIncidentRecord( String( businessId ) )
			const trelloResult = await archiveTrelloCardsForBusiness( incidentRecord )
			if ( trelloResult.failed > 0 ) {
				return res.status( 502 ).json( {
					message: "Não foi possível arquivar todos os cards no Trello.",
					error: trelloResult.errors.join( "; " ),
				} )
			}

			return res.status( 200 ).json( {
				ok: true,
				archived: trelloResult.archived,
				skipped: trelloResult.skipped,
			} )
		} catch ( error: any ) {
			const message =
				error?.message ||
				error?.response?.data?.message ||
				"Erro ao excluir cards no Trello."
			return res.status( 502 ).json( { message } )
		}
	}

	if ( req.method === "POST" ) {
		const { numero } = req.query
		if ( !numero || Array.isArray( numero ) ) {
			return res.status( 400 ).json( { message: "Número do pedido inválido." } )
		}

		let pedido
		try {
			const requestPedido = await axios( {
				url: `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/pedidos/${ numero }?populate=*`,
				headers: {
					Authorization: `Bearer ${ process.env.ATORIZZATION_TOKEN }`,
					"Content-Type": "application/json",
				},
			} )
			pedido = requestPedido.data.data
		} catch ( error: any ) {
			const message =
				error?.response?.data?.error?.message ||
				error?.message ||
				"Não foi possível carregar o pedido no Strapi."
			return res.status( 502 ).json( { message } )
		}

		let lote
		try {
			const ensured = await ensureLotesForPedido( String( numero ), pedido )
			lote = ensured.lotes
		} catch ( error: any ) {
			const message =
				error?.message ||
				"Não foi possível gerar lotes para o pedido antes do Trello."
			return res.status( 502 ).json( { message } )
		}

		const items = pedido.attributes.itens
		const cliente = pedido.attributes.empresa.data.attributes.nome
		const emailNfe = pedido.attributes.empresa.data.attributes.emailNfe
		const email = pedido.attributes.empresa.data.attributes.email
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

		const strapiAuthHeaders = {
			Authorization: `Bearer ${ process.env.ATORIZZATION_TOKEN }`,
			"Content-Type": "application/json",
		}
		const assemblyByProdId = new Map<number, string>()

		const fetchProductAssembly = async ( prodId: number ): Promise<string | null> => {
			if ( assemblyByProdId.has( prodId ) ) {
				return assemblyByProdId.get( prodId ) ?? null
			}
			try {
				const response = await axios( {
					url: `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/produtos?filters[prodId][$eq]=${ prodId }&fields[0]=assembly&pagination[limit]=1`,
					headers: strapiAuthHeaders,
				} )
				const assembly = response.data?.data?.[ 0 ]?.attributes?.assembly ?? null
				if ( assembly ) {
					assemblyByProdId.set( prodId, assembly )
				}
				return assembly
			} catch {
				return null
			}
		}

		let listCards: TrelloListCard[] = []
		if ( idList ) {
			try {
				listCards = await fetchTrelloListCards( idList )
			} catch {
				listCards = []
			}
		}

		try {
			const cardsSent: string[] = []
			const incidentEntries: Array<{
				msg: string
				date: string
				user: string
			}> = []

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
				const trimmedProdName = " - " + buildProductDisplayName( i )

				let measures = `- Medidas: ${ i.comprimento } x ${ i.largura } x ${ i.altura ? i.altura + "cm(alt.) " : "cm(larg.) " } `
				measures = i.comprimento ? measures : ""

				const expo = i.expo ? " - EXP" : ""
				const mont = i.mont ? " - MONT" : ""

				const weight = i.pesoCx ? ` - Peso: ${ i.pesoCx }kg` : ""

				const lot = ` - Lote: ${ nlote }`

				const nomeCard = trimmedClientName + qtde + trimmedProdName + measures + expo + mont + weight + lot

				let assemblyKey = i.assembly ?? null
				if ( isOrderItemMont( i.mont ) && !assemblyKey && i.prodId ) {
					assemblyKey = await fetchProductAssembly( Number( i.prodId ) )
				}
				const montagemLabel = getTrelloAssemblyLabel( i.mont, assemblyKey )

				const cardDesc = `Negocio: Nº.${ negocioId },
						Proposta / Pedido: Nº.${ numero },
						Bling Pedido: Nº.${ numero },
						Vendedor( a ): ${ VendedorName },
						Empresa: ${ fornecedorName },
						Tipo de frete: ${ frete },
						Pedido do cliente: Nº.${ pedidoCliente === null ? '' : pedidoCliente },
						Lote: Nº.${ nlote },
						Modelo: ${ i.titulo },
						Montagem: ${ montagemLabel },
						E-mail: ${ email },
						E-mail NFe: ${ emailNfe }.`

				const existingCard = findExistingTrelloCard(
					listCards,
					String( numero ),
					nomeCard,
				)

				if ( existingCard ) {
					const link = existingCard.shortUrl
						? ` pelo link: ${ existingCard.shortUrl }`
						: ""
					const resposta =
						`card id: ${ existingCard.id } (existente) pode ser acessado${ link } `
					incidentEntries.push( {
						msg: resposta,
						date: new Date().toISOString(),
						user: "Sistema",
					} )
					cardsSent.push( resposta )
					continue
				}

				const dataBoard = JSON.stringify( {
					idList,
					boardId: idBoard,
					name: nomeCard,
					desc: cardDesc,
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

				try {
					const res = await axios.request( config )
					const resposta =
						`card id: ${ res.data.id } pode ser acessado pelo link: ${ res.data.shortUrl } `
					incidentEntries.push( {
						msg: resposta,
						date: new Date().toISOString(),
						user: "Sistema",
					} )
					cardsSent.push( resposta )
					listCards.push( {
						id: res.data.id,
						name: nomeCard,
						desc: cardDesc,
						closed: false,
						shortUrl: res.data.shortUrl,
					} )
				} catch ( err: any ) {
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
							Montagem: montagemLabel,
							erro_status: err.response?.status,
							erro_message: err.response?.data,
						},
					}
					await ErroTrello( data )
				}
			}

			if ( incidentEntries.length > 0 ) {
				await appendIncidentRecords( String( negocioId ), incidentEntries )
			}

			if ( cardsSent.length === 0 ) {
				return res.status( 502 ).json( {
					message:
						"Nenhum card foi criado no Trello. Verifique credenciais e lista.",
				} )
			}

			res.status( 201 ).json( cardsSent )
		} catch ( error: any ) {
			const message =
				error?.message ||
				error?.response?.data?.message ||
				"Erro inesperado ao enviar cards para o Trello."
			res.status( error?.status || 502 ).json( { message } )
		}
	} else {
		return res.status( 405 ).send( { message: "Only POST or DELETE requests are allowed" } )
	}
}
