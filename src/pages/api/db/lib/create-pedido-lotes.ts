import axios from "axios"
import { GetLoteProposta } from "@/pages/api/lib/get_lote_nProposta"
import { nLote } from "@/pages/api/db/nLote"

const token = process.env.ATORIZZATION_TOKEN

const strapi = axios.create({
	baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
	headers: {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json",
	},
})

export type PedidoLoteRow = {
	id?: number
	attributes: {
		lote: number | string
		produtosId: number | string
		qtde: number | string
		item_id: string | number
	}
}

async function fetchPedido(numero: string) {
	const request = await strapi.get(`/pedidos/${numero}?populate=*`)
	return request.data.data
}

export async function fetchLotesForProposta(
	nProposta: string,
): Promise<PedidoLoteRow[]> {
	try {
		return await GetLoteProposta(nProposta)
	} catch {
		return []
	}
}

export async function createLotesForPedido(
	numero: string,
	pedido?: any,
): Promise<PedidoLoteRow[]> {
	const pedidoData = pedido ?? await fetchPedido(numero)
	const items = pedidoData.attributes.itens
	const empresa = pedidoData.attributes.empresaId
	const empresaCNPJ = pedidoData.attributes.empresa.data.attributes.CNPJ
	const negocioId = pedidoData.attributes.business.data.id
	const fornecedor = pedidoData.attributes.fornecedorId
	const fornecedorCNPJ = pedidoData.attributes.fornecedorId.data.attributes.CNPJ
	const vendedor = pedidoData.attributes.user.data.id

	const lotes: PedidoLoteRow[] = []
	for (const item of items) {
		const nextLote = await nLote()
		const strapiLote = {
			data: {
				lote: nextLote,
				empresa,
				empresaId: empresa,
				business: negocioId,
				produtosId: item.prodId,
				emitente: fornecedor.data.attributes.titulo,
				emitenteId: fornecedor.data.id,
				qtde: item.Qtd,
				info: "",
				status: "",
				checklist: "",
				logs: "",
				vendedor,
				nProposta: numero,
				CNPJClinet: empresaCNPJ,
				CNPJEmitente: fornecedorCNPJ,
				item_id: String(item.id),
			},
		}
		const res = await strapi.post("/lotes", strapiLote)
		lotes.push(res.data.data)
	}
	return lotes
}

export async function ensureLotesForPedido(
	numero: string,
	pedido?: any,
): Promise<{ lotes: PedidoLoteRow[]; created: boolean }> {
	const existing = await fetchLotesForProposta(numero)
	if (existing.length > 0) {
		return { lotes: existing, created: false }
	}
	const pedidoData = pedido ?? await fetchPedido(numero)
	const created = await createLotesForPedido(numero, pedidoData)
	return { lotes: created, created: true }
}
