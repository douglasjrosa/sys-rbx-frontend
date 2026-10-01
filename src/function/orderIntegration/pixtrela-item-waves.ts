export type PixtrelaWaveItem = {
	itemIndex: number
	prodId: number
}

/**
 * First wave: first item of each prodId (creates the template).
 * Second wave: remaining same-product items (reuse the template).
 */
export function buildPixtrelaItemWaves(
	items: PixtrelaWaveItem[],
): number[][] {
	const seen = new Set<number>()
	const first: number[] = []
	const rest: number[] = []

	for (const item of items) {
		if (!seen.has(item.prodId)) {
			seen.add(item.prodId)
			first.push(item.itemIndex)
			continue
		}
		rest.push(item.itemIndex)
	}

	if (first.length === 0) return []
	return rest.length > 0 ? [ first, rest ] : [ first ]
}

function parsePedidoItens(itens: unknown): Array<{ prodId?: unknown }> {
	if (itens == null) return []
	if (Array.isArray(itens)) return itens as Array<{ prodId?: unknown }>
	if (typeof itens !== "string") return []
	const trimmed = itens.trim()
	if (!trimmed || trimmed === "null") return []
	try {
		const parsed = JSON.parse(trimmed)
		return Array.isArray(parsed) ? parsed : []
	} catch {
		return []
	}
}

export function waveItemsFromOrderItens(
	itens: unknown,
	itemCount: number,
): PixtrelaWaveItem[] {
	const rows = parsePedidoItens(itens)
	const count = Math.max(0, itemCount)
	const items: PixtrelaWaveItem[] = []
	for (let itemIndex = 0; itemIndex < count; itemIndex += 1) {
		const prodId = Number(rows[itemIndex]?.prodId)
		items.push({
			itemIndex,
			prodId: Number.isInteger(prodId) && prodId > 0 ? prodId : 0,
		})
	}
	return items
}
