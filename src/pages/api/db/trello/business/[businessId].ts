import type { NextApiRequest, NextApiResponse } from "next"
import { fetchBusinessIncidentRecord } from "../../lib/businesses"
import { archiveTrelloCardsForBusiness } from "../../lib/trelloArchiveCards"

export default async function deleteTrelloBusinessCards(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== "DELETE") {
		return res.status(405).json({ message: "Only DELETE requests are allowed" })
	}

	const { businessId } = req.query
	if (!businessId || Array.isArray(businessId)) {
		return res.status(400).json({ message: "Invalid business id" })
	}

	try {
		const incidentRecord = await fetchBusinessIncidentRecord(String(businessId))
		const trelloResult = await archiveTrelloCardsForBusiness(incidentRecord)

		if (trelloResult.failed > 0) {
			return res.status(502).json({
				message: "Não foi possível arquivar todos os cards no Trello.",
				error: trelloResult.errors.join("; "),
			})
		}

		return res.status(200).json({
			ok: true,
			archived: trelloResult.archived,
			skipped: trelloResult.skipped,
		})
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : "Erro ao excluir cards no Trello."
		return res.status(502).json({ message })
	}
}
