import formatarDataParaSaoPaulo from "@/function/formatHora"

export const BUSINESS_CONCLUDED_ETAPA = 6

export function isBusinessConcludedEtapa(etapa: number): boolean {
	return Number(etapa) === BUSINESS_CONCLUDED_ETAPA
}

export function buildBusinessStrapiStatusUpdate(input: {
	etapa: number
	andamento: number
	now?: Date
}): {
	etapa: number
	andamento: number
	date_conclucao: string | null
} {
	const etapa = Number(input.etapa)
	const andamento = Number(input.andamento)
	return {
		etapa,
		andamento,
		date_conclucao: isBusinessConcludedEtapa(etapa)
			? formatarDataParaSaoPaulo(input.now ?? new Date())
			: null,
	}
}
