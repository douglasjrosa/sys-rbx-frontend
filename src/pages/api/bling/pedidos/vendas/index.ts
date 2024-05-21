import { NextApiRequest, NextApiResponse } from "next"
import { clientExists, saveNewClient, getBlingProductByCodigo, createBlingProduct, getFormaPagamentoId, createBlingOrder, updateBlingProduct } from "@/pages/api/bling"

const getFormattedDate = ( srcDate?: Date ): string => {
	const date = srcDate ? srcDate : new Date()
	const year = date.getFullYear()
	const month = String( date.getMonth() + 1 ).padStart( 2, "0" )
	const day = String( date.getDate() ).padStart( 2, "0" )
	const formattedDate = `${ year }-${ month }-${ day }`
	return formattedDate
}

const CRUD = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {

	const blingAuthorization = req.headers.authorization as string

	if ( req.method === "POST" ) {

		const orderData: {
			nPedido: string
			empresa: any
			vendedor: string
			itens: any
			dataEntrega: string
			prazo: string
			totalGeral: string
		} = req.body.data.attributes

		const checkIfClientExists = await clientExists( blingAuthorization, orderData )

		const clientId: number = checkIfClientExists
			? checkIfClientExists
			: await saveNewClient( blingAuthorization, orderData )

		if ( !clientId ) {
			const response = {
				msg: "O cliente não foi encontrado ou não pôde ser criado na plataforma Bling"
			}
			res.status( 204 ).send( response )
		}

		const items: any[] = []
		let totalOrderValue: number = 0
		for( const item of orderData.itens ) {

			
			// first of all, check if the product is already registered in Bling
			const { prodId, nomeProd, ncm, expo, mont, vFinal, Qtd } = item
			const itemCodigo = item.codigo
			
			
			const descricao = nomeProd + ( expo ? " -EXP" : "" ) + ( mont ? " -MONTADA" : "" )
			
			let preco: number = parseFloat( vFinal.replace( /[^0-9,]/g, "" ).replace( ",", "." ) )
			const acrescimo = 1 + ( expo ? 0.1 : 0 ) + ( mont ? 0.1 : 0 )
			preco = +( preco * acrescimo ).toFixed( 2 )
			
			const prodCodigo = prodId + ( expo ? "-EXP" : "" ) + ( mont ? "-MONT" : "" )
			
			const productData = {
				codigo: prodCodigo,
				nome: descricao,
				tipo: "P",
				situacao: "A",
				formato: "S",
				unidade: "Un",
				preco,
				tributacao: { ncm }
			}
			
			const getBlingProd = await getBlingProductByCodigo( blingAuthorization, prodCodigo )
			if ( getBlingProd.hasOwnProperty( "id" ) ) {
				if ( getBlingProd.preco !== preco ) {
					await updateBlingProduct( blingAuthorization, getBlingProd.id, productData )
				}
			}
			
			const blingProdId = getBlingProd.hasOwnProperty( "id" )
				? getBlingProd.id
				: await createBlingProduct( blingAuthorization, productData )
			

			const quantidade: number = +Qtd
			totalOrderValue += preco * quantidade

			items.push({
				descricao,
				valor: preco,
				codigo: itemCodigo,
				unidade: "Un",
				quantidade,
				produto: {
					id: blingProdId
				}
			})
		}

		const { nPedido, dataEntrega, prazo } = orderData

		const installments: any[] = []
		const dueDays = prazo.split( "/" )
		let lastInstallmentValue = totalOrderValue
		let count = 0
		for ( const dueDay of dueDays) {
			const deliverDate = new Date( dataEntrega )
			const dueDate = new Date( deliverDate.getTime() + +dueDay * 24 * 60 * 60 * 1000 )
			const formaPagamentoId = await getFormaPagamentoId( blingAuthorization, prazo )
			const valor = Math.ceil( ( totalOrderValue / dueDays.length ) * 100 ) / 100
			lastInstallmentValue -= valor
			installments.push({
				dataVencimento: getFormattedDate( dueDate ),
				formaPagamento: {
					id: formaPagamentoId
				},
				valor: dueDays.length === count ? lastInstallmentValue : valor 
			} )
			count++
		}

		const blingOrderData = {
			numero: +nPedido,
			data: getFormattedDate(),
			dataSaida: dataEntrega,
			dataPrevista: dataEntrega,
			contato: { id: clientId },
			itens: items,
			parcelas: installments
		}

		const blingOrder = await createBlingOrder( blingAuthorization, blingOrderData )

		if ( blingOrder.hasOwnProperty( "error" ) ) {
			const errorMessages = [ blingOrder.error.description ]
			blingOrder.error.fields?.map( ( field: any ) => {
				errorMessages.push( field.msg )
			} )
			res.status( 400 ).send( { blingError: blingOrder.error } )
		}

		res.status( 201 ).send( blingOrder )

	}
}
export default CRUD