

export const blingApiUrl = process.env.BLING_API_V3_ENDPOINT as string

export const fetchBling: {
	get: ( blingAuthorization: string, endpoint: string, queryString?: string ) => Promise<any>,
	post: ( blingAuthorization: string, endpoint: string, bodyData: Record<string, string | number | symbol | any> ) => Promise<any>,
	put: ( blingAuthorization: string, endpoint: string, bodyData: Record<string, string | number | symbol | any> ) => Promise<any>
} = {
	get: async ( blingAuthorization, endpoint, queryString = "" ) => {
		try {
			const queryStringUrl = blingApiUrl + endpoint + queryString

			return await fetch( queryStringUrl, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: blingAuthorization
				}
			} ).then( r => r.json() )
		}
		catch ( error ) {
			console.error( error )
		}
	},
	post: async ( blingAuthorization: string, endpoint: string, bodyData: Record<string, string | number | symbol | any> ) => {
		try {
			const queryStringUrl = blingApiUrl + endpoint

			return await fetch( queryStringUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: blingAuthorization
				},
				body: JSON.stringify( bodyData )
			} ).then( r => r.json() )
		}
		catch ( error ) {
			console.error( error )
		}
	},
	put: async ( blingAuthorization: string, endpoint: string, bodyData: Record<string, string | number | symbol | any> ) => {
		try {
			const queryStringUrl = blingApiUrl + endpoint

			return await fetch( queryStringUrl, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: blingAuthorization
				},
				body: JSON.stringify( bodyData )
			} ).then( r => r.json() )
		}
		catch ( error ) {
			console.error( error )
		}
	}
}


// Getting the company id if it exists
export const clientExists = async ( blingAuthorization: string, orderData: any ) => {

	const clientData = orderData.empresa.data.attributes
	const clientQueryString = `?pesquisa=${ clientData.CNPJ }`

	const searchClient = await fetchBling.get( blingAuthorization, "/contatos", clientQueryString )

	if (
		typeof searchClient === 'object'
		&& searchClient !== null &&
		searchClient.hasOwnProperty( 'data' )
		&& Array.isArray( searchClient.data )
		&& searchClient.data.length > 0
		&& searchClient.data.hasOwnProperty( 0 )
		&& typeof searchClient.data[ 0 ] === 'object'
		&& searchClient.data[ 0 ] !== null
		&& searchClient.data[ 0 ].hasOwnProperty( 'id' )
		&& typeof searchClient.data[ 0 ].id === 'number'
	)
		return searchClient.data[ 0 ].id
	else
		return ""
}

export const saveNewClient = async ( blingAuthorization: string, orderData: any ) => {

	const clientData = orderData.empresa.data.attributes
	const clientStrapiId = orderData.empresa.data.id

	// Taking the types of contact of "Vendedor" and "Cliente" to save in the company data later in Bling
	const typesOfContacts = await fetchBling.get( blingAuthorization, "/contatos/tipos" )
	const typeOfContactVendedorId = typesOfContacts.data.find( ( type: any ) => type.descricao === 'Vendedor' ).id
	const typeOfContactClienteId = typesOfContacts.data.find( ( type: any ) => type.descricao === 'Cliente' ).id

	const vendedorQueryString = `?pesquisa=${ orderData.vendedor }&idTipoContato=${ typeOfContactVendedorId }`

	const vendedorBling = await fetchBling.get( blingAuthorization, "/contatos", vendedorQueryString )
	const vendedorBlingId = vendedorBling.data[ 0 ].id



	// Taking the financial category to save in the company data later in Bling
	const financialCategories = await fetchBling.get( blingAuthorization, "/categorias/receitas-despesas" )
	const financialCategoryId = financialCategories.data.find( ( category: any ) => category.descricao === "Vendas de produtos" ).id



	const newClientData = {
		"nome": clientData.nome,
		"codigo": clientStrapiId,
		"situacao": "A",
		"numeroDocumento": clientData.CNPJ,
		"telefone": clientData.fone,
		"fantasia": clientData.nome,
		"tipo": "J",
		"indicadorIe": 1,
		"ie": clientData.Ie,
		"email": clientData.emailNfe,
		"endereco": {
			"geral": {
				"endereco": clientData.endereco,
				"cep": clientData.cep,
				"bairro": clientData.bairro,
				"municipio": clientData.cidade,
				"uf": clientData.uf,
				"numero": clientData.numero,
				"complemento": clientData.complemento
			},
			"cobranca": {
				"endereco": clientData.endereco,
				"cep": clientData.cep,
				"bairro": clientData.bairro,
				"municipio": clientData.cidade,
				"uf": clientData.uf,
				"numero": clientData.numero,
				"complemento": clientData.complemento
			}
		},
		"vendedor": {
			"id": vendedorBlingId
		},
		"financeiro": {
			"limiteCredito": 10000000,
			"condicaoPagamento": "28 35 42",
			"categoria": {
				"id": financialCategoryId
			}
		},
		"pais": {
			"nome": "BRASIL"
		},
		"tiposContato": [
			{
				"id": typeOfContactClienteId,
				"descricao": "Cliente"
			}
		]
	}

	const saveNewClientData = await fetchBling.post( blingAuthorization, "/contatos", newClientData )

	if (
		typeof saveNewClientData === "object"
		&& saveNewClientData !== null
		&& saveNewClientData.hasOwnProperty( "data" )
		&& typeof saveNewClientData.data === "object"
		&& saveNewClientData.data !== null
		&& saveNewClientData.data.hasOwnProperty( "id" )
		&& typeof saveNewClientData.data.id === "number"
	)
		return saveNewClientData.data.id
	else
		return ""
}

export const getBlingProductByCodigo: (
	blingAuthorization: string,
	codigo: string
) => Promise<any> = async ( blingAuthorization, codigo ) => {
	const product = await fetchBling.get( blingAuthorization, `/produtos?codigo=${ codigo }` )
	return product.data?.length ? product.data[ 0 ] : []
}

export const createBlingProduct: (
	blingAuthorization: string,
	productData: Record<string, string | number | any>,
	delay?: number
) => Promise<number> = async ( blingAuthorization, productData, delay = 0 ) => {
	if ( delay === 3000 ) return 0
	delay += 1000
	const product = await fetchBling.post( blingAuthorization, "/produtos", productData )
	if ( product?.data?.id ) return product.data.id
	else {
		console.log( { createProduct: product, delay } )
		if ( delay ) await new Promise( resolve => setTimeout( resolve, delay ) )
		return await createBlingProduct( blingAuthorization, productData, delay )
	}
}

export const updateBlingProduct: (
	blingAuthorization: string,
	blingProdId: number,
	productData: Record<string, string | number | any>,
	delay?: number
) => Promise<any> = async ( blingAuthorization, blingProdId, productData, delay = 0 ) => {
	if ( delay === 3000 ) return {}
	delay += 1000
	const product = await fetchBling.put( blingAuthorization, `/produtos/${ blingProdId }`, productData )
	if ( product?.data ) product.data
	else {
		console.log( { updateProduct: product, delay } )
		if ( delay ) await new Promise( resolve => setTimeout( resolve, delay ) )
		return await updateBlingProduct( blingAuthorization, blingProdId, productData, delay )
	}
}

export const getFormaPagamentoId = async ( blingAuthorization: string, prazo: string ): Promise<number> => {
	const formaPagamento = await fetchBling.get( blingAuthorization, `/formas-pagamentos?descricao=${ prazo } dias` )
	if (
		typeof formaPagamento === "object"
		&& formaPagamento.hasOwnProperty( "data" )
		&& Array.isArray( formaPagamento.data )
		&& formaPagamento.data.length > 0
		&& formaPagamento.data[ 0 ].hasOwnProperty( "id" )
	)
		return formaPagamento.data[ 0 ].id
	else
		return 0
}

interface BlingOrderDataType {
	numero: number
	data: string
	dataSaida: string
	dataPrevista: string
	contato: { id: number }
	itens: {
		descricao: string
		valor: number
		codigo: string | number | undefined
		unidade: string
		quantidade: number
		produto: { id: number }
	}[]
	parcelas: {
		dataVencimento: string
		formaPagamento: { id: number }
		valor: number
	}[]
}

export const createBlingOrder = async ( blingAuthorization: string, blingOrderData: BlingOrderDataType ): Promise<any> => {
	return await fetchBling.post( blingAuthorization, "/pedidos/vendas", blingOrderData )
}