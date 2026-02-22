const CATEGORY_MAP: Record<string, string> = {
	caixa: 'Caixa',
	engradado: 'Engradado',
	palete: 'Palete',
	sarrafos: 'Sarrafos',
}

export function getProductCategory( modelo?: string ): string {
	if ( !modelo ) return 'Embalagem'

	for ( const [ prefix, category ] of Object.entries( CATEGORY_MAP ) ) {
		if ( modelo.startsWith( prefix ) ) return category
	}

	return 'Embalagem'
}

interface ProductLike {
	modelo?: string
	nomeProd?: string
	comprimento?: string | number
	largura?: string | number
	altura?: string | number
}

export function buildProductDisplayName( product: ProductLike ): string {
	const category = getProductCategory( product.modelo )
	const nomeProd = ( product.nomeProd ?? '' ).trim()

	if ( nomeProd ) return `${ category }: ${ nomeProd }`

	const comp = product.comprimento
	const larg = product.largura
	const alt = product.altura

	if ( comp && larg && alt ) {
		return `${ category } ${ comp } x ${ larg } x ${ alt }cm (alt.)`
	}
	if ( comp && larg ) {
		return `${ category } ${ comp } x ${ larg }cm`
	}

	return category
}
