import axios from "axios"
import type { NextApiRequest, NextApiResponse } from "next"
import {
	deleteBlingSalesOrder,
	resolveBlingSalesOrderId,
} from "../lib/blingOrderDelete"

export default async function blingPedidoRoute(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "DELETE") {
		return res.status(405).json({ message: "Only DELETE requests are allowed" })
	}

	const { numero } = req.query
	if (!numero || Array.isArray(numero)) {
		return res.status(400).json({ message: "Invalid pedido number" })
	}

	const body =
		typeof req.body === "object" && req.body !== null
			? (req.body as {
					blingAccountCnpj?: string
					existingBlingOrderId?: string | null
				})
			: {}

	let blingAccountCnpj = body.blingAccountCnpj ?? ""
	let storedBpedido = body.existingBlingOrderId ?? null

	if (!blingAccountCnpj) {
		try {
			const pedidoResponse = await axios.get(
				`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/pedidos/${numero}` +
					"?populate[fornecedorId][fields][0]=CNPJ" +
					"&fields[0]=Bpedido",
				{
					headers: {
						Authorization: `Bearer ${process.env.ATORIZZATION_TOKEN}`,
						"Content-Type": "application/json",
					},
				},
			)
			const pedido = pedidoResponse.data?.data
			blingAccountCnpj =
				pedido?.attributes?.fornecedorId?.data?.attributes?.CNPJ ?? ""
			storedBpedido =
				storedBpedido ??
				pedido?.attributes?.Bpedido ??
				null
		} catch (error: unknown) {
			const message =
				error instanceof Error ? error.message : "Failed to load pedido."
			return res.status(502).json({ message })
		}
	}

	if (!blingAccountCnpj) {
		return res.status(400).json({ message: "Bling account not found for pedido." })
	}

	const blingOrderId = await resolveBlingSalesOrderId(
		blingAccountCnpj,
		storedBpedido,
		numero,
	)

	if (!blingOrderId) {
		return res.status(200).json({ ok: true, skipped: true })
	}

	const deleteResult = await deleteBlingSalesOrder(
		blingAccountCnpj,
		blingOrderId,
	)

	if (!deleteResult.ok) {
		return res.status(502).json({
			message: "Não foi possível excluir o pedido no Bling.",
			error: deleteResult.error,
		})
	}

	return res.status(200).json({ ok: true, deleted: true })
}
