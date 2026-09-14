import type { SendTasksToPixtrelaResult } from "@/function/setOrderFunctions"

type ItemDebugRow = {
	itemIndex?: number
	prodId?: number
	strapiTemplateShape?: string
	sentTemplate?: boolean
	sentSubtaskCount?: number
	pixtrelaMs?: number
	pixtrelaTemplateSource?: string | null
	pixtrelaAction?: string | null
	pixtrelaDebugTrace?: Array<{ stage?: string; ms?: number; detail?: string }>
}

export function formatPixtrelaDebugSummary(
	result: SendTasksToPixtrelaResult,
): string {
	const totalMs = result.totalMs ?? "?"
	const header = `Total ${totalMs}ms | fallback=${result.usedRbxFallback ? "sim" : "nao"}`
	const debug = result.debug as { itemDebug?: ItemDebugRow[] } | undefined
	const items = debug?.itemDebug ?? []
	if (items.length === 0) {
		return `${header} | (resposta sem itemDebug — confira deploy CRM)`
	}
	const lines = items.map((item) => {
		const prodId = item.prodId ?? "?"
		const sent = item.sentTemplate ? "sim" : "nao"
		const shape = item.strapiTemplateShape ?? "?"
		const source = item.pixtrelaTemplateSource ?? "?"
		const ms = item.pixtrelaMs ?? "?"
		const action = item.pixtrelaAction ?? "?"
		const actionHint =
			action === "skipped"
				? " (reenvio idempotente — task ja existia)"
				: action === "created"
					? " (primeiro envio — criou task+subtasks)"
					: ""
		const excludedSlowStages = new Set([
			"upsert_start",
			"upsert_done",
			"apply_step_ordering",
		])
		const slowStage = (item.pixtrelaDebugTrace ?? [])
			.filter((stage) => !excludedSlowStages.has(stage.stage ?? ""))
			.slice()
			.sort((a, b) => (b.ms ?? 0) - (a.ms ?? 0))[0]
		const slowHint = slowStage?.stage
			? ` | slowest=${slowStage.stage}@${slowStage.ms}ms`
			: ""
		return (
			`prod ${prodId}: ${ms}ms | enviouTemplate=${sent} | ` +
			`strapi=${shape} | pixtrela=${source} | action=${action}${actionHint}${slowHint}`
		)
	})
	return `${header}\n${lines.join("\n")}`
}
