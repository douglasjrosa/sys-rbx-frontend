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

export async function getBlingToken ( account: string ): Promise<string> {
	return resolveBlingAccessToken( normalizeCnpj( account ) )
}