import { isTokenExpired, normalizeCnpj } from '@/utils/blingOAuth'
import { updateTokenById } from '@/pages/api/db/tokens/lib/strapiTokenClient'
import { refreshOAuthToken } from './refreshOAuthToken'

type StrapiTokenRecord = {
	id: number
	attributes: {
		expires_in: string
		updatedAt: string
		access_token: string
		refresh_token: string
		client_id: string
		client_secret: string
		cnpj?: string
	}
}

export class BlingReauthRequiredError extends Error {
	constructor ( cnpj: string ) {
		super(
			`Token Bling expirado para o emitente (CNPJ ${ cnpj }). `
			+ 'Re-autentique em /bling.'
		)
		this.name = 'BlingReauthRequiredError'
	}
}

const inflightRefreshByCnpj = new Map<string, Promise<string>>()

function isInvalidRefreshError ( error: unknown ): boolean {
	const message = error instanceof Error ? error.message : String( error )
	return /invalid refresh token/i.test( message )
}

async function fetchTokenRecord (
	cnpj: string
): Promise<StrapiTokenRecord | null> {
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
	const record = currentTokenData.data?.[ 0 ] as StrapiTokenRecord | undefined
	return record ?? null
}

async function persistRefreshedToken (
	record: StrapiTokenRecord,
	cnpj: string
): Promise<string> {
	const attrs = record.attributes
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
	return refreshed.access_token
}

async function refreshWithLock (
	cnpj: string,
	record: StrapiTokenRecord
): Promise<string> {
	const inFlight = inflightRefreshByCnpj.get( cnpj )
	if ( inFlight ) {
		return inFlight
	}

	const promise = persistRefreshedToken( record, cnpj ).finally( () => {
		inflightRefreshByCnpj.delete( cnpj )
	} )

	inflightRefreshByCnpj.set( cnpj, promise )
	return promise
}

export async function resolveBlingAccessToken ( account: string ): Promise<string> {
	const cnpj = normalizeCnpj( account )
	if ( !cnpj ) {
		throw new Error( 'CNPJ da conta Bling inválido' )
	}

	const record = await fetchTokenRecord( cnpj )
	if ( !record ) {
		throw new Error(
			`Nenhum token Bling cadastrado para o emitente (CNPJ ${ cnpj }). `
			+ 'Configure o OAuth em /bling.'
		)
	}

	const attrs = record.attributes
	let accessToken = attrs.access_token

	const needsRefresh = isTokenExpired(
		String( attrs.expires_in ),
		attrs.updatedAt
	)

	if ( needsRefresh ) {
		try {
			accessToken = await refreshWithLock( cnpj, record )
		} catch ( error ) {
			if ( isInvalidRefreshError( error ) ) {
				const latest = await fetchTokenRecord( cnpj )
				const latestAttrs = latest?.attributes
				if (
					latestAttrs?.access_token
					&& !isTokenExpired(
						String( latestAttrs.expires_in ),
						latestAttrs.updatedAt
					)
				) {
					return latestAttrs.access_token
				}
				throw new BlingReauthRequiredError( cnpj )
			}
			throw error
		}
	}

	if ( !accessToken ) {
		throw new Error( `Token Bling vazio para o CNPJ ${ cnpj }` )
	}

	return accessToken
}
