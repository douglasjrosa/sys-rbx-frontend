import { EtapasNegocio } from "@/components/data/etapa"
import { Box, Flex, Text, chakra, HStack, Input, FormLabel, Select, Button, Badge, InputGroup, InputLeftElement, InputRightElement, IconButton, Skeleton } from "@chakra-ui/react"
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons"
import { isToday, parseISO, isPast, isAfter } from "date-fns"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { useSession } from "next-auth/react"
import { getEffectiveUser } from "@/utils/pseudoUser"
import NextLink from "next/link"
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaMoneyBillWave, FaSearch, FaTimes, FaPlus } from "react-icons/fa"

interface Company {
	id: number
	attributes: {
		nome: string
		CNPJ: string
		user?: {
			data?: {
				id: number
				attributes: {
					username: string
				}
			}
		}
	}
}


export const PowerBi = () => {
	const router = useRouter()
	const { data: session } = useSession()
	const [ data, setData ] = useState<any[]>( [] )
	const [ User, setUser ] = useState( '' )
	const [ load, setLoad ] = useState<boolean>( true )
	const [ sortConfig, setSortConfig ] = useState<{ key: string, direction: 'asc' | 'desc' }>( { key: 'DataRetorno', direction: 'asc' } )

	// Filtros e Paginação agora baseados na QueryString
	const filtroStatus = ( router.query.status as string ) || 'andamento'
	const paginaAtual = parseInt( router.query.page as string ) || 1
	const itensPorPagina = 20

	// Company Filter States
	const [ companies, setCompanies ] = useState<Company[]>( [] )
	const [ selectedCompany, setSelectedCompany ] = useState<Company | null>( null )
	const [ selectedCompanyName, setSelectedCompanyName ] = useState<string | null>( null )
	const companyInputRef = useRef<HTMLInputElement>( null )

	const formatCNPJ = ( cnpj: string | undefined | null ) => {
		if ( !cnpj ) return ''
		const cleaned = cnpj.replace( /\D/g, '' )
		return cleaned.replace( /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5' )
	}

	useEffect( () => {
		if ( session?.user ) {
			setUser( getEffectiveUser( session.user ) )
		}
	}, [ session?.user ] )

	useEffect( () => {
		const handler = () => {
			if ( session?.user ) setUser( getEffectiveUser( session.user ) )
		}
		window.addEventListener( 'pseudoUserChange', handler )
		return () => window.removeEventListener( 'pseudoUserChange', handler )
	}, [ session?.user ] )

	useEffect( () => {
		if ( router.isReady ) {
			const empresaId = router.query.empresaId
			if ( empresaId && ( !selectedCompany || String( selectedCompany.id ) !== String( empresaId ) ) ) {
				const fetchSelectedCompany = async () => {
					try {
						const url = `/api/db/empresas/getId/${ empresaId }`
						const response = await axios.get( url )
						if ( response.data ) {
							const company = response.data.data
							setSelectedCompany( company )
							setSelectedCompanyName( company.attributes.nome )
						}
					} catch ( error ) {
						console.error( 'Erro ao carregar empresa da querystring:', error )
					}
				}
				fetchSelectedCompany()
			} else if ( !empresaId ) {
				setSelectedCompany( null )
				setSelectedCompanyName( '' )
			}
		}
	}, [ router.isReady, router.query.empresaId, selectedCompany ] )

	useEffect( () => {
		if ( !session?.user ) return
		setLoad( true )
		const fetchData = async () => {
			const dataAtual = new Date()
			const primeiroDiaTresMesesAtras = new Date( dataAtual.getFullYear(), dataAtual.getMonth() - 3, 1 )
			const ultimoDiaMesAtual = new Date( dataAtual.getFullYear(), dataAtual.getMonth() + 3, 0 )

			try {
				const response = await axios.get( `/api/db/business/get/calendar/list?DataIncicio=${ primeiroDiaTresMesesAtras.toISOString() }&DataFim=${ ultimoDiaMesAtual.toISOString() }&Vendedor=${ User }` )
				setData( response.data )
			} catch ( error ) {
				console.error( error )
			} finally {
				setLoad( false )
			}
		}
		fetchData()
	}, [ User, session?.user ] )

	// Funções auxiliares para atualizar a QueryString
	const updateQuery = useCallback( ( updates: Record<string, any> ) => {
		router.push( {
			pathname: router.pathname,
			query: { ...router.query, ...updates }
		}, undefined, { shallow: true } )
	}, [ router ] )

	const setStatus = ( status: string ) => {
		updateQuery( { status, page: '1' } )
	}

	const setPagina = ( page: number ) => {
		updateQuery( { page: String( page ) } )
	}

	const handleSearch = useCallback( async ( value: string ) => {
		setSelectedCompanyName( value )
		if ( value.length < 3 ) {
			setCompanies( [] )
			return
		}

		try {
			const url = `/api/refactory/companies?searchString=${ value }`
			const response = await axios( url )
			setCompanies( response.data.data )
		} catch ( error ) {
			console.error( 'Erro na busca:', error )
		}
	}, [] )

	const handleClearCompany = useCallback( () => {
		const newQuery = { ...router.query }
		delete newQuery.empresaId
		newQuery.status = 'andamento'
		newQuery.page = '1'

		router.push( {
			pathname: router.pathname,
			query: newQuery
		}, undefined, { shallow: true } )

		// Focus back on the input
		setTimeout( () => {
			companyInputRef.current?.focus()
		}, 100 )
	}, [ router ] )

	const handleKeyDown = ( e: React.KeyboardEvent<HTMLInputElement> ) => {
		if ( e.key === 'Escape' ) {
			e.preventDefault()
			handleClearCompany()
			return
		}

		if ( companies.length === 0 ) return

		const currentIndex = companies.findIndex(
			( company: Company ) => company.attributes.nome === selectedCompanyName
		)

		if ( e.key === 'ArrowDown' ) {
			e.preventDefault()
			const nextIndex = ( currentIndex + 1 ) % companies.length
			const nextCompany: Company = companies[ nextIndex ]
			setSelectedCompanyName( nextCompany.attributes.nome )
		} else if ( e.key === 'ArrowUp' ) {
			e.preventDefault()
			const prevIndex = currentIndex <= 0 ? companies.length - 1 : currentIndex - 1
			const prevCompany: Company = companies[ prevIndex ]
			setSelectedCompanyName( prevCompany.attributes.nome )
		} else if ( e.key === 'Enter' ) {
			e.preventDefault()
			const companyToSelect = currentIndex === -1 ? companies[ 0 ] : companies[ currentIndex ]
			if ( companyToSelect ) {
				const companyUser = companyToSelect.attributes.user?.data
				const isOtherVendedor = companyUser && String( companyUser.id ) !== String( session?.user?.id )
				const isAdmin = session?.user?.pemission === 'Adm'
				const isBlocked = isOtherVendedor && !isAdmin

				if ( isBlocked ) return

				updateQuery( { empresaId: String( companyToSelect.id ), status: 'todos', page: '1' } )
				setCompanies( [] )
			}
		}
	}

	const handleCreateBusiness = async () => {
		if ( !selectedCompany || !session?.user ) return
		setLoad( true )

		const dataAtual = new Date()
		const historico = {
			vendedor: session.user.name,
			date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
			msg: `Vendedor ${ session.user.name }, criou esse Negócio`,
		}

		const MSG = {
			msg: `Vendedor ${ session.user.name }, criou esse Negócio`,
			date: new Date().toISOString(),
			user: "Sistema",
		}

		const businessData = {
			status: true,
			deadline: "",
			Budget: 0,
			Approach: "",
			empresa: selectedCompany.id,
			history: historico,
			vendedor: ( session.user as any ).id,
			vendedor_name: session.user.name,
			DataRetorno: dataAtual.toISOString(),
			incidentRecord: [ MSG ],
			etapa: 2,
		}

		try {
			console.log( "Criando negócio com dados:", businessData )
			const response = await axios.post( "/api/db/business/post", businessData )
			router.push( `/negocios/${ response.data.nBusiness }` )
		} catch ( error: any ) {
			console.error( "Erro ao criar negócio:", error )
			console.error( "Resposta do servidor:", error.response?.data )
			setLoad( false )
		}
	}

	const filteredData = data.filter( ( item: any ) => {
		const etapa = item.attributes.etapa
		const andamento = item.attributes.andamento
		const empresaId = item.attributes.empresa.data?.id

		// Filter by company if selected
		if ( selectedCompany && empresaId !== selectedCompany.id ) {
			return false
		}

		switch ( filtroStatus ) {
			case 'andamento':
				return andamento == 3 && etapa != 6
			case 'ganhos':
				return andamento == 5
			case 'perdidos':
				return andamento == 1
			case 'todos':
				return true
			default:
				return true
		}
	} )

	const requestSort = ( key: string ) => {
		let direction: 'asc' | 'desc' = 'asc'
		if ( sortConfig.key === key && sortConfig.direction === 'asc' ) {
			direction = 'desc'
		}
		setSortConfig( { key, direction } )
	}

	const renderSortIcon = ( key: string ) => {
		if ( sortConfig.key !== key ) return null
		return sortConfig.direction === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />
	}

	const sortedData = [ ...filteredData ].sort( ( a: any, b: any ) => {
		let aValue: any
		let bValue: any

		switch ( sortConfig.key ) {
			case 'empresa':
				aValue = a.attributes.empresa.data?.attributes.nome || ''
				bValue = b.attributes.empresa.data?.attributes.nome || ''
				break
			case 'etapa':
				aValue = parseInt( a.attributes.etapa ) || 0
				bValue = parseInt( b.attributes.etapa ) || 0
				break
			case 'deadline':
				aValue = a.attributes.deadline || ''
				bValue = b.attributes.deadline || ''
				break
			case 'Budget':
				aValue = parseFloat( a.attributes.Budget ) || 0
				bValue = parseFloat( b.attributes.Budget ) || 0
				break
			case 'DataRetorno':
				aValue = a.attributes.DataRetorno || ''
				bValue = b.attributes.DataRetorno || ''
				break
			default:
				return 0
		}

		if ( aValue < bValue ) {
			return sortConfig.direction === 'asc' ? -1 : 1
		}
		if ( aValue > bValue ) {
			return sortConfig.direction === 'asc' ? 1 : -1
		}
		return 0
	} )

	const totalPaginas = Math.ceil( sortedData.length / itensPorPagina )
	const inicio = ( paginaAtual - 1 ) * itensPorPagina
	const dataPaginada = sortedData.slice( inicio, inicio + itensPorPagina )

	function handleLoad ( event: any ) {
		setLoad( event )
	}

	const SKELETON_ROWS = 15

	return (
		<>
			<Box w={ '100%' }>
				<Flex px={ { base: 3, md: 5 } } mt={ 5 } mb={ 10 } justifyContent={ 'space-between' } w={ '100%' } alignItems="center">
					<Flex
						gap={ { base: 4, md: 8 } }
						alignItems="center"
						flexDir={ { base: 'column', md: 'row' } }
						w={ { base: '100%', md: 'auto' } }
					>
						<Box w={ { base: '100%', md: '15rem' } } minW={ { base: '100%', md: '15rem' } }>
							<FormLabel fontSize="xs" fontWeight="md" color="white" mb={1}>Filtro Status</FormLabel>
							<Select
								w="100%"
								value={ filtroStatus }
								onChange={ ( e ) => {
									setStatus( e.target.value )
								} }
								color="white"
								bg='gray.800'
								size="md"
								border="1px solid"
								borderColor="whiteAlpha.300"
								_focus={ { borderColor: "white", ring: 0 } }
								_hover={ { borderColor: "whiteAlpha.500" } }
							>
								<option style={ { backgroundColor: "#1A202C" } } value="andamento">Em andamento</option>
								<option style={ { backgroundColor: "#1A202C" } } value="ganhos">Ganhos</option>
								<option style={ { backgroundColor: "#1A202C" } } value="perdidos">Perdidos</option>
								<option style={ { backgroundColor: "#1A202C" } } value="todos">Todos os negócios</option>
							</Select>
						</Box>

						<Flex gap={ 2 } alignItems="center" flexDir={ { base: 'column', md: 'row' } } w={ { base: '100%', md: 'auto' } }>
							<Box w={ { base: '100%', md: '15rem' } } minW={ { base: '100%', md: '15rem' } }>
								<FormLabel fontSize="xs" fontWeight="md" color="white" mb={1}>Empresa</FormLabel>
								<Box position="relative">
									<InputGroup size="md">
										<InputLeftElement pointerEvents="none">
											<FaSearch color="gray.400" />
										</InputLeftElement>
										<Input
											ref={ companyInputRef }
											placeholder="Pesquisar por nome ou CNPJ..."
											onChange={ ( e ) => handleSearch( e.target.value ) }
											value={ selectedCompanyName || '' }
											borderRadius="md"
											onKeyDown={ handleKeyDown }
											bg="gray.800"
											color="white"
											border="1px solid"
											borderColor="whiteAlpha.300"
											_focus={ { borderColor: "white", ring: 0 } }
											_hover={ { borderColor: "whiteAlpha.500" } }
											pr={ selectedCompanyName ? "2.5rem" : "0.75rem" }
										/>
										{ selectedCompanyName && (
											<InputRightElement width="2.5rem">
												<IconButton
													aria-label="Limpar busca"
													icon={ <FaTimes /> }
													size="xs"
													colorScheme="red"
													variant="ghost"
													onClick={ handleClearCompany }
													_hover={ { bg: "red.500", color: "white" } }
												/>
											</InputRightElement>
										) }
									</InputGroup>
									{ companies.length > 0 && (
										<Box
											position="absolute"
											top="100%"
											left={ 0 }
											right={ 0 }
											bg="gray.800"
											boxShadow="2xl"
											zIndex={ 10 }
											maxH="200px"
											overflowY="auto"
											borderRadius="md"
											mt={ 1 }
											border="1px"
											borderColor="gray.600"
										>
											{ companies.map( ( company: Company, index: number ) => {
												const companyUser = company.attributes.user?.data
												const isOtherVendedor = companyUser && String( companyUser.id ) !== String( session?.user?.id )
												const isAdmin = session?.user?.pemission === 'Adm'
												const isBlocked = isOtherVendedor && !isAdmin

												return (
													<Box
														key={ `${ company.id }-${ index }` }
														p={ 3 }
														cursor={ isBlocked ? "not-allowed" : "pointer" }
														bg={ selectedCompanyName === company.attributes.nome ? 'blue.900' : 'transparent' }
														_hover={ !isBlocked ? { bg: 'blue.700' } : {} }
														opacity={ isBlocked ? 0.7 : 1 }
														onClick={ () => {
															if ( isBlocked ) return
															updateQuery( { empresaId: String( company.id ), status: 'todos', page: '1' } )
															setCompanies( [] )
														} }
													>
														<Flex justifyContent="space-between" alignItems="center">
															<Box pointerEvents="none">
																<Text fontWeight="bold" color="white">{ company.attributes.nome }</Text>
																<Text fontSize="xs" color="gray.400">{ formatCNPJ( company.attributes.CNPJ ) }</Text>
															</Box>
															{ isOtherVendedor && (
																<Badge colorScheme="orange" ml={ 2 }>
																	{ companyUser.attributes.username }
																</Badge>
															) }
														</Flex>
													</Box>
												)
											} ) }
										</Box>
									) }
								</Box>
							</Box>

							{ selectedCompany && (
								<Box pt={ { base: 2, md: 6 } } alignSelf={ { base: 'flex-start', md: 'auto' } }>
									<Button
										leftIcon={ <FaPlus /> }
										colorScheme="whatsapp"
										onClick={ handleCreateBusiness }
										size="sm"
										px={ 4 }
									>
										Novo Negócio
									</Button>
								</Box>
							) }
						</Flex>
					</Flex>

				</Flex>
				<Box w='100%' display={ { lg: 'flex', sm: 'block' } } p={ { lg: 3, sm: 5 } }>
					<Box w={ { lg: '100%', sm: '100%' } } bg={ '#ffffff12' } px={ 4 } rounded={ 5 }>

						<Flex
							justifyContent={ { base: 'center', md: 'space-between' } }
							alignItems="center"
							my="5"
							flexDir={ { base: 'column', md: 'row' } }
							flexWrap="wrap"
							gap={ { base: 5, md: 3 } }
						>
							<chakra.span fontSize={ { base: '24px', md: '22px' } } fontWeight={ 'medium' } color={ 'white' } textAlign={ { base: 'center', md: 'left' } }>Funil de vendas</chakra.span>

							{ totalPaginas > 1 && (
								<HStack spacing={ 2 } flexWrap="wrap" justify={ { base: 'center', md: 'flex-end' } }>
									<Button
										size="xs"
										bg="#2b6cb0"
										color="white"
										_hover={ { bg: '#2c5282' } }
										onClick={ () => setPagina( Math.max( 1, paginaAtual - 1 ) ) }
										isDisabled={ paginaAtual === 1 }
									>
										<FaAngleDoubleLeft />
									</Button>
									<Text fontSize="xs" color="white">Ir para página:</Text>
									<Input
										type="number"
										min={ 1 }
										max={ totalPaginas }
										size="xs"
										width="50px"
										textAlign="center"
										borderRadius="md"
										color="white"
										value={ paginaAtual }
										onChange={ ( e ) => {
											const val = parseInt( e.target.value )
											if ( !isNaN( val ) && val >= 1 && val <= totalPaginas ) {
												setPagina( val )
											}
										} }
									/>
									<Text fontSize="xs" color="white">de { totalPaginas }</Text>
									<Button
										size="xs"
										bg="#2b6cb0"
										color="white"
										_hover={ { bg: '#2c5282' } }
										onClick={ () => setPagina( Math.min( totalPaginas, paginaAtual + 1 ) ) }
										isDisabled={ paginaAtual === totalPaginas }
									>
										<FaAngleDoubleRight />
									</Button>
								</HStack>
							) }
						</Flex>
						<Box width="100%" pb="2" overflowX="auto">
							{/* Cabeçalho da tabela */ }
							<Flex
								bg={ 'gray.600' }
								minW="600px"
								p={ 3 }
								mb={ 0 }
								justifyContent="space-between"
								borderTopRadius="md"
							>
								<Box flex="0 0 30%" minW="120px" textAlign="center" cursor="pointer" onClick={ () => requestSort( 'empresa' ) } _hover={ { bg: 'whiteAlpha.200' } } transition="background 0.2s" overflow="hidden" textOverflow="ellipsis">
									<Flex justifyContent="center" alignItems="center" gap={ 1 }>
										<Text color={ 'white' } fontWeight="bold" fontSize="sm" noOfLines={ 1 }>EMPRESA</Text>
										{ renderSortIcon( 'empresa' ) }
									</Flex>
								</Box>
								<Box flex="0 0 17.5%" minW="70px" textAlign="center" cursor="pointer" onClick={ () => requestSort( 'etapa' ) } _hover={ { bg: 'whiteAlpha.200' } } transition="background 0.2s" overflow="hidden" textOverflow="ellipsis">
									<Flex justifyContent="center" alignItems="center" gap={ 1 }>
										<Text color={ 'white' } fontWeight="bold" fontSize="sm" noOfLines={ 1 }>ETAPA</Text>
										{ renderSortIcon( 'etapa' ) }
									</Flex>
								</Box>
								<Box flex="0 0 17.5%" minW="70px" textAlign="center" cursor="pointer" onClick={ () => requestSort( 'Budget' ) } _hover={ { bg: 'whiteAlpha.200' } } transition="background 0.2s" overflow="hidden" textOverflow="ellipsis">
									<Flex justifyContent="center" alignItems="center" gap={ 1 }>
										<Text color={ 'white' } fontWeight="bold" fontSize="sm" noOfLines={ 1 }>VALOR</Text>
										{ renderSortIcon( 'Budget' ) }
									</Flex>
								</Box>
								<Box flex="0 0 17.5%" minW="90px" textAlign="center" cursor="pointer" onClick={ () => requestSort( 'DataRetorno' ) } _hover={ { bg: 'whiteAlpha.200' } } transition="background 0.2s" overflow="hidden" textOverflow="ellipsis">
									<Flex justifyContent="center" alignItems="center" gap={ 1 }>
										<Text color={ 'white' } fontWeight="bold" fontSize="sm" noOfLines={ 1 }>RETORNAR EM</Text>
										{ renderSortIcon( 'DataRetorno' ) }
									</Flex>
								</Box>
								<Box flex="0 0 17.5%" minW="90px" textAlign="center" cursor="pointer" onClick={ () => requestSort( 'deadline' ) } _hover={ { bg: 'whiteAlpha.200' } } transition="background 0.2s" overflow="hidden" textOverflow="ellipsis">
									<Flex justifyContent="center" alignItems="center" gap={ 1 }>
										<Text color={ 'white' } fontWeight="bold" fontSize="sm" noOfLines={ 1 }>EXPIRA EM</Text>
										{ renderSortIcon( 'deadline' ) }
									</Flex>
								</Box>
							</Flex>

							{/* Linhas da tabela */ }
							<Box width="100%" minW="600px">
								{ load ? (
									Array.from( { length: SKELETON_ROWS } ).map( ( _, idx ) => (
										<Flex
											key={ idx }
											width="100%"
											minW="600px"
											justifyContent="space-between"
											alignItems="center"
											borderBottom="1px solid #CBD5E0"
											py={ 2 }
											px={ 3 }
										>
											<Box flex="0 0 30%" minW="120px" textAlign="center" overflow="hidden">
												<Skeleton height="14px" width="80%" mx="auto" startColor="gray.600" endColor="gray.700" />
											</Box>
											<Box flex="0 0 17.5%" minW="70px" textAlign="center" overflow="hidden">
												<Skeleton height="14px" width="60%" mx="auto" startColor="gray.600" endColor="gray.700" />
											</Box>
											<Box flex="0 0 17.5%" minW="70px" textAlign="center" overflow="hidden">
												<Skeleton height="14px" width="70%" mx="auto" startColor="gray.600" endColor="gray.700" />
											</Box>
											<Box flex="0 0 17.5%" minW="90px" textAlign="center" overflow="hidden">
												<Skeleton height="14px" width="50%" mx="auto" startColor="gray.600" endColor="gray.700" />
											</Box>
											<Box flex="0 0 17.5%" minW="90px" textAlign="center" overflow="hidden">
												<Skeleton height="14px" width="50%" mx="auto" startColor="gray.600" endColor="gray.700" />
											</Box>
										</Flex>
									) )
								) : (
								dataPaginada.map( ( itens: any ) => {
									const isGanho = itens.attributes.andamento == 5
									const isPerdido = itens.attributes.andamento == 1
									const isConcluido = itens.attributes.etapa == 6 || isGanho || isPerdido

									const deadline = isConcluido ? "" : itens.attributes.deadline
									const etapa = EtapasNegocio.filter( ( e: any ) => e.id == itens.attributes.etapa ).map( ( e: any ) => e.title ) || [ "Sem etapa" ]
									const dataRetornoDate = parseISO( itens.attributes.DataRetorno )
									const isTodayDate = isToday( dataRetornoDate )
									const isPastDate = isPast( dataRetornoDate ) && !isTodayDate
									const isFutureDate = isAfter( dataRetornoDate, new Date() ) && !isTodayDate

									const colorLine = isConcluido ? '' : ( isTodayDate ? 'yellow.500' : isPastDate ? 'red.600' : isFutureDate ? 'blue.400' : '' )
									const textColor = isTodayDate ? 'black' : 'white'
									const dataDed = new Date( itens.attributes.DataRetorno )
									dataDed.setDate( dataDed.getDate() + 1 )
									const dataFormatada = isConcluido ? "" : dataDed.toLocaleDateString( 'pt-BR' )

									return (
										<NextLink
											href={ `/negocios/${ itens.id }` }
											key={ itens.id }
											style={ { textDecoration: 'none', width: '100%', display: 'block' } }
										>
											<Flex
												width="100%"
												minW="600px"
												justifyContent="space-between"
												alignItems="center"
												cursor="pointer"
												borderBottom="1px solid #CBD5E0"
												_hover={ { bg: 'whiteAlpha.100' } }
												py={ 2 }
												px={ 3 }
											>
												<Box flex="0 0 30%" minW="120px" textAlign="center" overflow="hidden" textOverflow="ellipsis">
													<Text color={ 'white' } fontSize={ '12px' } noOfLines={ 1 }>
														{ itens.attributes.empresa.data?.attributes.nome }
													</Text>
												</Box>
												<Box flex="0 0 17.5%" minW="70px" textAlign="center" overflow="hidden" textOverflow="ellipsis">
													<Text color={ 'white' } fontSize={ '12px' } noOfLines={ 1 }>
														{ etapa }
													</Text>
												</Box>
												<Box flex="0 0 17.5%" minW="70px" textAlign="center" px={ 1 } overflow="hidden">
													<Flex
														bg={ isGanho ? "green.500" : isPerdido ? "red.600" : "transparent" }
														border={ !isConcluido ? "1px solid" : "none" }
														borderColor={ !isConcluido ? "green.500" : "transparent" }
														color="white"
														py={ 1 }
														borderRadius="sm"
														justifyContent="center"
														alignItems="center"
														gap={ 2 }
														w="100%"
														minW={ 0 }
													>
														<FaMoneyBillWave />
														<Text fontSize={ '14px' } fontWeight="bold" noOfLines={ 1 }>
															{ new Intl.NumberFormat( 'pt-BR', { minimumFractionDigits: 2 } ).format( parseFloat( itens.attributes.Budget || 0 ) ) }
														</Text>
													</Flex>
												</Box>
												<Box flex="0 0 17.5%" minW="90px" textAlign="center" bg={ colorLine } py={ 1 } borderRadius={ colorLine ? "sm" : "none" } overflow="hidden" textOverflow="ellipsis">
													<Text color={ textColor } fontSize={ '12px' } noOfLines={ 1 }>
														{ dataFormatada }
													</Text>
												</Box>
												<Box flex="0 0 17.5%" minW="90px" textAlign="center" overflow="hidden" textOverflow="ellipsis">
													<Text color={ 'white' } fontSize={ '12px' } noOfLines={ 1 }>
														{ deadline }
													</Text>
												</Box>
											</Flex>
										</NextLink>
									)
								} ) ) }
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>
		</>
	)
}
