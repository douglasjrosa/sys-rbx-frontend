import { parseCurrency } from "@/utils/customNumberFormats"

export type BlingOrderDataType = {
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
	numeroPedidoCompra: string
	outrasDespesas: number
	desconto: {
		valor: number
	}
	transporte: {
		fretePorConta: 0 // Contratação do Frete por conta do Remetente (CIF)
		| 1 // Contratação do Frete por conta do Destinatário (FOB)
		| 2 // Contratação do Frete por conta de terceiros
		| 3 // Transporte Próprio por conta do Remetante
		| 4 // Transporte Próprio por conta do Destinatário
		| 9 // Sem Ocorrência de Transporte
		frete: number
	}
}

export type InstallmentsType = {
	dataVencimento: string
	formaPagamento: { id: number }
	valor: number
}

export type OrderStatusType = {
	blingClientExists: boolean
	blingProductsExist: boolean
	blingOrderCreated: boolean
	strapiBusinessUpdated: boolean
	strapiLastOrderUpdated: boolean
	strapiLoteUpdated: boolean
	trelloCardsCreated: boolean
	strapiOrderUpdated: boolean
}

export const clientExists = async ( blingAccountCnpj: string, clientCnpj: string ): Promise<any> => {
	try {
		const response = await fetch( `/api/bling/${ blingAccountCnpj }/contatos?pesquisa=${ clientCnpj }` )

		if ( !response.ok ) {
			throw new Error( `Error fetching client: ${ response.statusText }` )
		}

		const searchClient = await response.json()

		if ( searchClient.data && searchClient.data.length > 0 ) {
			return searchClient.data[ 0 ]
		}

		return {}
	} catch ( error ) {
		console.error( "Error:", error )
		return {}
	}
}

export const saveClient = async ( orderData: any, blingClientId?: number ): Promise<number> => {

	const clientData = orderData.attributes.empresa.data.attributes
	const clientStrapiId = orderData.attributes.empresa.data.id
	const blingAccountCnpj = orderData.attributes.fornecedorId.data.attributes.CNPJ


	// Taking the types of contact of "Vendedor" and "Cliente" to save in the company data later in Bling
	const typesOfContactsResponse = await fetch( `/api/bling/${ blingAccountCnpj }/contatos/tipos` )

	if ( !typesOfContactsResponse.ok ) {
		throw new Error( `Error fetching client: ${ typesOfContactsResponse.statusText }` )
	}
	const typesOfContacts = await typesOfContactsResponse.json()

	const typeOfContactClienteId = typesOfContacts.data.find( ( type: any ) => type.descricao === 'Cliente' ).id


	// Taking the financial category to save in the company data later in Bling
	const financialCategoriesResponse = await fetch( `/api/bling/${ blingAccountCnpj }/categorias/receitas-despesas` )

	if ( !financialCategoriesResponse.ok ) {
		throw new Error( `Error fetching client: ${ financialCategoriesResponse.statusText }` )
	}
	const financialCategories = await financialCategoriesResponse.json()

	const financialCategoryId = financialCategories.data.find( ( category: any ) => category.descricao === "Vendas de produtos" ).id

	const newClientData = {
		"nome": clientData.razao,
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

	const method = blingClientId ? "PUT" : "POST"
	const updateString = blingClientId ? `/${ blingClientId }` : ""

	const saveClientResponse = await fetch( `/api/bling/${ blingAccountCnpj }/contatos${ updateString }`, {
		method,
		body: JSON.stringify( newClientData )
	} )

	const saveClientData = saveClientResponse.statusText !== "No Content"
		? await saveClientResponse.json()
		: {}


	if ( !blingClientId && !saveClientResponse.ok ) {
		console.error( saveClientResponse )
		throw new Error( `Error fetching client: ${ saveClientResponse.statusText }` )
	}

	return blingClientId || saveClientData.data?.id || 0
}

export const postNLote = async ( propostaId: string ) => {
	const response = await fetch( `/api/db/nLote/${ propostaId }`, { method: 'POST' } )
	const data = await response.json()
	if ( !response.ok ) {
		console.error( data )
		throw new Error( `Error fetching order: ${ response.statusText }` )
	}
	return data
}

export const fetchOrderData = async ( propostaId: string ) => {
	const response = await fetch( `/api/strapi/pedidos/${ propostaId }?populate=*` )
	if ( !response.ok ) throw new Error( `Error fetching order: ${ response.statusText }` )
	return await response.json()
}

export const sendCardsToTrello = async ( propostaId: string ) => {
	const response = await fetch( `/api/db/trello/${ propostaId }`, { method: 'POST' } )
	if ( !response.ok ) throw new Error( `Error fetching order: ${ response.statusText }` )
	return await response.json()
}

export const getBlingProductByCodigo = async ( blingAccountCnpj: string, codigo: string ): Promise<any> => {

	const response = await fetch( `/api/bling/${ blingAccountCnpj }/produtos?codigo=${ codigo }` )
	const product = await response.json()

	if ( !response.ok ) {
		console.error( product )
		throw new Error( `Error fetching product: ${ response.statusText }` )
	}

	return product.data?.[ 0 ] ?? {}
}

export const getBlingProductByName = async ( blingAccountCnpj: string, nomeProd: string ): Promise<any> => {

	const response = await fetch( `/api/bling/${ blingAccountCnpj }/produtos?nome=${ nomeProd }` )
	const product = await response.json()

	if ( !response.ok ) {
		console.error( product )
		throw new Error( `Error fetching product: ${ response.statusText }` )
	}

	return product.data?.[ 0 ] ?? {}
}

export const updateBlingProduct = async (
	blingAccountCnpj: string,
	blingProdId: number,
	productData: Record<string, string | number | any>,
	delay: number = 0
): Promise<number | null> => {

	const response = await fetch( `/api/bling/${ blingAccountCnpj }/produtos/${ blingProdId }`, {
		method: 'PUT',
		body: JSON.stringify( productData )
	} )
	if ( !response.ok ) throw new Error( `Error fetching product: ${ response.statusText }` )
	const product = await response.json()

	if ( !product.data?.id ) {
		if ( delay === 3000 ) return null
		if ( delay ) await new Promise( resolve => setTimeout( resolve, delay ) )
		return await updateBlingProduct( blingAccountCnpj, blingProdId, productData, delay + 1000 )
	}
	return product.data.id
}

export const createBlingProduct = async (
	blingAccountCnpj: string,
	productData: Record<string, string | number | any>,
	delay: number = 0
): Promise<number | null> => {

	const response = await fetch( `/api/bling/${ blingAccountCnpj }/produtos`, {
		method: 'POST',
		body: JSON.stringify( productData )
	} )

	const product = await response.json()

	if ( !response.ok ) {
		console.error( product )
		throw new Error( `Error fetching product: ${ response.statusText }` )
	}

	if ( !product.data?.id ) {
		if ( delay === 3000 ) return null
		if ( delay ) await new Promise( resolve => setTimeout( resolve, delay ) )
		return await createBlingProduct( blingAccountCnpj, productData, delay + 1000 )
	}
	return product.data.id
}

export const handleItems = async ( blingAccountCnpj: string, items: any[], toast: any ): Promise<any> => {

	let respItems: any[] = []
	let index = 0
	for ( const item of items ) {
		index++

		// first of all, check if the product is already registered in Bling
		const { nomeProd, ncm, expo, mont, vFinal, Qtd, codigo } = item

		toast( {
			title: `Checando item ${ index }`,
			description: nomeProd,
			status: "success",
			isClosable: true,
			duration: 7000,
			position: "bottom",
		} )

		let preco: number = parseCurrency( vFinal )
		const acrescimo = 1 + ( expo ? 0.1 : 0 ) + ( mont ? 0.1 : 0 )
		preco = +( preco * acrescimo ).toFixed( 2 )

		const productData = {
			codigo,
			nome: nomeProd,
			tipo: "P",
			situacao: "A",
			formato: "S",
			unidade: "Un",
			preco,
			tributacao: { ncm }
		}

		let getBlingProd

		if ( !!codigo ) getBlingProd = await getBlingProductByCodigo( blingAccountCnpj, codigo )

		if ( !getBlingProd?.id )
			getBlingProd = await getBlingProductByName( blingAccountCnpj, nomeProd )

		let blingProdId = getBlingProd?.id

		if ( !!blingProdId && getBlingProd.nome !== nomeProd )
			blingProdId = await updateBlingProduct( blingAccountCnpj, blingProdId, productData )

		blingProdId = blingProdId || await createBlingProduct( blingAccountCnpj, productData )

		if ( !blingProdId ) {
			console.error( { getBlingProd, blingProdId } )
			throw new Error( `Error creating product: in handleItems() function.` )
		}

		respItems.push( {
			descricao: nomeProd,
			valor: preco,
			codigo,
			unidade: "Un",
			quantidade: +Qtd,
			produto: { id: blingProdId }
		} )
	}

	return respItems
}

export const fetchFormaPagamentoId = async ( blingAccountCnpj: string, prazo: string ): Promise<number> => {
	const response = await fetch( `/api/bling/${ blingAccountCnpj }/formas-pagamentos?descricao=${ prazo } dias` )

	if ( !response.ok ) throw new Error( `Error fetching 'Formas de pagamento': ${ response.statusText }` )
	const formaPagamento = await response.json()

	return formaPagamento.data?.[ 0 ]?.id ?? 0
}

export const getFormattedDate = ( srcDate?: Date ): string => {
	const date = srcDate ? srcDate : new Date()
	const year = date.getFullYear()
	const month = String( date.getMonth() + 1 ).padStart( 2, "0" )
	const day = String( date.getDate() ).padStart( 2, "0" )
	const formattedDate = `${ year }-${ month }-${ day }`
	return formattedDate
}

export const handleInstallments = async ( blingAccountCnpj: string, dataPrevista: string, prazo: string, totalOrderValue: number ): Promise<InstallmentsType[]> => {

	const dueDays = prazo.split( "/" )
	const countInstallments = dueDays.length

	// Calcular o valor base arredondado para duas casas decimais
	const baseInstallment = Math.floor( ( totalOrderValue / countInstallments ) * 100 ) / 100

	// Criar um array de parcelas com o valor base
	let installmentValues = Array( countInstallments ).fill( baseInstallment )

	// Calcular o valor total base e o valor restante
	const totalBase = baseInstallment * countInstallments
	const remainingValue = totalOrderValue - totalBase

	// Ajustar a última parcela para compensar o valor restante
	installmentValues[ installmentValues.length - 1 ] = ( baseInstallment + remainingValue )

	// Garantir que todas as parcelas sejam números com duas casas decimais
	installmentValues = installmentValues.map( inst => Number( inst.toFixed( 2 ) ) )

	const installments = []
	for ( const [ key, dueDay ] of Object.entries( dueDays ) ) {

		const deliverDate = new Date( dataPrevista )
		const daysToAdd = ( +dueDay + 1 ) * 24 * 60 * 60 * 1000
		const dueDate = new Date( deliverDate.getTime() + daysToAdd )
		const formaPagamentoId = await fetchFormaPagamentoId( blingAccountCnpj, prazo )

		installments.push( {
			dataVencimento: getFormattedDate( dueDate ),
			formaPagamento: {
				id: formaPagamentoId
			},
			valor: installmentValues[ +key ]
		} )
	}

	return installments
}

export const blingOrderExists = async ( blingAccountCnpj: string, orderNumber: string ): Promise<number> => {
	const response = await fetch( `/api/bling/${ blingAccountCnpj }/pedidos/vendas?numero=${ orderNumber }` )

	const responseData = await response.json()

	if ( !response.ok ) {
		console.error( responseData )
		throw new Error( `Error fetching Bling to send order: ${ response.statusText }` )
	}
	return responseData.data?.[ 0 ]?.id ?? 0
}

export const sendBlingOrder = async ( blingAccountCnpj: string, orderData: any ) => {

	const orderId = await blingOrderExists( blingAccountCnpj, String( orderData.numero ) )

	const method = orderId ? "PUT" : "POST"
	const putEndpoint = orderId ? `/${ orderId }` : ""

	const response = await fetch( `/api/bling/${ blingAccountCnpj }/pedidos/vendas${ putEndpoint }`, {
		method,
		body: JSON.stringify( orderData )
	} )

	const responseData = await response.json()

	if ( !response.ok ) {
		console.error( responseData )
		throw new Error( `Error fetching Bling to send order: ${ response.statusText }` )
	}
	return responseData
}

export const updateOrderInStrapi = async ( blingOrderId: string, orderId: number, orderStatus: OrderStatusType ) => {
	orderStatus.strapiOrderUpdated = true
	const response = await fetch( `/api/strapi/pedidos/${ orderId }`, {
		method: 'PUT',
		body: JSON.stringify( {
			data: {
				Bpedido: blingOrderId,
				stausPedido: true,
				orderStatus: JSON.stringify( orderStatus )
			}
		} )
	} )

	const responseData = await response.json()
	if ( !response.ok ) {
		console.error( responseData )
		throw new Error( `Error fetching order: ${ response.statusText }` )
	}
	return responseData
}

export const updateBusinessInStrapi = async ( negocioId: string, blingOrderId: string ) => {
	const response = await fetch( `/api/strapi/businesses/${ negocioId }`, {
		method: 'PUT',
		body: JSON.stringify( {
			data: {
				Bpedido: blingOrderId,
				stausPedido: true
			}
		} )
	} )
	if ( !response.ok ) throw new Error( `Error fetching order in Strapi: ${ response.statusText }` )
	return await response.json()
}

export const fetchStrapiClientId = async ( clientCNPJ: string ): Promise<number | null> => {
	const response = await fetch( `/api/strapi/empresas?filters[CNPJ]=${ clientCNPJ }` )
	const responseData = await response.json()

	if ( !response.ok ) {
		console.error( responseData )
		throw new Error( `Error fetching client by CNPJ in Strapi: ${ response.statusText }` )
	}
	return responseData.data?.[ 0 ]?.id ?? null
}

export const updateLastOrderInStrapi = async ( clientCNPJ: string, orderValue: string, vendedor: string, vendedorId: string ) => {
	const DateNow = new Date()

	const clientId = await fetchStrapiClientId( clientCNPJ )

	const response = await fetch( `/api/strapi/empresas/${ clientId }`, {
		method: 'PUT',
		body: JSON.stringify( {
			data: {
				ultima_compra: DateNow.toISOString().slice( 0, 10 ),
				valor_ultima_compra: orderValue,
				vendedor,
				vendedorId
			}
		} )
	} )

	const responseData = await response.json()

	if ( !response.ok ) {
		console.error( responseData )
		throw new Error( `Error fetching last order in Strapi: ${ response.statusText }` )
	}
	return responseData
}
