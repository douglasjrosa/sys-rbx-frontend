import { BlingOrderDataType, OrderStatusType, clientExists, fetchOrderData, getFormattedDate, handleInstallments, handleItems, postNLote, saveClient, sendBlingOrder, sendCardsToTrello, updateBusinessInStrapi, updateLastOrderInStrapi, updateOrderInStrapi } from "@/function/setOrderFunctions"
import { parseCurrency } from "@/utils/customNumberFormats"
import { Button, Modal, Text, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useToast } from "@chakra-ui/react"
import { useCallback, useState } from "react"


const SendOrderModal = ( props: any ) => {

	const { isOpen, onClose, onchat, orderData } = props

	const toast = useToast()
	const [ load, setload ] = useState<boolean>( false )

	const makeOrder: () => Promise<boolean> = useCallback(
		async () => {
			setload( true )
			
			toast( {
				title: "Aguarde. Enviando pedido...",
				status: "info",
				isClosable: true,
				position: 'bottom',
			} )

			const { propostaId, orderValue, vendedor, vendedorId, businessId } = orderData

			const order = await fetchOrderData( propostaId )
			const fullOrderData = order.data
			
			const orderStatus: OrderStatusType = fullOrderData.attributes?.orderStatus
				? JSON.parse( fullOrderData.attributes.orderStatus )
				: {
					blingClientExists: false,
					blingProductsExist: false,
					blingOrderCreated: false,
					strapiBusinessUpdated: false,
					strapiLastOrderUpdated: false,
					strapiLoteUpdated: false,
					trelloCardsCreated: false,
					strapiOrderUpdated: false
				}
			const orderId = fullOrderData.id

			// Handling clients in Bling
			toast( {
				title: "BLING: Checando cadastro do cliente...",
				description: "Verificando se o cliente já está cadastrado no Bling.",
				status: "success",
				isClosable: true,
				duration: 3000,
				position: "bottom",
			} )

			const blingAccountCnpj = fullOrderData.attributes.fornecedorId.data.attributes.CNPJ
			const clientCNPJ = fullOrderData.attributes.empresa.data.attributes.CNPJ

			const checkIfClientExists = await clientExists( blingAccountCnpj, clientCNPJ )
			const blingClientId = checkIfClientExists?.id

			if (
				blingClientId
				&& checkIfClientExists?.nome !== fullOrderData.attributes.empresa.data.attributes.razao
			) await saveClient( fullOrderData, blingClientId )


			const clientId = blingClientId ?? await saveClient( fullOrderData )
			
			if ( !clientId ) {
				toast( {
					title: "BLING: Não foi possível salvar um novo cliente no Bling.",
					description: `Erro na conta Bling de CNPJ: ${ blingAccountCnpj }`,
					status: "error",
					isClosable: true,
					duration: 30000,
					position: "bottom",
				} )
				orderStatus.blingClientExists = false
				console.error( { orderStatus } )
				return false
			}
			else orderStatus.blingClientExists = true


			// Handling products in Bling
			toast( {
				title: "BLING: Checando cadastro de cada produto...",
				description: "Verificando se todos os produtos já estão cadastrados no Bling.",
				status: "success",
				isClosable: true,
				duration: 7000,
				position: "bottom",
			} )
			const { itens } = fullOrderData.attributes
			const blingItems = await handleItems( blingAccountCnpj, itens, toast )
			if ( blingItems.length !== itens.length ) {
				toast( {
					title: "BLING: Ooops, tivemos um pequeno problema...",
					description: "Parece que nem todos os produtos foram corretamente cadastrados no Bling",
					status: "error",
					isClosable: true,
					duration: 30000,
					position: "bottom",
				} )
				orderStatus.blingProductsExist = false
				console.error( { orderStatus } )
				return false
			}
			else orderStatus.blingProductsExist = true


			// Handling order in Bling
			toast( {
				title: "BLING:",
				description: "Enviando pedido para o Bling...",
				status: "success",
				isClosable: true,
				duration: 3000,
				position: "bottom",
			} )

			const { dataEntrega, prazo, totalGeral } = fullOrderData.attributes
			const dataPrevista = dataEntrega
			const totalOrderValue = parseCurrency( totalGeral )
			const today = getFormattedDate()
			const installments = await handleInstallments( blingAccountCnpj, dataPrevista, prazo, totalOrderValue )

			const blingOrderData: BlingOrderDataType = {
				numero: +propostaId,
				data: today,
				dataSaida: dataEntrega,
				dataPrevista,
				contato: { id: clientId },
				itens: blingItems,
				parcelas: installments,
				numeroPedidoCompra: fullOrderData.attributes.cliente_pedido,
				outrasDespesas: parseCurrency( fullOrderData.attributes.custoAdicional ),
				desconto: {
					valor: parseCurrency( fullOrderData.attributes.descontoTotal )
				},
				transporte: {
					fretePorConta: fullOrderData.attributes.frete === "CIF" ? 0 : 1, // 0 = CIF, 1 = FOB
					frete: parseCurrency( fullOrderData.attributes.valorFrete )
				}
			}
			const blingOrder = await sendBlingOrder( blingAccountCnpj, blingOrderData )
			if ( !blingOrder.data?.id && blingOrder.error ) {

				const fields: string[] = []

				if ( blingOrder.error?.fields?.length ) {
					blingOrder.error.fields.map( ( field: any ) => {
						fields.push( field.msg )
						field.collection?.map( ( col: any ) => fields.push( col.msg ) )
					} )
				}


				let description = '<div><p>Pedido enviado com sucesso.</p>'
				if ( fields.length ) {
					description += '<ol>'
					description += fields.map( ( field: any, index: number ) => (
						`<li key='${ index }' >${ field }</li>`
					) )
					description += '</ol>'
				}
				description += '</div>'

				toast( {
					title: `BLING: ${ blingOrder.message }`,
					description,
					status: "error",
					isClosable: true,
					duration: 30000,
					position: "bottom",
				} )
				orderStatus.blingOrderCreated = false
				console.error( { orderStatus } )
				return false
			}
			else orderStatus.blingOrderCreated = true

			// Handling business update in Strapi
			toast( {
				title: "STRAPI:",
				description: "Atualizando informações do negócio...",
				status: "info",
				isClosable: true,
				duration: 3000,
				position: "bottom",
			} )
			const blingOrderId = String( blingOrder.data.id )
			const updateNegocio = await updateBusinessInStrapi( businessId, blingOrderId )
			
			if ( !updateNegocio.data?.id ) {

				toast( {
					title: "STRAPI: Ooops, tivemos um pequeno problema...",
					description: "Houve um erro ao atualizar o negócio.",
					status: "error",
					isClosable: true,
					duration: 30000,
					position: "bottom",
				} )
				orderStatus.strapiBusinessUpdated = false
				console.error( { orderStatus } )
				return false
			}
			else orderStatus.strapiBusinessUpdated = true

			// Handling company last order value
			toast( {
				title: "STRAPI:",
				description: "Atualizando o valor da última compra deste cliente...",
				status: "info",
				isClosable: true,
				duration: 3000,
				position: "bottom",
			} )
			const updateLastOrder = await updateLastOrderInStrapi( clientCNPJ, orderValue, vendedor, vendedorId )
			if ( !updateLastOrder.data?.id ) {

				toast( {
					title: "STRAPI: Ooops, tivemos um pequeno problema...",
					description: "Não foi possível atualizar o valor da última compra da empresa.",
					status: "error",
					isClosable: true,
					duration: 30000,
					position: "bottom",
				} )
				orderStatus.strapiLastOrderUpdated = false
				console.error( { orderStatus } )
				return false
			}
			else orderStatus.strapiLastOrderUpdated = true
			
			// Handling lote info
			toast( {
				title: "STRAPI:",
				description: "Atualizando informações de lote...",
				status: "info",
				isClosable: true,
				duration: 3000,
				position: "bottom",
			} )
			const nLoteUpdate = await postNLote( propostaId )
			if ( !Array.isArray( nLoteUpdate ) || !nLoteUpdate.length ) {

				toast( {
					title: "STRAPI: Ooops, tivemos um pequeno problema...",
					description: "Não foi possível atualizar o lote referente a esta compra.",
					status: "error",
					isClosable: true,
					duration: 30000,
					position: "bottom",
				} )
				orderStatus.strapiLoteUpdated = false
				console.error( { orderStatus } )
				return false
			}
			else orderStatus.strapiLoteUpdated = true

			// Handling Trello cards sending
			toast( {
				title: "TRELLO:",
				description: "Enviando os cards de pedido para o Trello...",
				status: "success",
				isClosable: true,
				duration: 3000,
				position: "bottom",
			} )
			const sendToTrello = await sendCardsToTrello( propostaId )
			if ( !sendToTrello.length ) {

				toast( {
					title: "TRELLO: Ooops, tivemos um pequeno problema...",
					description: "Erro ao enviar os cards para o Trello.",
					status: "error",
					isClosable: true,
					duration: 30000,
					position: "bottom",
				} )
				orderStatus.trelloCardsCreated = false
				console.error( { orderStatus } )
				return false
			}
			else orderStatus.trelloCardsCreated = true


			// Handling order update in Strapi
			toast( {
				title: "STRAPI:",
				description: "Salvando o pedido no banco de dados...",
				status: "info",
				isClosable: true,
				duration: 3000,
				position: "bottom",
			} )
			orderStatus.strapiOrderUpdated = true
			const orderUpdate = await updateOrderInStrapi( blingOrderId, orderId, orderStatus )
			
			if ( !orderUpdate.data?.id ) {

				toast( {
					title: "STRAPI: Ooops, tivemos um pequeno problema...",
					description: "Houve um erro ao atualizar o pedido.",
					status: "error",
					isClosable: true,
					duration: 30000,
					position: "bottom",
				} )
				orderStatus.strapiOrderUpdated = false
				console.error( { orderStatus } )
				return false
			}
			return true
		},
		[ 
			orderData,
			setload,
			useToast,
			fetchOrderData,
			clientExists,
			saveClient,
			handleItems,
			sendBlingOrder,
			updateBusinessInStrapi,
			updateLastOrderInStrapi,
			postNLote,
			sendCardsToTrello,
			updateOrderInStrapi,
			getFormattedDate
		 ]
	)


	const finalResponse = useCallback(
		async () => {

			const orderResponse = await makeOrder()

			if ( orderResponse ) {
				toast( {
					title: "Tudo certo!",
					description: "Pedido enviado com sucesso.",
					status: "success",
					isClosable: true,
					duration: 5000,
					position: "bottom",
				} )
			}
			else {
				toast( {
					title: "Algo não deu certo.",
					description: "Tente enviar o pedido novamente.",
					status: "warning",
					isClosable: true,
					duration: 30000,
					position: "bottom",
				} )
			}

			onClose()
			setload( false )
			onchat( true )
		},
		[ makeOrder, toast, onClose, setload, onchat ]
	)

	
	return (
		<Modal isCentered closeOnOverlayClick={ false } isOpen={ isOpen } onClose={ onClose }>
			<ModalOverlay
				bg='blackAlpha.300'
				backdropFilter='blur(10px) hue-rotate(90deg)'
			/>
			<ModalContent bg={ 'gray.600' }>
				<ModalHeader>Negócio Concluido</ModalHeader>
				<ModalBody>
					<Text>Para finalizar é necessário gerar um pedido para produção!</Text>
				</ModalBody>
				<ModalFooter>
					<Button
						fontSize={ '0.8rem' }
						p={ 3 }
						colorScheme={ "messenger" }
						isDisabled={ load }
						onClick={ finalResponse }
					>
						Gerar Pedido
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}
export default SendOrderModal