/** Minimum digit count to treat input as a document (CNPJ/CPF) search. */
export const DOCUMENT_SEARCH_MIN_DIGITS = 3

/** Strips non-digit characters from a document search input. */
export function stripDocumentDigits( value: string ): string {
	return value.replace( /\D/g, '' )
}

/**
 * True when the input looks like a CNPJ/CPF search (digits only or masked).
 */
export function isDocumentNumberSearch( text: string ): boolean {
	const trimmed = text.trim()
	if ( !trimmed ) return false

	const digits = stripDocumentDigits( trimmed )
	if ( digits.length < DOCUMENT_SEARCH_MIN_DIGITS ) return false

	const compact = trimmed.replace( /\s/g, '' )
	if ( /^\d+$/.test( compact ) ) return true

	return /[.\-/]/.test( compact ) && digits.length >= DOCUMENT_SEARCH_MIN_DIGITS
}

/**
 * Digits-only value for CNPJ Strapi filters when the input is document-like.
 */
export function cnpjFilterValue( text: string ): string {
	const trimmed = text.trim()
	if ( !trimmed ) return ''

	if ( isDocumentNumberSearch( trimmed ) ) {
		return stripDocumentDigits( trimmed )
	}

	return trimmed
}

/** Normalizes empresa list filter text (CNPJ masked input → digits only). */
export function normalizeEmpresaFiltroTexto( filtro: string ): string {
	const trimmed = String( filtro ).trim()
	if ( !trimmed ) return ''
	return isDocumentNumberSearch( trimmed ) ? cnpjFilterValue( trimmed ) : trimmed
}
