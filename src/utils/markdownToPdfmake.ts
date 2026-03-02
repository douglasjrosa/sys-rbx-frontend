import type { Content } from "pdfmake/interfaces"

/**
 * Converts basic markdown to pdfmake Content array.
 * Supports: **bold**, *italic*, # headers, - lists, line breaks.
 */
export function markdownToPdfmake ( md: string ): Content[] {
	if ( !md || typeof md !== "string" ) return []
	const lines = md.split( "\n" )
	const result: Content[] = []

	for ( let i = 0; i < lines.length; i++ ) {
		const line = lines[i]
		const trimmed = line.trim()
		if ( !trimmed ) {
			result.push( { text: "", margin: [0, 4, 0, 0] } )
			continue
		}

		// Headers
		const h1 = trimmed.match( /^# (.+)$/ )
		if ( h1 ) {
			result.push( {
				text: parseInline( h1[1] ),
				fontSize: 14,
				bold: true,
				margin: [0, 8, 0, 4],
			} )
			continue
		}
		const h2 = trimmed.match( /^## (.+)$/ )
		if ( h2 ) {
			result.push( {
				text: parseInline( h2[1] ),
				fontSize: 12,
				bold: true,
				margin: [0, 6, 0, 3],
			} )
			continue
		}
		const h3 = trimmed.match( /^### (.+)$/ )
		if ( h3 ) {
			result.push( {
				text: parseInline( h3[1] ),
				fontSize: 11,
				bold: true,
				margin: [0, 4, 0, 2],
			} )
			continue
		}

		// Unordered list
		const ul = trimmed.match( /^[-*] (.+)$/ )
		if ( ul ) {
			const inline = parseInline( ul[1] )
			const arr = typeof inline === "string" ? [inline] : inline.text
			result.push( {
				text: [{ text: "• ", bold: true }, ...arr],
				fontSize: 9,
				margin: [8, 2, 0, 0],
			} )
			continue
		}

		// Regular paragraph
		result.push( {
			text: parseInline( trimmed ),
			fontSize: 9,
			margin: [0, 2, 0, 0],
		} )
	}

	return result
}

type InlinePart = string | { text: string; bold?: boolean; italics?: boolean }

function parseInline ( text: string ): string | { text: InlinePart[] } {
	if ( !text ) return ""
	const parts: InlinePart[] = []

	// Match **bold** or *italic*
	const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|__([^_]+)__|_([^_]+)_)/g
	let lastIndex = 0
	let match

	while ( ( match = regex.exec( text ) ) !== null ) {
		if ( match.index > lastIndex ) {
			parts.push( text.slice( lastIndex, match.index ) )
		}
		if ( match[2] ) parts.push( { text: match[2], bold: true } )
		else if ( match[3] ) parts.push( { text: match[3], italics: true } )
		else if ( match[4] ) parts.push( { text: match[4], bold: true } )
		else if ( match[5] ) parts.push( { text: match[5], italics: true } )
		lastIndex = regex.lastIndex
	}

	if ( lastIndex < text.length ) parts.push( text.slice( lastIndex ) )
	if ( parts.length === 0 ) return text
	if ( parts.length === 1 && typeof parts[0] === "string" ) return parts[0]
	return { text: parts }
}
