/* eslint-disable no-undef */
import axios from 'axios'

const getStrapiClient = () => axios.create( {
	baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
	headers: {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${ process.env.ATORIZZATION_TOKEN }`,
	},
} )

const APPEND_MAX_RETRIES = 5
const APPEND_RETRY_DELAY_MS = 150

const delay = ( ms: number ) => new Promise( ( resolve ) => {
	setTimeout( resolve, ms )
} )

export const normalizeIncidentRecord = ( value: unknown ): unknown[] => {
	if ( Array.isArray( value ) ) {
		return value
	}
	return []
}

const entryKey = ( entry: unknown ): string => JSON.stringify( entry )

export const fetchBusinessIncidentRecord = async (
	businessId: string,
): Promise<unknown[]> => {
	const client = getStrapiClient()
	const params = { fields: [ 'incidentRecord' ] }

	const [ liveRes, previewRes ] = await Promise.all( [
		client.get( `/businesses/${ businessId }`, {
			params: { ...params, publicationState: 'live' },
		} ).catch( () => null ),
		client.get( `/businesses/${ businessId }`, {
			params: { ...params, publicationState: 'preview' },
		} ).catch( () => null ),
	] )

	const live = normalizeIncidentRecord(
		liveRes?.data?.data?.attributes?.incidentRecord,
	)
	const preview = normalizeIncidentRecord(
		previewRes?.data?.data?.attributes?.incidentRecord,
	)

	const seen = new Set<string>()
	const merged: unknown[] = []

	for ( const entry of [ ...live, ...preview ] ) {
		const key = entryKey( entry )
		if ( !seen.has( key ) ) {
			seen.add( key )
			merged.push( entry )
		}
	}

	return merged
}

export const appendIncidentRecords = async (
	businessId: string,
	entries: unknown[],
): Promise<void> => {
	if ( entries.length === 0 ) {
		return
	}

	const client = getStrapiClient()
	const pendingKeys = new Set( entries.map( entryKey ) )

	for ( let attempt = 0; attempt < APPEND_MAX_RETRIES; attempt++ ) {
		const current = await fetchBusinessIncidentRecord( businessId )
		const currentKeys = new Set( current.map( entryKey ) )
		const toAdd = entries.filter(
			( entry ) => !currentKeys.has( entryKey( entry ) ),
		)

		if ( toAdd.length === 0 ) {
			return
		}

		const next = [ ...current, ...toAdd ]

		try {
			await client.put( `/businesses/${ businessId }`, {
				data: {
					incidentRecord: next,
					publishedAt: new Date().toISOString(),
				},
			} )
			toAdd.forEach( ( entry ) => pendingKeys.delete( entryKey( entry ) ) )
			if ( pendingKeys.size === 0 ) {
				return
			}
		} catch ( error ) {
			if ( attempt === APPEND_MAX_RETRIES - 1 ) {
				throw error
			}
		}

		await delay( APPEND_RETRY_DELAY_MS * ( attempt + 1 ) )
	}
}

export const IncidentRecord = async ( txt: unknown, business: string ) => {
	await appendIncidentRecords( business, [ txt ] )
}
