import AddItemButton from "@/components/addItemButton"
import AditionalCosts from "@/components/aditionalCosts"
import AditionalDiscount from "@/components/adtitionalDiscount"
import DeliverDate from "@/components/deliverDate"
import EmitenteSelect from "@/components/emitenteSelect"
import PaymentTerms from "@/components/paymentTerms"
import FreightCost from "@/components/freightCost"
import FreightSelect from "@/components/freightSelect"
import { LabelEmpresa } from "@/components/labelEmpresa"
import ProductsSelect from "@/components/productsSelect"
import TableItems from "@/components/tableItems"
import { customDateIso } from "@/utils/customDateFunctions"
import { Box, Button, Flex, FormLabel, Heading, IconButton, Input, Textarea, chakra, useToast } from "@chakra-ui/react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import { BsArrowLeftCircleFill } from "react-icons/bs"
import { formatCurrency, parseCurrency } from "@/utils/customNumberFormats"

const Proposta = () => {
	const router = useRouter()
	const { data: session, status } = useSession()
	const [ user, setUser ] = useState<any>()

	const toast = useToast()
	const [ loading, setLoading ] = useState( false )

	const { businessId } = router.query

	const [ enableFetches, setEnableFetches ] = useState<string>( "not yet allowed" )

	const [ deliverDate, setDeliverDate ] = useState( customDateIso( 7 ) )

	const [ accountsData, setAccountsData ] = useState<any[]>()
	const [ businessData, setBusinessData ] = useState<any[]>()
	const [ emitenteCnpj, setEmitenteCnpj ] = useState( "" )
	const [ emitenteId, setEmitenteId ] = useState( "" )
	const [ companyData, setCompanyData ] = useState<any>()
	const [ orderData, setOrderData ] = useState<any>()

	const [ paymentTerms, setPaymentTerms ] = useState<string>( "1" )
	const [ freightCost, setFreightCost ] = useState( 0 )
	const [ freightType, setFreightType ] = useState( "FOB" )

	const [ aditionalDiscount, setAditionalDiscount ] = useState( 0 )
	const [ aditionalCosts, setAditionalCosts ] = useState( 0 )
	const [ subtotal, setSubtotal ] = useState( 0 )

	const [ clientOrderNumber, setClientOrderNumber ] = useState( "" )
	const [ orderObservations, setOrderObservations ] = useState( "" )

	const [ currentProductSelected, setCurrentProductSelected ] = useState( "" )
	const [ itemsList, setItemsList ] = useState<any[]>( [] )

	const [ orderTotalValue, setOrderTotalValue ] = useState( "0,00" )
	const [ orderSaveData, setOrderSaveData ] = useState<any>()

	useEffect( () => {
		if ( status === 'unauthenticated' ) {
			router.push( '/auth/signin' )
		}
	}, [] )

	if ( status === 'authenticated' && !user ) {
		setUser( session.user )
	}

	const fetchBusiness = useCallback( async () => {
		const response = await fetch( `/api/strapi/businesses/${ businessId }?populate=*` )
		const business = await response.json()

		const businessData = business.data

		const companyData = businessData.attributes.empresa.data

		const [ pedido ] = businessData.attributes.pedidos.data
		const orderData = pedido

		return { businessData, companyData, orderData }
	}, [ businessId ] )

	const fetchAccounts = useCallback( async () => {
		const response = await fetch( '/api/strapi/tokens' )

		if ( !response.ok ) console.error( response )

		const accounts = await response.json()

		return [ { attributes: { cnpj: '', account: 'Selecione um emitente' } }, ...accounts.data ]
	}, [] )

	useEffect( () => {

		const subtotal = parseCurrency( itemsList
			.map( i => parseCurrency( i.total ) )
			.reduce( ( acc, curr ) => acc + curr, 0 )
		)
		setSubtotal( subtotal )

		const totalValue = subtotal
			+ parseCurrency( aditionalCosts )
			- parseCurrency( aditionalDiscount )
			+ parseCurrency( freightCost )


		setOrderTotalValue( formatCurrency( totalValue ) )

	}, [ itemsList, freightCost, aditionalDiscount, aditionalCosts ] )

	useEffect( () => {
		( async () => {
			if ( enableFetches === "not yet allowed" ) setEnableFetches( "allow" )

			if ( enableFetches === "allow" ) {
				if ( businessId && !companyData?.attributes?.nome ) {
					setEnableFetches( "disallow" )
					const [ accountsData, fetchBusinessResponse ] = await Promise.all( [ fetchAccounts(), fetchBusiness() ] )
					setAccountsData( accountsData )
					setBusinessData( fetchBusinessResponse.businessData )
					setCompanyData( fetchBusinessResponse.companyData )
					setOrderData( fetchBusinessResponse.orderData )
					if ( orderData?.attributes?.frete ) setFreightType( orderData.attributes.frete )
					if ( orderData?.attributes?.valorFrete ) setFreightCost( orderData.attributes.valorFrete )
				}
			}
		} )()
	}, [ businessId, fetchBusiness, enableFetches ] )


	const fetchEmitenteId = useCallback( async () => {
		if ( emitenteCnpj ) {
			const response = await fetch( `/api/strapi/empresas?filters[CNPJ]=${ emitenteCnpj }` )
			const emitente = await response.json()
			const [ emitenteData ] = emitente.data
			setEmitenteId( emitenteData.id )
		}
	}, [ emitenteCnpj ] )

	useEffect( () => { fetchEmitenteId() }, [ fetchEmitenteId ] )

	useEffect( () => { 

		const isPaymentwithDiscount = paymentTerms === "1"
		const discount = subtotal * ( isPaymentwithDiscount ? 0.05 : 0 )
		setAditionalDiscount( discount )
		
	}, [ paymentTerms, subtotal ] )

	useEffect( () => { // First loading data from db
		if ( orderData ) {

			const {
				dataEntrega,
				fornecedor,
				prazo,
				valorFrete,
				frete,
				descontoTotal,
				cliente_pedido,
				obs,
				itens
			} = orderData.attributes

			dataEntrega && setDeliverDate( dataEntrega )
			fornecedor && setEmitenteCnpj( fornecedor )
			prazo && setPaymentTerms( prazo )
			valorFrete && setFreightCost( valorFrete )
			frete && setFreightType( frete )
			descontoTotal && setAditionalDiscount( descontoTotal )
			cliente_pedido && setClientOrderNumber( cliente_pedido )
			orderData.attributes?.custoAdicional && setAditionalCosts( orderData.attributes.custoAdicional )
			obs && setOrderObservations( obs )
			itens && !!itens.length && setItemsList( itens )

		}
	}, [ orderData ] )

	useEffect( () => { // Updating data object to save later
		if ( companyData ) {
			const saveData = {
				businessId,
				business: businessId,
				fornecedor: emitenteCnpj,
				fornecedorId: emitenteId,
				empresa: companyData.id,
				empresaId: companyData.id,
				CNPJClinet: companyData.attributes.CNPJ,
				dataPedido: customDateIso(),
				dataEntrega: deliverDate,
				prazo: paymentTerms === "0" ? "1" : paymentTerms,
				condi: paymentTerms === "0" ? "À vista (antecipado)" : ( paymentTerms === "1" ? "Antecipado c/ desconto" : "A prazo" ),
				frete: freightType,
				valorFrete: formatCurrency( freightCost ),
				descontoTotal: formatCurrency( aditionalDiscount ),
				desconto: formatCurrency( aditionalDiscount ),
				custoAdicional: formatCurrency( aditionalCosts ),
				itens: itemsList,
				cliente_pedido: clientOrderNumber,
				obs: orderObservations,
				totalGeral: orderTotalValue,
				user: user.id,
				vendedorId: user.id,
				vendedor: user.name,
			}
			setOrderSaveData( saveData )
		}
	}, [
		emitenteCnpj,
		emitenteId,
		businessData,
		deliverDate,
		paymentTerms,
		freightType,
		freightCost,
		aditionalDiscount,
		aditionalCosts,
		itemsList,
		clientOrderNumber,
		orderObservations,
		orderTotalValue,
		user,
	] )

	const handleSaveOrder = useCallback( async () => {
		if ( !emitenteCnpj ) {
			return toast( {
				title: "Oooopss...",
				description: 'Você se esqueceu de selecionar o Emitente. É obrigatório.',
				status: "warning",
				duration: 4000,
				isClosable: true
			} )
		}

		if ( !itemsList?.length ) {
			return toast( {
				title: "Oooopss...",
				description: 'Você precisa incluir pelo menos um item na proposta.',
				status: "warning",
				duration: 4000,
				isClosable: true
			} )
		}

		setLoading( true )


		fetch( `/api/strapi/businesses/${ businessId }`, {
			method: 'PUT',
			body: JSON.stringify( { data: { Budget: orderTotalValue } } )
		} )

		const method = !orderData ? "POST" : "PUT"
		const strapiEndPoint = !orderData ? "/api/strapi/pedidos" : `/api/strapi/pedidos/${ orderData.id }`

		const response = await fetch( strapiEndPoint, {
			method,
			body: JSON.stringify( {
				data: orderSaveData
			} )
		} )
		const save = await response.json()

		if ( !save.data?.id ) {
			return toast( {
				title: "Oooopss...",
				description: 'Algo não deu certo. Não foi possível salvar a proposta.',
				status: "error",
				duration: 4000,
				isClosable: true
			} )
		}
		else {
			toast( {
				title: "Tudo certo!",
				description: 'A proposta foi salva.',
				status: "success",
				duration: 6000,
				isClosable: true
			} )
			router.back()
			setLoading( false )
		}

	}, [ orderSaveData ] )

	return (
		<Flex h="100vh" w="100%">
			<Flex h="100vh" w="100%" flexDir={ "column" } px={ '5' } py={ 1 } bg={ 'gray.800' } color={ 'white' } justifyContent={ 'space-between' } >
				<Box w="100%" bg={ 'gray.800' } pt={ 3 }>
					<Flex gap={ 3 } alignItems={ 'center' }>
						<IconButton
							aria-label='voltar'
							rounded={ '3xl' }
							onClick={ () => router.back() }
							icon={ <BsArrowLeftCircleFill
								size={ 30 }
								color="#136dcc"
							/> }
						/>
						<Heading size="md">Proposta comercial</Heading>
					</Flex>
					<Box display="flex" flexWrap={ 'wrap' } gap={ 5 } alignItems="center" pt={ 3 } px={ 5 }>
						<Box>
							<EmitenteSelect
								accountsData={ accountsData }
								emitenteCnpj={ emitenteCnpj }
								setEmitenteCnpjOnChange={ setEmitenteCnpj }
							/>
						</Box>
						<Box mx={ 2 }>
							<LabelEmpresa companyName={ companyData?.attributes?.nome } />
						</Box>
						<Box>
							<DeliverDate deliverDate={ deliverDate } setDeliverDateOnChange={ setDeliverDate } />
						</Box>
						<Box>
							<PaymentTerms
								maxPrazoPagto={ companyData?.attributes?.maxPg ?? "" }
								paymentTerms={ paymentTerms }
								setPaymentTermsOnChange={ setPaymentTerms }
							/>
						</Box>
						<Box>
							<FreightSelect
								freightType={ freightType }
								setFreightTypeOnChange={ setFreightType }
							/>
						</Box>
						<Box>
							<FreightCost
								setFreightCostOnChange={ setFreightCost }
								freightCost={ parseCurrency( freightCost ) }
							/>
						</Box>

						{ user && user.pemission === 'Adm' && (
							<>
								<Box>
									<AditionalDiscount
										setAditionalDiscountOnChange={ setAditionalDiscount }
										aditionalDiscount={ aditionalDiscount }
									/>
								</Box>
								<Box>
									<AditionalCosts
										setAditionalCostsOnChange={ setAditionalCosts }
										aditionalCosts={ aditionalCosts }
									/>
								</Box>
							</>
						) }
					</Box>
					<Box mt={ 4 }>
						<Heading size="sm">Itens da proposta comercial</Heading>
					</Box>
					<Box display="flex" gap={ 5 } alignItems="center" pt={ 3 } px={ 5 }>
						<Box w={ "300px" } alignItems="center" >
							{ !!companyData?.attributes?.CNPJ && !!user && (
								<ProductsSelect
									cnpj={ companyData.attributes.CNPJ }
									email={ user.email }
									onChange={ e => setCurrentProductSelected( e.target.value ) }
								/>
							) }
						</Box>
						<Box>
							<AddItemButton
								currentProductSelected={ currentProductSelected }
								user={ user }
								itemsList={ itemsList }
								setItemsListOnClick={ setItemsList }
								loading={ loading }
								setLoading={ setLoading }
							/>
						</Box>
						<Box alignItems="center">
							<FormLabel
								fontSize="xs"
								fontWeight="md"
							>
								Pedido do Cliente N°:
							</FormLabel>
							<Input
								shadow="sm"
								type={ "text" }
								size="xs"
								w="32"
								fontSize="xs"
								rounded="md"
								onChange={ ( e ) => setClientOrderNumber( e.target.value ) }
								value={ clientOrderNumber }
							/>
						</Box>
						<Box w={ "40rem" }>
							<Box display="flex" gap={ 5 } alignItems="center">
								<Box w="full">
									<FormLabel
										fontSize="xs"
										fontWeight="md"
									>
										Observação
									</FormLabel>
									<Textarea
										w="full"
										h={ "10" }
										onChange={ ( e ) => setOrderObservations( e.target.value ) }
										placeholder="Breve descrição sobre o andamento"
										size="xs"
										value={ orderObservations }
									/>
								</Box>
							</Box>
						</Box>
					</Box>
					<Box mt={ 8 } w={ "100%" } mb={ 5 } bg={ 'gray.800' }>
						<Box>
							<TableItems
								itemsList={ itemsList }
								setItemsListOnChange={ setItemsList }
							/>
						</Box>
					</Box>
				</Box>
				<Box display={ "flex" } justifyContent={ "space-between" } p={ 2 } bg={ 'gray.700' }>

					<Flex gap={ 20 } alignContent={ "center" }>
						<chakra.p>
							subtotal:<br />R$ { formatCurrency( subtotal ) }
						</chakra.p>
						<chakra.p>
							Frete:<br />R$ { formatCurrency( freightCost ) }
						</chakra.p>
						<chakra.p>Descontos:<br />R$ { formatCurrency( aditionalDiscount ) }</chakra.p>
						<chakra.p>
							Custos extras:<br />R$ { formatCurrency( aditionalCosts ) }
						</chakra.p>
						<chakra.p>Valor Total:<br />R$ { orderTotalValue }</chakra.p>
					</Flex>
					<Button colorScheme={ "whatsapp" } onClick={ handleSaveOrder } isDisabled={ loading }>
						Salvar Proposta
					</Button>
				</Box>
			</Flex>
		</Flex>
	)
}
export default Proposta