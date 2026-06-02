/* eslint-disable no-undef */
import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import {
	deleteBlingSalesOrder,
	resolveBlingSalesOrderId,
} from '../../lib/blingOrderDelete'
import { archiveTrelloCardsForBusiness } from '../../lib/trelloArchiveCards'

type BlingIntegrationResult = {
	deleted: boolean
	skipped: boolean
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
			'&fields[0]=Bpedido&fields[1]=incidentRecord',
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
		const incidentRecord = business?.attributes?.incidentRecord ?? []

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
