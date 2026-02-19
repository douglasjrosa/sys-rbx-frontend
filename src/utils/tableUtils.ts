import { marginTables } from '@/components/data/marginTables'

export const getTableBadgeColor = ( tableName?: string ) => {
	if ( !tableName ) return 'gray'
	const name = tableName.toLowerCase()
	if ( name.includes( 'balcão' ) ) return 'gray'
	if ( name.includes( 'vip' ) ) return 'blue'
	if ( name.includes( 'bronze' ) ) return 'orange'
	if ( name.includes( 'prata' ) ) return 'gray'
	if ( name.includes( 'ouro' ) ) return 'yellow'
	if ( name.includes( 'platina' ) ) return 'cyan'
	if ( name.includes( 'estratégico' ) ) return 'purple'
	return 'teal'
}

export const getTableNameInPortuguese = ( margin?: number | string ) => {
	if ( margin === undefined || margin === null ) return '-'
	
	const marginStr = String( margin ).trim()
	
	// Se já for um nome de tabela conhecido (em qualquer idioma/case)
	const tableByName = marginTables.find( t => 
		t.name.toLowerCase() === marginStr.toLowerCase() || 
		(t as any).id.toString() === marginStr
	)
	if ( tableByName ) return tableByName.name

	// Tentar converter para número (tratando porcentagens)
	let marginValue = parseFloat( marginStr.replace( '%', '' ) )
	if ( isNaN( marginValue ) ) return marginStr

	// Se for um valor como 19 ou 30, converter para decimal (0.19, 0.30)
	if ( marginValue > 1 && !marginStr.includes( '.' ) ) {
		marginValue = marginValue / 100
	}
	
	// Tentar encontrar correspondência exata
	const exactTable = marginTables.find( t => t.profitMargin.toFixed( 2 ) === marginValue.toFixed( 2 ) )
	if ( exactTable ) return exactTable.name

	// Se não houver correspondência exata, encontrar a tabela com a margem mais próxima
	let closestTable = marginTables[ 0 ]
	let minDiff = Math.abs( marginValue - marginTables[ 0 ].profitMargin )

	for ( let i = 1; i < marginTables.length; i++ ) {
		const diff = Math.abs( marginValue - marginTables[ i ].profitMargin )
		if ( diff < minDiff ) {
			minDiff = diff
			closestTable = marginTables[ i ]
		}
	}

	return closestTable.name
}
