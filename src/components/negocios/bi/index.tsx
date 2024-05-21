import { EtapasNegocio } from "@/components/data/etapa"
import { Box, Flex, Table, TableContainer, Tbody, Td, Th, Thead, Tr, chakra } from "@chakra-ui/react"
import { useState } from "react"
import { useRouter } from "next/router"
import Loading from "@/components/elements/loading"
import axios from "axios"
import { useSession } from "next-auth/react"
import { SelectUser } from "@/components/painel/calendario/select/SelecUser"
import { SelectEmpresas } from "@/components/painel/calendario/select/selectEmpresas"
import { BtCreate } from "../component/butonCreate"
import { StatusAndamento } from "@/components/data/status"
import { SetValue } from "@/function/currenteValor"


export const PowerBi = () => {
	const router = useRouter()
	const { data: session } = useSession()
	const [ data, setData ] = useState( [] )
	const [ User, setUser ] = useState( '' )
	const [ load, setLoad ] = useState<boolean>( true )


	if ( !User ) {
		( async () => {
			const dataAtual = new Date()
			const primeiroDiaTresMesesAtras = new Date( dataAtual.getFullYear(), dataAtual.getMonth() - 3, 1 )
			const ultimoDiaMesAtual = new Date( dataAtual.getFullYear(), dataAtual.getMonth() + 3, 0 )

			await axios.get( `/api/db/business/get/calendar/list?DataIncicio=${ primeiroDiaTresMesesAtras.toISOString() }&DataFim=${ ultimoDiaMesAtual.toISOString() }&Vendedor=${ session?.user.name }` )
				.then( ( response ) => {
					const filtro = response.data.filter( ( c: any ) => c.attributes.etapa !== 6 )
					const filtro1 = filtro.filter( ( c: any ) => c.attributes.andamento !== 5 )
					setData( filtro1 )
					const user: any = session?.user.name
					setUser( user )
					setLoad( false )
				} )
				.catch( ( error: any ) => {
					console.error( error )
				} )
		} )()
	}


	function handleUserChange ( user: React.SetStateAction<any> ) {
		setLoad( true );
		( async () => {
			const usuario = user
			setUser( usuario )
			const dataAtual = new Date()
			const primeiroDiaTresMesesAtras = new Date( dataAtual.getFullYear(), dataAtual.getMonth() - 3, 1 )
			const ultimoDiaMesAtual = new Date( dataAtual.getFullYear(), dataAtual.getMonth() + 3, 0 )

			await axios.get( `/api/db/business/get/calendar/list?DataIncicio=${ primeiroDiaTresMesesAtras.toISOString() }&DataFim=${ ultimoDiaMesAtual.toISOString() }&Vendedor=${ user }` )
				.then( ( response ) => {
					const filtro = response.data.filter( ( c: any ) => c.attributes.etapa !== 6 )
					const filtro1 = filtro.filter( ( c: any ) => c.attributes.andamento !== 5 )
					setData( filtro1 )
					setLoad( false )
				} )
				.catch( ( error: any ) => {
					console.error( error )
				} )
		} )()
	}

	function handleEnpresa ( enpresa: React.SetStateAction<any> ) {
		setLoad( true )
		if ( enpresa.length > 0 ) {
			setData( enpresa )
			setLoad( false )
		} else {
			( async () => {
				const dataAtual = new Date()
				const primeiroDiaTresMesesAtras = new Date( dataAtual.getFullYear(), dataAtual.getMonth() - 3, 1 )
				const ultimoDiaMesAtual = new Date( dataAtual.getFullYear(), dataAtual.getMonth() + 3, 0 )

				await axios.get( `/api/db/business/get/calendar/list?DataIncicio=${ primeiroDiaTresMesesAtras.toISOString() }&DataFim=${ ultimoDiaMesAtual.toISOString() }&Vendedor=${ User }` )
					.then( ( response ) => {
						const filtro = response.data.filter( ( c: any ) => c.attributes.etapa !== 6 )
						const filtro1 = filtro.filter( ( c: any ) => c.attributes.andamento !== 5 )
						setData( filtro1 )
						setLoad( false )
					} )
					.catch( ( error: any ) => {
						console.error( error )
					} )
			} )()
		}
	}

	function handleLoad ( event: any ) {
		setLoad( event )
	}

	if ( load ) {
		return (
			<>
				<Box w={ '100%' } h={ '100%' }>
					<Loading size="200px">Carregando...</Loading>
				</Box>
			</>
		)
	}

	return (
		<>
			<Box w={ '100%' }>
				<Flex px={ 5 } mt={ 5 } mb={ 10 } justifyContent={ 'space-between' } w={ '100%' }>
					<Flex gap={ 16 }>
						<Box>
							<SelectUser onValue={ handleUserChange } user={ User } />
						</Box>
						<Box>
							<SelectEmpresas Usuario={ User } onValue={ handleEnpresa } />
						</Box>
					</Flex>

					<BtCreate user={ User } onLoading={ handleLoad } />

				</Flex>
				<Box w='100%' display={ { lg: 'flex', sm: 'block' } } p={ { lg: 3, sm: 5 } }>
					<Box w={ { lg: '100%', sm: '100%' } } bg={ '#ffffff12' } px={ 4 } rounded={ 5 }>

						<Flex direction={ 'column' } w={ '100%' } my='5'>
							<chakra.span fontSize={ '20px' } fontWeight={ 'medium' } color={ 'white' }>Funil de vendas</chakra.span>
						</Flex>
						<Box>
							<TableContainer pb='2'>
								<Table variant='simple'>
									<Thead bg={ 'gray.600' }>
										<Tr>
											<Th color={ 'white' } textAlign={ 'center' } borderBottom={ 'none' } w={ '20px' }>Empresa</Th>
											<Th color={ 'white' } textAlign={ 'center' } borderBottom={ 'none' } w={ '5rem' }>Etapa</Th>
											<Th color={ 'white' } textAlign={ 'center' } borderBottom={ 'none' } w={ '5rem' }>Status</Th>
											<Th color={ 'white' } textAlign={ 'center' } borderBottom={ 'none' } w={ '5rem' }>Valor</Th>
											<Th color={ 'white' } textAlign={ 'center' } borderBottom={ 'none' } w={ '5rem' }>Retornar em</Th>
										</Tr>
									</Thead>
									<Tbody>
										{ data.map( ( itens: any ) => {
											const statusAtual = itens.attributes.andamento
											const [ statusRepresente ] = StatusAndamento.filter( ( i: any ) => i.id == statusAtual ).map( ( e: any ) => e.title )
											const etapa = EtapasNegocio.filter( ( e: any ) => e.id == itens.attributes.etapa ).map( ( e: any ) => e.title )

											const colorLine = itens.attributes.DataRetorno <= new Date().toISOString() ? 'red.600' : ''

											const dataDed = new Date( itens.attributes.DataRetorno )
											dataDed.setDate( dataDed.getDate() + 1 )
											const dataFormatada = dataDed.toLocaleDateString( 'pt-BR' )

											return (
												<Tr key={ itens.id } onClick={ () => router.push( `/negocios/${ itens.id }` ) } cursor={ 'pointer' }>
													<Td color={ 'white' } w={ '20px' } p={ 2 } textAlign={ 'center' } fontSize={ '12px' } borderBottom={ '1px solid #CBD5E0' }>{ itens.attributes.empresa.data?.attributes.nome }</Td>
													<Td color={ 'white' } fontSize={ '12px' } p={ 2 } textAlign={ 'center' } borderBottom={ '1px solid #CBD5E0' }>{ etapa }</Td>
													<Td color={ 'white' } fontSize={ '12px' } p={ 2 } textAlign={ 'center' } borderBottom={ '1px solid #CBD5E0' }>{ statusRepresente }</Td>
													<Td color={ 'white' } fontSize={ '12px' } p={ 2 } textAlign={ 'center' } borderBottom={ '1px solid #CBD5E0' }>{ SetValue( itens.attributes.Budget ) }</Td>
													<Td color={ 'white' } bg={ colorLine } p={ 2 } textAlign={ 'center' } fontSize={ '12px' } borderBottom={ '1px solid #CBD5E0' }>{ dataFormatada }</Td>
												</Tr>
											)
										} ) }
									</Tbody>
								</Table>
							</TableContainer>
						</Box>

					</Box>
{/* 					<Flex w={ { lg: '30%', sm: '100%' } } p={ { lg: 3, sm: 1 } } gap={ { lg: 3, sm: 1 } } direction={ 'column' }>
						<Box w={ '100%' } bg={ 'red.600' } p={ 2 } rounded={ 5 }>
							<Flex direction={ 'column' } w={ '100%' }>
								<chakra.span fontSize={ '20px' } fontWeight={ 'medium' } color={ 'white' }>Clientes em Inatividade</chakra.span>
							</Flex>
							<Box>
								<TableContainer>
									<Table>
										<Thead bg={ 'red.400' }>
											<Tr>
												<Th color='white' border={ 'none' } w={ { sm: '60%', lg: '40%' } } textAlign={ 'center' }>Empresa</Th>
												<Th color='white' border={ 'none' } textAlign={ 'center' }>última compra</Th>
											</Tr>
										</Thead>
										<Tbody>
											<Ausente user={ User } />
										</Tbody>
									</Table>
								</TableContainer>
							</Box>
						</Box>

						<Box w={ '100%' } bg={ 'green.600' } p={ 2 } rounded={ 5 }>
							<Flex direction={ 'column' } w={ '100%' }>
								<chakra.span fontSize={ '20px' } fontWeight={ 'medium' } color={ 'white' }>Clientes novos</chakra.span>
							</Flex>
							<Box>
								<TableContainer>
									<Table>
										<Thead bg={ 'green.500' }>
											<Tr>
												<Th color={ 'white' } border={ 'none' } w={ { sm: '60%', lg: '40%' } } textAlign={ 'center' }>Empresa</Th>
												<Th color={ 'white' } border={ 'none' } textAlign={ 'center' }>Data de entrada</Th>
											</Tr>
										</Thead>
										<Tbody>
											<NovoCliente user={ User } />
										</Tbody>
									</Table>
								</TableContainer>
							</Box>

						</Box>
						<Box w={ '100%' } bg={ 'blue.600' } p={ 2 } rounded={ 5 }>
							<Flex direction={ 'column' } w={ '100%' }>
								<chakra.span fontSize={ '20px' } fontWeight={ 'medium' } color={ 'white' }>Clientes recuperados</chakra.span>
							</Flex>
							<Box>
								<TableContainer>
									<Table>
										<Thead bg={ 'blue.400' }>
											<Tr>
												<Th color={ 'white' } border={ 'none' } textAlign={ 'center' }>Empresa</Th>
												<Th color={ 'white' } border={ 'none' } textAlign={ 'center' }>valor de compra</Th>
											</Tr>
										</Thead>
										<Tbody>
											<Presente user={ User } />
										</Tbody>
									</Table>
								</TableContainer>
							</Box>

						</Box>
					</Flex> */}
				</Box>
			</Box>
		</>
	)
}
