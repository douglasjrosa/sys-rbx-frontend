export const parseCurrency = ( value: string | number | undefined | null ) => {
	if ( !value ) return 0
	if ( typeof value === "number" ) value = value.toFixed( 2 )
	return Number( value.replace( /\D/g, "" ) ) / 100
}

export const formatCurrency = ( value: number | string | undefined | null ) => {
	if ( !value ) value = 0
	if ( typeof value === "string" ) value = parseCurrency( value )
	return value.toLocaleString( 'pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 } )
}

/** Formats budget string (e.g. "1234,56") to display format xx.xxx,xx */
export const formatBudgetDisplay = ( value: string | undefined | null ): string => {
	if ( !value || typeof value !== "string" ) return "0,00"
	const parts = value.split( "," )
	const intPart = ( parts[0] || "0" ).replace( /\D/g, "" ).replace( /^0+/, "" ) || "0"
	const decPart = ( parts[1] || "00" ).replace( /\D/g, "" ).slice( 0, 2 ).padEnd( 2, "0" )
	const withDots = intPart.replace( /\B(?=(\d{3})+(?!\d))/g, "." )
	return `${withDots},${decPart}`
}