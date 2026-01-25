import { mask } from "remask"

export const formatCNAE = ( valor: string ): string => {
	if ( !valor ) return ""
	const numeros = valor.replace( /\D/g, "" )
	if ( numeros.length === 0 ) return ""
	return mask( numeros, [ "9999-9/99" ] )
}

export const sanitizeCNAE = ( valor: string ): string => {
	if ( !valor ) return ""
	return valor.replace( /\D/g, "" )
}
