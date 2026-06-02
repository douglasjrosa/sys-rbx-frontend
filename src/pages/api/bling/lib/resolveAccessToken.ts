import { normalizeCnpj } from '@/utils/blingOAuth'
import { updateTokenById } from '@/pages/api/db/tokens/lib/strapiTokenClient'
import { refreshOAuthToken } from './refreshOAuthToken'

const TOKEN_EXPIRY_BUFFER_MS = 1_200_000

function isTokenExpired ( expires_in: string, updatedAt: string ): boolean {
	const created = new Date( updatedAt ).getTime()
	const expiresAt = created
		+ ( parseInt( expires_in, 10 ) * 1000 )
		- TOKEN_EXPIRY_BUFFER_MS
	return Date.now() > expiresAt
}

export async function resolveBlingAccessToken ( account: string ): Promise<string> {
	const cnpj = normalizeCnpj( account )
	if ( !cnpj ) {
		throw new Error( 'CNPJ da conta Bling inválido' )
	}

	const strapiToken = process.env.ATORIZZATION_TOKEN
	const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL
	if ( !strapiToken || !strapiUrl ) {
		throw new Error( 'Strapi credentials are not configured' )
	}

	const response = await fetch(
		`${ strapiUrl }/tokens?filters[cnpj][$eq]=${ encodeURIComponent( cnpj ) }`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${ strapiToken }`,
			},
		}
	)

	if ( !response.ok ) {
		throw new Error( 'Failed to fetch Bling token from Strapi' )
	}

	const currentTokenData = await response.json()
	if ( !currentTokenData.data?.length ) {
		throw new Error(
			`Nenhum token Bling cadastrado para o emitente (CNPJ ${ cnpj }). `
			+ 'Configure o OAuth em /bling.'
		)
	}

	const record = currentTokenData.data[ 0 ]
	const attrs = record.attributes as {
		expires_in: string
		updatedAt: string
		access_token: string
		refresh_token: string
		client_id: string
		client_secret: string
		cnpj?: string
	}

	let accessToken = attrs.access_token

	if ( isTokenExpired( String( attrs.expires_in ), attrs.updatedAt ) ) {
		const refreshed = await refreshOAuthToken(
			attrs.client_id,
			attrs.client_secret,
			attrs.refresh_token
		)
		await updateTokenById( record.id, {
			cnpj: attrs.cnpj || cnpj,
			access_token: refreshed.access_token,
			expires_in: refreshed.expires_in,
			refresh_token: refreshed.refresh_token,
		} )
		accessToken = refreshed.access_token
	}

	if ( !accessToken ) {
		throw new Error( `Token Bling vazio para o CNPJ ${ cnpj }` )
	}

	return accessToken
}
