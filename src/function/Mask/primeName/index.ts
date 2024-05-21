export const primeiroNome = ( frase: string ): string => {
	if ( !frase ) return ''
	const indiceEspaco = frase.indexOf( ' ' )
	if ( indiceEspaco === -1 ) {
		return frase
	} else {
		return frase.substring( 0, indiceEspaco )
	}
}
