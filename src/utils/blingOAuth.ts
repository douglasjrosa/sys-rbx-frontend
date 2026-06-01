const BLING_OAUTH_AUTHORIZE_URL =
	"https://www.bling.com.br/Api/v3/oauth/authorize"

export const buildBlingOAuthUrl = ( clientId: string, state?: string ): string => {
	const fallbackState = `${ Date.now() }`
	const resolvedState = state || (
		typeof crypto !== "undefined" && crypto.randomUUID
			? crypto.randomUUID()
			: fallbackState
	)
	const params = new URLSearchParams( {
		response_type: "code",
		client_id: clientId,
		state: resolvedState,
	} )
	return `${ BLING_OAUTH_AUTHORIZE_URL }?${ params.toString() }`
}

export const normalizeCnpj = ( cnpj: string ): string =>
	String( cnpj ).replace( /\D/g, "" )

export const buildBlingRedirectPath = (
	cnpj: string,
	clientId: string,
	clientSecret: string
): string => {
	const cnpjDigits = normalizeCnpj( cnpj )
	return `/bling/${ cnpjDigits }/${ clientId }/${ clientSecret }`
}

export const buildBlingRedirectUrl = (
	origin: string,
	cnpj: string,
	clientId: string,
	clientSecret: string
): string => {
	const base = origin.replace( /\/$/, "" )
	return `${ base }${ buildBlingRedirectPath( cnpj, clientId, clientSecret ) }`
}

export const getEmitenteDisplayName = ( attrs: {
	razao?: string
	nome?: string
	CNPJ?: string
} ): string => attrs.nome || attrs.razao || attrs.CNPJ || "Emitente"

export const formatCnpjDisplay = ( cnpj: string ): string => {
	const digits = String( cnpj ).replace( /\D/g, "" )
	if ( digits.length !== 14 ) return cnpj
	return digits.replace(
		/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
		"$1.$2.$3/$4-$5"
	)
}

export const isTokenExpired = (
	expiresIn: string | undefined,
	updatedAt: string | undefined
): boolean => {
	if ( !expiresIn || !updatedAt ) return true
	const created = new Date( updatedAt ).getTime()
	const expiresAt = created + ( parseInt( expiresIn, 10 ) * 1000 ) - 1200000
	return Date.now() > expiresAt
}
