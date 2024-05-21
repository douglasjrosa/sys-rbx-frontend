export function capitalizeWords ( str: string ): string {

	if ( str === null || str === undefined ) {
		return ''
	}

	const str1 = str.toLowerCase()


	const trimmedStr = str1.replace( /\s+/g, ' ' )


	const words = trimmedStr.split( ' ' )


	for ( let i = 0; i < words.length; i++ ) {

		words[ i ] = words[ i ].charAt( 0 ).toUpperCase() + words[ i ].slice( 1 ).toLowerCase()
	}


	const result = words.join( ' ' )

	return result
}
