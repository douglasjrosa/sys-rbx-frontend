/**
 * Parses JSON from a legacy PHP response that may prepend HTML warnings.
 * Example: "<br /><b>Warning</b>: ...\n{\"info\":...}"
 */
export function parseLegacyJsonResponse( responseText: string ): unknown {
	const trimmed = responseText.trim()
	if ( !trimmed ) {
		return {}
	}

	try {
		return JSON.parse( trimmed )
	} catch {
		/* Fall through and try to recover embedded JSON. */
	}

	const objectStart = trimmed.indexOf( '{' )
	const arrayStart = trimmed.indexOf( '[' )
	let start = -1
	if ( objectStart >= 0 && arrayStart >= 0 ) {
		start = Math.min( objectStart, arrayStart )
	} else {
		start = Math.max( objectStart, arrayStart )
	}
	if ( start < 0 ) {
		throw new Error( 'No JSON payload found in legacy response' )
	}

	const candidates = [ trimmed.slice( start ) ]
	const lastObjectEnd = trimmed.lastIndexOf( '}' )
	const lastArrayEnd = trimmed.lastIndexOf( ']' )
	const end = Math.max( lastObjectEnd, lastArrayEnd )
	if ( end > start ) {
		candidates.unshift( trimmed.slice( start, end + 1 ) )
	}

	for ( const candidate of candidates ) {
		try {
			return JSON.parse( candidate )
		} catch {
			/* try next candidate */
		}
	}

	throw new Error( 'Unable to parse JSON from legacy response' )
}
