export const DEFAULT_BASE_RATE = 0.01
export const DEFAULT_MILESTONES = [
	{ targetPercent: 0.25, comissionPercent: 0.15 },
	{ targetPercent: 0.5, comissionPercent: 0.25 },
	{ targetPercent: 0.7, comissionPercent: 0.5 },
	{ targetPercent: 0.85, comissionPercent: 0.7 },
	{ targetPercent: 1, comissionPercent: 1 },
	{ targetPercent: 2, comissionPercent: 2 },
]

export interface CommissionMilestone {
	targetPercent: number
	comissionPercent: number
}

export interface CommissionDeduction {
	description: string
	value: number
}

export interface CommissionResult {
	vendas: number
	meta: number
	atingimentoPercent: number
	multiplicador: number
	comissaoBase: number
	comissaoFinal: number
	salarioFixo: number
	salarioTotal: number
	deductionsTotal: number
	deductions: CommissionDeduction[]
	milestones: number[]
	milestoneDetails?: CommissionMilestone[]
}

function parseDeductions ( raw: unknown ): CommissionDeduction[] {
	if ( !Array.isArray( raw ) ) return []
	return ( raw as CommissionDeduction[] ).filter(
		( d ) =>
			typeof d?.description === "string" &&
			typeof d?.value === "number" &&
			!isNaN( d.value )
	)
}

function parseMilestones ( raw: unknown ): CommissionMilestone[] {
	if ( !Array.isArray( raw ) ) return DEFAULT_MILESTONES
	const sorted = ( raw as CommissionMilestone[] )
		.filter(
			( m ) =>
				typeof m?.targetPercent === "number" &&
				typeof m?.comissionPercent === "number"
		)
		.sort( ( a, b ) => a.targetPercent - b.targetPercent )
	return sorted.length > 0 ? sorted : DEFAULT_MILESTONES
}

export function getMultiplier (
	atingimentoPercent: number,
	milestones: CommissionMilestone[]
): number {
	if ( milestones.length === 0 ) return 0
	const percent = atingimentoPercent / 100
	if ( percent < ( milestones[ 0 ]?.targetPercent ?? 0 ) ) return 0
	for ( let i = milestones.length - 1; i >= 0; i-- ) {
		if ( percent >= milestones[ i ].targetPercent ) {
			return milestones[ i ].comissionPercent
		}
	}
	return 0
}

export function getMilestonePercentages ( milestones: CommissionMilestone[] ): number[] {
	const pct = milestones.map( ( m ) => Math.round( m.targetPercent * 100 ) )
	return Array.from( new Set( pct ) ).sort( ( a, b ) => a - b )
}

export function calculateCommission (
	vendas: number,
	meta: number,
	salarioFixo: number,
	baseRate?: number,
	milestonesRaw?: unknown,
	deductionsRaw?: unknown
): CommissionResult {
	const rate = baseRate ?? DEFAULT_BASE_RATE
	const milestones = parseMilestones( milestonesRaw )
	const deductions = parseDeductions( deductionsRaw )
	const atingimentoPercent = meta > 0 ? ( vendas / meta ) * 100 : 0
	const multiplicador = getMultiplier( atingimentoPercent, milestones )
	const comissaoBase = vendas * rate
	const comissaoFinal = comissaoBase * multiplicador
	const deductionsTotal = deductions.reduce( ( acc, d ) => acc + d.value, 0 )
	const salarioTotal = Math.max( 0, salarioFixo + comissaoFinal - deductionsTotal )

	return {
		vendas,
		meta,
		atingimentoPercent,
		multiplicador,
		comissaoBase,
		comissaoFinal,
		salarioFixo,
		salarioTotal,
		deductionsTotal,
		deductions,
		milestones: getMilestonePercentages( milestones ),
		milestoneDetails: milestones,
	}
}
