import formatarDataParaSaoPaulo from "@/function/formatHora"

export const BUSINESS_CONCLUDED_ETAPA = 6
export const BUSINESS_WON_ANDAMENTO = 5

export function isBusinessConcludedEtapa(etapa: number): boolean {
	return Number(etapa) === BUSINESS_CONCLUDED_ETAPA
}

export function isBusinessWonStatus(input: {
	etapa: number
	andamento: number
}): boolean {
	return (
		isBusinessConcludedEtapa(input.etapa) &&
		Number(input.andamento) === BUSINESS_WON_ANDAMENTO
	)
}

/**
 * Payload to mark a business as won (concluído / ganho) in Strapi.
 * Used by admin "Atualizar no Strapi" after order integrations succeed.
 */
export function buildBusinessWonStrapiUpdate(now?: Date): {
	etapa: number
	andamento: number
	date_conclucao: string
} {
	return {
		etapa: BUSINESS_CONCLUDED_ETAPA,
		andamento: BUSINESS_WON_ANDAMENTO,
		date_conclucao: formatarDataParaSaoPaulo(now ?? new Date()),
	}
}

/** @deprecated Prefer buildBusinessWonStrapiUpdate for the Strapi resend button. */
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
