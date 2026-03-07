export const COMMISSION_BASE_RATE = 0.01

export interface CommissionResult {
	vendas: number
	meta: number
	atingimentoPercent: number
	multiplicador: number
	comissaoBase: number
	comissaoFinal: number
	salarioFixo: number
	salarioTotal: number
}

export function getMultiplier ( atingimentoPercent: number ): number {
	if ( atingimentoPercent < 50 ) return 0
	if ( atingimentoPercent >= 100 ) return 1
	if ( atingimentoPercent >= 86 ) return 0.7
	if ( atingimentoPercent >= 71 ) return 0.5
	if ( atingimentoPercent >= 50 && atingimentoPercent < 70 ) return 0.25
	return 0
}

export function calculateCommission (
	vendas: number,
	meta: number,
	salarioFixo: number,
	baseRate: number = COMMISSION_BASE_RATE
): CommissionResult {
	const atingimentoPercent = meta > 0 ? ( vendas / meta ) * 100 : 0
	const multiplicador = getMultiplier( atingimentoPercent )
	const comissaoBase = vendas * baseRate
	const comissaoFinal = comissaoBase * multiplicador
	const salarioTotal = salarioFixo + comissaoFinal

	return {
		vendas,
		meta,
		atingimentoPercent,
		multiplicador,
		comissaoBase,
		comissaoFinal,
		salarioFixo,
		salarioTotal,
	}
}
