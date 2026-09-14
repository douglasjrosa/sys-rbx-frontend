import type { NextApiRequest, NextApiResponse } from "next"
import {
	syncTemplateDataForBusinessId,
	syncTemplateDataForPedidoItems,
} from "../../lib/sync-product-template-data"

export const config = { maxDuration: 60 }

export default async function syncTemplateDataHandler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Only POST requests are allowed" })
	}

	const { id } = req.query
	if (!id || Array.isArray(id)) {
		return res.status(400).json({ message: "Invalid business id" })
	}

	try {
		const itens = req.body?.itens
		const empresaId = Number(req.body?.empresaId ?? 0) || null
		if (itens !== undefined) {
			await syncTemplateDataForPedidoItems(itens, empresaId)
		} else {
			await syncTemplateDataForBusinessId(id)
		}
		return res.status(200).json({ ok: true })
	} catch (error) {
		console.error(
			`templateData sync endpoint failed for business ${id}:`,
			error instanceof Error ? error.message : error,
		)
		return res.status(500).json({ ok: false })
	}
}
