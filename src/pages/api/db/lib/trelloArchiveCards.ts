const CARD_ID_REGEX = /card id:\s*([a-zA-Z0-9]+)/i

export function extractTrelloCardIdsFromIncidentRecord (
	incidentRecord: unknown,
): string[] {
	if ( !Array.isArray( incidentRecord ) ) {
		return []
	}

	const ids = new Set<string>()
	for ( const entry of incidentRecord ) {
		const msg = typeof entry?.msg === 'string' ? entry.msg : ''
		const match = msg.match( CARD_ID_REGEX )
		if ( match?.[ 1 ] ) {
			ids.add( match[ 1 ] )
		}
	}
	return Array.from( ids )
}

const ARCHIVE_RETRY_DELAY_MS = 500
const ARCHIVE_MAX_ATTEMPTS = 3

const delay = ( ms: number ) => new Promise( ( resolve ) => {
	setTimeout( resolve, ms )
} )

export async function archiveTrelloCard (
	cardId: string,
): Promise<{ ok: boolean; error?: string; retryable?: boolean }> {
	const apiKey = process.env.TRELLO_API_KEY
	const apiToken = process.env.TRELLO_API_TOKEN

	if ( !apiKey || !apiToken ) {
		return { ok: false, error: 'Trello credentials not configured' }
	}

	const params = new URLSearchParams( {
		closed: 'true',
		key: apiKey,
		token: apiToken,
	} )

	try {
		const response = await fetch(
			`https://api.trello.com/1/cards/${ cardId }?${ params.toString() }`,
			{ method: 'PUT' },
		)

		if ( response.status === 404 ) {
			return { ok: true }
		}

		if ( !response.ok ) {
			let errorMessage = response.statusText
			try {
				const data = await response.json()
				errorMessage = data?.message || errorMessage
			} catch {
				/* ignore parse errors */
			}
			return {
				ok: false,
				error: errorMessage,
				retryable: response.status === 429 || response.status >= 500,
			}
		}

		return { ok: true }
	} catch ( error ) {
		const message = error instanceof Error ? error.message : 'Unknown error'
		return { ok: false, error: message }
	}
}

export type TrelloArchiveResult = {
	archived: number
	failed: number
	cardIds: string[]
	errors: string[]
	skipped: boolean
}

export async function archiveTrelloCardsForBusiness (
	incidentRecord: unknown,
): Promise<TrelloArchiveResult> {
	const cardIds = extractTrelloCardIdsFromIncidentRecord( incidentRecord )

	if ( cardIds.length === 0 ) {
		return {
			archived: 0,
			failed: 0,
			cardIds: [],
			errors: [],
			skipped: true,
		}
	}

	let archived = 0
	let failed = 0
	const errors: string[] = []

	for ( const cardId of cardIds ) {
		for ( let attempt = 0; attempt < ARCHIVE_MAX_ATTEMPTS; attempt++ ) {
			const result = await archiveTrelloCard( cardId )
			if ( result.ok ) {
				archived++
				break
			}

			if ( !result.retryable || attempt === ARCHIVE_MAX_ATTEMPTS - 1 ) {
				failed++
				if ( result.error ) {
					errors.push( `${ cardId }: ${ result.error }` )
				}
				break
			}

			await delay( ARCHIVE_RETRY_DELAY_MS * ( attempt + 1 ) )
		}
	}

	return {
		archived,
		failed,
		cardIds,
		errors,
		skipped: false,
	}
}
