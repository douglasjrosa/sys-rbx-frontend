import axios from "axios"
import { getBlingToken } from "@/pages/api/bling/auth/update-bling-token"

const postNLote = async ( nPedido: string ) => {
	return await axios.post( `/api/db/nLote/${ nPedido }` )
}

const fetchPedidoData = async ( nPedido: string ) => {
	return await axios.post( "/api/query/pedido/" + nPedido )
}

const postTrello = async ( nPedido: string ) => {
	return await axios.post( `/api/db/trello/${ nPedido }` )
}


const postPedidoVenda = async ( data: any, blingAccountCnpj: string ) => {

	const blingAccessToken = await getBlingToken( blingAccountCnpj )
	if ( typeof blingAccessToken !== "string" ) {
		console.error( { blingAccessToken } )
	}

	return await fetch( "/api/bling/pedidos/vendas", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${ blingAccessToken }`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify( { data } )
	} ).then( r => r.json() )
}

const getPedidoId = async ( nPedido: string ) => {
	const pedido = await fetch( `/api/strapi/pedidos?populate=*&filters[nPedido][$eq]=${ nPedido }` ).then( r => r.json() )
	return pedido.data[ 0 ].id
}

const updatePedidoInStrapi = async ( nPedido: string, blingPedidoId: string ) => {
	const pedidoId = await getPedidoId( nPedido )
	return await fetch( `/api/strapi/pedidos/${ pedidoId }`, {
		method: 'PUT',
		body: JSON.stringify( {
			data: {
				Bpedido: blingPedidoId,
				stausPedido: true
			}
		} )
	} ).then( r => r.json() )
		.catch( ( error ) => console.error( error ) )
}


const updateNegocioInStrapi = async ( negocioId: string, blingPedidoId: string ) => {
	return await fetch( `/api/strapi/businesses/${ negocioId }`, {
		method: 'PUT',
		body: JSON.stringify( {
			data: {
				Bpedido: blingPedidoId,
				stausPedido: true
			}
		} )
	} ).then( r => r.json() )
		.catch( ( error ) => console.error( error ) )
}

const abortOrderInStrapi = async ( negocioId: string ) => {
	return await fetch( `/api/strapi/businesses/${ negocioId }`, {
		method: 'PUT',
		body: JSON.stringify( {
			data: {
				etapa: 5,
				andamento: 3,
				stausPedido: false
			}
		} )
	} ).then( r => r.json() )
		.catch( ( error ) => console.error( error ) )
}

const abortOrderInBling = async ( blingPedidoId: string, blingAccountCnpj: string ): Promise<void> => {
	await fetch( `/api/bling/pedidos/vendas/${ blingPedidoId }`, { method: "DELETE" } )
}

const updateLastOrderInStrapi = async ( clientId: string, orderValue: string, vendedor: string, vendedorId: string ) => {
	const DateNow = new Date()
	return await fetch( `/api/strapi/empresas/${ clientId }`, {
		method: 'PUT',
		body: JSON.stringify( {
			data: {
				ultima_compra_comcluida: DateNow.toISOString().slice( 0, 10 ),
				valor_ultima_compra: orderValue,
				vendedor,
				vendedorId
			}
		} )
	} ).then( r => r.json() )
		.catch( ( error ) => console.error( error ) )
}

export const pedido = async ( nPedido: string, clientId: any, valorVenda: string, vendedor: string, vendedorId: string, negocioId: string ) => {

	const order = await fetchPedidoData( nPedido )
	const { data } = order

	const blingAccountCnpj = data.attributes.fornecedorId.data.attributes.CNPJ

	const sendPedidoToBling = await postPedidoVenda( data, blingAccountCnpj )

	if ( !sendPedidoToBling.data?.id ) {

		const fields: string[] = []

		if ( sendPedidoToBling.error?.fields?.length ) {
			sendPedidoToBling.error.fields.map( ( field: any ) => {
				fields.push( field.msg )
				field.collection?.map( ( col: any ) => fields.push( col.msg ) )
			} )
		}

		return {
			title: `BLING: ${ sendPedidoToBling.message }`,
			description: "Erro ao enviar o pedido para o Bling",
			status: "error",
			fields,
			sendPedidoToBling
		}
	}
	const blingPedidoId = String( sendPedidoToBling.data.id )

	const updatePedido = await updatePedidoInStrapi( nPedido, blingPedidoId )
	if ( !updatePedido.data?.id ) {
		abortOrderInStrapi( negocioId )
		abortOrderInBling( blingPedidoId, blingAccountCnpj )
		return {
			title: "STRAPI: Houve um erro ao atualizar o pedido.",
			description: "Favor avisar o suporte técnico.",
			status: "error"
		}
	}

	const updateNegocio = await updateNegocioInStrapi( negocioId, blingPedidoId )
	if ( !updateNegocio.data?.id ) {
		abortOrderInStrapi( negocioId )
		abortOrderInBling( blingPedidoId, blingAccountCnpj )
		return {
			title: "STRAPI: Houve um erro ao atualizar o negócio.",
			description: "O pedido foi enviado para o Bling, atualizado no banco de dados, mas o negócio não foi atualizado no CRM. Favor avisar o suporte técnico.",
			status: "error"
		}
	}

	updateLastOrderInStrapi( clientId, valorVenda, vendedor, vendedorId )

	postNLote( nPedido )

	const sendToTrello = await postTrello( nPedido )
	if ( !sendToTrello.data?.length ) {
		return {
			title: "TRELLO: Erro ao enviar os cards para o Trello.",
			description: "Favor avisar o suporte técnico que houve um erro ao enviar o pedido para o Trello.",
			status: "error"
		}
	}

	return {
		title: "SUCESSO: Pedido enviado com sucesso.",
		description: "Pedido enviado para o Bling, salvo no banco de dados e enviado para o Trello.",
		status: "success",
		sendPedidoToBling
	}
}
