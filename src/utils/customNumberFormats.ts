export const parseCurrency = ( value: string | number ) => {
	if ( typeof value === "number" ) value = value.toFixed( 2 )
	return Number( value.replace( /\D/g, "" ) ) / 100
}

export const formatCurrency = ( value: number | string ) => {
	if ( typeof value === "string" ) value = parseCurrency( value )
	return value.toLocaleString( 'pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 } )
}