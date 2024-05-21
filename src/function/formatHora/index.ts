function formatarDataParaSaoPaulo ( dataUtc: string | number | Date ) {
	const offsetSaoPaulo = -3 * 60
	const dataSaoPaulo = new Date( dataUtc )
	dataSaoPaulo.setMinutes( dataSaoPaulo.getMinutes() + offsetSaoPaulo )

	const dia = dataSaoPaulo.getUTCDate().toString().padStart( 2, '0' )
	const mes = ( dataSaoPaulo.getUTCMonth() + 1 ).toString().padStart( 2, '0' )
	const ano = dataSaoPaulo.getUTCFullYear().toString()
	const hora = dataSaoPaulo.getUTCHours().toString().padStart( 2, '0' )
	const minuto = dataSaoPaulo.getUTCMinutes().toString().padStart( 2, '0' )
	const segundo = dataSaoPaulo.getUTCSeconds().toString().padStart( 2, '0' )
	const milissegundo = dataSaoPaulo.getUTCMilliseconds().toString().padStart( 3, '0' )

	return `${ ano }-${ mes }-${ dia }T${ hora }:${ minuto }:${ segundo }.${ milissegundo }Z`
}

export default formatarDataParaSaoPaulo
