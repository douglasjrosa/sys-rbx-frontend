import { resolveBlingAccessToken } from './lib/resolveAccessToken'
import { normalizeCnpj } from '@/utils/blingOAuth'

const BLING_API_V3_OFFICIAL_HOST = 'api.bling.com.br'
const BLING_LEGACY_API_HOSTS = new Set( [ 'www.bling.com.br', 'bling.com.br' ] )

/**
 * Bling blocks API calls to www.bling.com.br; the official host is api.bling.com.br.
 * Normalizes misconfigured BLING_API_V3_ENDPOINT values at runtime.
 */
export function normalizeBlingApiV3Endpoint ( raw: string | undefined ): string {
	const trimmed = raw?.trim()
	if ( !trimmed ) return ''
	try {
		const parsed = new URL( trimmed )
		if ( BLING_LEGACY_API_HOSTS.has( parsed.hostname.toLowerCase() ) ) {
			parsed.hostname = BLING_API_V3_OFFICIAL_HOST
		}
		const withHost = parsed.toString()
		return withHost.endsWith( '/' ) ? withHost.slice( 0, -1 ) : withHost
	} catch {
		return trimmed.endsWith( '/' ) ? trimmed.slice( 0, -1 ) : trimmed
	}
}

export const blingApiEndpoint = normalizeBlingApiV3Endpoint(
	process.env.BLING_API_V3_ENDPOINT as string | undefined
)

export const BLING_ENABLE_JWT_VALUE = '1'

export function blingRequestHeaders (
	extra: Record<string, string> = {},
): Record<string, string> {
	return {
		'enable-jwt': BLING_ENABLE_JWT_VALUE,
		...extra,
	}
}

export function blingBearerHeaders ( accessToken: string ): Record<string, string> {
	return blingRequestHeaders( {
		Authorization: `Bearer ${ accessToken }`,
		'Content-Type': 'application/json',
	} )
}

export function blingOAuthHeaders (
	credentialsBase64: string,
): Record<string, string> {
	return blingRequestHeaders( {
		Authorization: `Basic ${ credentialsBase64 }`,
		'Content-Type': 'application/json',
	} )
}

export async function getBlingToken ( account: string ): Promise<string> {
	return resolveBlingAccessToken( normalizeCnpj( account ) )
}
