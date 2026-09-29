const CENTS_PER_UNIT = 100

export function toCents(value: number): number {
	return Math.round((Number(value) || 0) * CENTS_PER_UNIT)
}

export function fromCents(cents: number): number {
	return cents / CENTS_PER_UNIT
}

export function roundMoney(value: number): number {
	return fromCents(toCents(value))
}

export function blingLineTotalCents(valor: number, quantidade: number): number {
	return toCents(roundMoney(valor) * Number(quantidade))
}

export function computeBlingSaleTotalCents(input: {
	items: Array<{ valor: number; quantidade: number }>
	frete?: number
	outrasDespesas?: number
	desconto?: number
}): number {
	const itemsCents = input.items.reduce(
		(sum, item) => sum + blingLineTotalCents(item.valor, item.quantidade),
		0,
	)
	return (
		itemsCents +
		toCents(input.frete) +
		toCents(input.outrasDespesas) -
		toCents(input.desconto)
	)
}

export function splitInstallmentAmounts(
	total: number,
	count: number,
): number[] {
	if (count <= 0) return []
	const totalCents = toCents(total)
	const baseCents = Math.floor(totalCents / count)
	const remainderCents = totalCents - baseCents * count
	return Array.from({ length: count }, (_, index) => {
		const extra = index === count - 1 ? remainderCents : 0
		return fromCents(baseCents + extra)
	})
}
