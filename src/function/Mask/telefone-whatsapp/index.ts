export const formatarTelefone = ( telefone: any ) => {

	const numeros = telefone.replace( /\D/g, "" )

	if ( numeros.length === 11 ) {

		return `(${ numeros.slice( 0, 2 ) }) ${ numeros.slice( 2, 3 ) } ${ numeros.slice(
			3,
			7
		) }-${ numeros.slice( 7 ) }`
	} else if ( numeros.length === 10 ) {

		return `(${ numeros.slice( 0, 2 ) }) ${ numeros.slice( 2, 6 ) }-${ numeros.slice(
			6
		) }`
	} else {

		return ""
	}
}
