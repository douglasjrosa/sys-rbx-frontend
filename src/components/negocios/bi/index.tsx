import { EtapasNegocio } from "@/components/data/etapa"
import { Box, Flex, Text, chakra } from "@chakra-ui/react"
import { useState } from "react"
import { useRouter } from "next/router"
import Loading from "@/components/elements/loading"
import axios from "axios"
import { useSession } from "next-auth/react"
import { SelectUser } from "@/components/painel/calendario/select/SelecUser"
import { SelectEmpresas } from "@/components/painel/calendario/select/selectEmpresas"
import { BtCreate } from "../component/butonCreate"
import { SetValue } from "@/function/currenteValor"
import NextLink from "next/link"


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
						<Box width="100%" pb="2">
							{/* Cabeçalho da tabela */ }
							<Flex
								bg={ 'gray.600' }
								width="100%"
								p={ 3 }
								mb={ 0 }
								justifyContent="space-between"
								borderTopRadius="md"
							>
								<Box width="30%" textAlign="center">
									<Text color={ 'white' } fontWeight="bold" fontSize="sm">Empresa</Text>
								</Box>
								<Box width="17.5%" textAlign="center">
									<Text color={ 'white' } fontWeight="bold" fontSize="sm">Etapa</Text>
								</Box>
								<Box width="17.5%" textAlign="center">
									<Text color={ 'white' } fontWeight="bold" fontSize="sm">Expira em</Text>
								</Box>
								<Box width="17.5%" textAlign="center">
									<Text color={ 'white' } fontWeight="bold" fontSize="sm">Valor</Text>
								</Box>
								<Box width="17.5%" textAlign="center">
									<Text color={ 'white' } fontWeight="bold" fontSize="sm">Retornar em</Text>
								</Box>
							</Flex>

							{/* Linhas da tabela */ }
							<Box width="100%">
								{ data.map( ( itens: any ) => {
									const deadline = itens.attributes.deadline
									const etapa = EtapasNegocio.filter( ( e: any ) => e.id == itens.attributes.etapa ).map( ( e: any ) => e.title ) || [ "Sem etapa" ]
									const colorLine = itens.attributes.DataRetorno <= new Date().toISOString() ? 'red.600' : ''
									const dataDed = new Date( itens.attributes.DataRetorno )
									dataDed.setDate( dataDed.getDate() + 1 )
									const dataFormatada = dataDed.toLocaleDateString( 'pt-BR' )

									return (
										<NextLink
											href={ `/negocios/${ itens.id }` }
											key={ itens.id }
											style={ { textDecoration: 'none', width: '100%', display: 'block' } }
										>
											<Flex
												width="100%"
												justifyContent="space-between"
												alignItems="center"
												cursor="pointer"
												borderBottom="1px solid #CBD5E0"
												_hover={ { bg: 'whiteAlpha.100' } }
												py={ 2 }
												px={ 3 }
											>
												<Box width="30%" textAlign="center">
													<Text color={ 'white' } fontSize={ '12px' }>
														{ itens.attributes.empresa.data?.attributes.nome }
													</Text>
												</Box>
												<Box width="17.5%" textAlign="center">
													<Text color={ 'white' } fontSize={ '12px' }>
														{ etapa }
													</Text>
												</Box>
												<Box width="17.5%" textAlign="center">
													<Text color={ 'white' } fontSize={ '12px' }>
														{ deadline }
													</Text>
												</Box>
												<Box width="17.5%" textAlign="center">
													<Text color={ 'white' } fontSize={ '12px' }>
														{ SetValue( itens.attributes.Budget ) }
													</Text>
												</Box>
												<Box width="17.5%" textAlign="center" bg={ colorLine } py={ 1 } borderRadius={ colorLine ? "sm" : "none" }>
													<Text color={ 'white' } fontSize={ '12px' }>
														{ dataFormatada }
													</Text>
												</Box>
											</Flex>
										</NextLink>
									)
								} ) }
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	)
}
