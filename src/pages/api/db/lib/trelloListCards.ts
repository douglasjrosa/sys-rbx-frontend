export type TrelloListCard = {
	id: string
	name: string
	desc: string
	closed: boolean
	shortUrl?: string
}

export async function fetchTrelloListCards(
	idList: string,
): Promise<TrelloListCard[]> {
	const apiKey = process.env.TRELLO_API_KEY
	const apiToken = process.env.TRELLO_API_TOKEN
	if (!apiKey || !apiToken) {
		throw new Error("Trello credentials not configured")
	}

	const params = new URLSearchParams({
		fields: "id,name,desc,closed,shortUrl",
		key: apiKey,
		token: apiToken,
	})

	const response = await fetch(
		`https://api.trello.com/1/lists/${idList}/cards?${params.toString()}`,
	)

	if (!response.ok) {
		let message = response.statusText
		try {
			const data = await response.json()
			message = data?.message || message
		} catch {
			/* ignore */
		}
		throw new Error(message)
	}

	return response.json() as Promise<TrelloListCard[]>
}

export function findExistingTrelloCard(
	cards: TrelloListCard[],
	propostaNumero: string,
	nomeCard: string,
): TrelloListCard | null {
	const marker = `Proposta / Pedido: Nº.${propostaNumero}`
	return (
		cards.find(
			(card) =>
				!card.closed &&
				card.name === nomeCard &&
				card.desc.includes(marker),
		) ?? null
	)
}
