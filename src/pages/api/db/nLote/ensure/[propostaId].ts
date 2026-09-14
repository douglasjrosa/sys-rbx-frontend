import type { NextApiRequest, NextApiResponse } from "next"
import { ensureLotesForPedido } from "../../lib/create-pedido-lotes"

export default async function ensurePedidoLotes(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Only POST requests are allowed" })
	}

	const propostaId = req.query.propostaId
	if (!propostaId || Array.isArray(propostaId)) {
		return res.status(400).json({ message: "Invalid pedido number" })
	}

	try {
		const { lotes, created } = await ensureLotesForPedido(String(propostaId))
		if (lotes.length === 0) {
			return res.status(400).json({
				ready: false,
				message: "Não foi possível gerar lotes para o pedido.",
			})
		}
		return res.status(created ? 201 : 200).json({
			ready: true,
			created,
			lotes,
		})
	} catch (error) {
		const message =
			error instanceof Error ? error.message : "Erro ao garantir lotes."
		return res.status(500).json({ ready: false, message })
	}
}
