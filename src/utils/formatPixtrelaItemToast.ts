type PixtrelaItemAction = "created" | "updated" | "skipped" | string

const ACTION_DESCRIPTION: Record<string, string> = {
	created: "Tarefa de produção criada com sucesso.",
	updated: "Tarefa de produção atualizada com sucesso.",
	skipped: "Tarefa já existia no Pixtrela.",
}

export function formatPixtrelaItemToast(input: {
	itemIndex: number
	prodId?: number
	action?: PixtrelaItemAction
	ok: boolean
	errorMessage?: string
}): { title: string; description?: string } {
	const itemNum = input.itemIndex + 1
	const prodLabel = input.prodId ? ` (prod. ${input.prodId})` : ""

	if (!input.ok) {
		return {
			title: `PIXTRELA: falha no item ${itemNum}${prodLabel}`,
			description:
				input.errorMessage ||
				"Não foi possível enviar a tarefa de produção.",
		}
	}

	const action = input.action ?? "created"
	const description =
		ACTION_DESCRIPTION[action] ?? "Tarefa sincronizada com sucesso."

	return {
		title: `PIXTRELA: item ${itemNum}${prodLabel}`,
		description,
	}
}
