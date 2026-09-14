/* eslint-disable no-undef */
import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import {
	deleteBlingSalesOrder,
	resolveBlingSalesOrderId,
} from '../../lib/blingOrderDelete'
import { archiveTrelloCardsForBusiness } from '../../lib/trelloArchiveCards'
import { fetchBusinessIncidentRecord } from '../../lib/businesses'
import { deletePixtrelaTasksForPedido } from '../../pixtrela/deletePedidoTasks'

type BlingIntegrationResult = {
	deleted: boolean
	skipped: boolean
	error?: string
}

type PixtrelaIntegrationResult = {
	deleted: boolean
	skipped: boolean
	deletedCount?: number
	error?: string
}

export default async function DeleteBusiness (
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if ( req.method !== 'GET' ) {
		return res.status( 405 ).send( { message: 'Only GET requests are allowed' } )
	}

	const token = process.env.ATORIZZATION_TOKEN
	const { id } = req.query

	if ( !id || Array.isArray( id ) ) {
		return res.status( 400 ).json( { message: 'Invalid business id' } )
	}

	const strapiBase = process.env.NEXT_PUBLIC_STRAPI_API_URL
	const authHeaders = {
		Authorization: `Bearer ${ token }`,
		'Content-Type': 'application/json',
	}

	try {
		const businessResponse = await axios.get(
			`${ strapiBase }/businesses/${ id }` +
			'?populate[pedidos][populate][fornecedorId][fields][0]=CNPJ' +
			'&fields[0]=Bpedido',
			{ headers: authHeaders },
		)

		const business = businessResponse.data?.data
		const pedido = business?.attributes?.pedidos?.data?.[ 0 ]
		const blingAccountCnpj =
			pedido?.attributes?.fornecedorId?.data?.attributes?.CNPJ ||
			pedido?.attributes?.fornecedor ||
			null
		const storedBpedido =
			business?.attributes?.Bpedido ||
			pedido?.attributes?.Bpedido ||
			null
		const propostaId = pedido?.id ?? null
		const incidentRecord = await fetchBusinessIncidentRecord( String( id ) )

		const blingResult: BlingIntegrationResult = {
			deleted: false,
			skipped: true,
		}

		if ( blingAccountCnpj && ( storedBpedido || propostaId ) ) {
			const blingOrderId = await resolveBlingSalesOrderId(
				blingAccountCnpj,
				storedBpedido,
				propostaId,
			)

			if ( blingOrderId ) {
				blingResult.skipped = false
				const deleteResult = await deleteBlingSalesOrder(
					blingAccountCnpj,
					blingOrderId,
				)

				if ( !deleteResult.ok ) {
					return res.status( 502 ).json( {
						message: 'Não foi possível excluir o pedido no Bling.',
						error: deleteResult.error,
						integration: { bling: blingResult },
					} )
				}

				blingResult.deleted = true
			}
		}

		const trelloResult = await archiveTrelloCardsForBusiness( incidentRecord )

		if ( trelloResult.failed > 0 ) {
			return res.status( 502 ).json( {
				message: 'Não foi possível arquivar todos os cards no Trello.',
				error: trelloResult.errors.join( '; ' ),
				integration: {
					bling: blingResult,
					trello: trelloResult,
				},
			} )
		}

		const pixtrelaResult: PixtrelaIntegrationResult = {
			deleted: false,
			skipped: true,
		}

		if ( propostaId ) {
			pixtrelaResult.skipped = false
			const deletePixtrela = await deletePixtrelaTasksForPedido( String( propostaId ) )
			if ( !deletePixtrela.ok ) {
				return res.status( 502 ).json( {
					message: 'Não foi possível excluir as tarefas no Pixtrela.',
					error: deletePixtrela.error,
					integration: {
						bling: blingResult,
						trello: trelloResult,
						pixtrela: pixtrelaResult,
					},
				} )
			}
			pixtrelaResult.deleted = deletePixtrela.deletedCount > 0
			pixtrelaResult.deletedCount = deletePixtrela.deletedCount
		}

		const response = await axios( {
			method: 'PUT',
			url: `${ strapiBase }/businesses/${ id }`,
			data: { data: { status: false } },
			headers: authHeaders,
		} )

		res.status( 200 ).json( {
			...response.data,
			integration: {
				bling: blingResult,
				trello: trelloResult,
				pixtrela: pixtrelaResult,
			},
		} )
	} catch ( err: any ) {
		const status = err.response?.status || 400
		res.status( status ).json( {
			error: err.response?.data,
			mensage: err.response?.data?.error,
			detalhe: err.response?.data?.error?.details,
			message: err.response?.data?.message || err.message,
		} )
	}
}
