import { Box, Button, Input, Select, Table, Thead, Th, Tr, Tbody, Td, useToast, Badge } from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import axios, { AxiosError } from 'axios'
import Link from 'next/link'

interface Company {
	id: number
	attributes: {
		nome: string
		tipoPessoa: string
		endereco: string
		numero: string
		complemento: string
		bairro: string
		cep: string
		cidade: string
		uf: string
		site: string
		pais: string
		porte: string
		simples: boolean
		ieStatus: boolean
		status: boolean
		adFrailLat: boolean
		adFrailCab: boolean
		adEspecialLat: boolean
		adEspecialCab: boolean
		latFCab: boolean
		cabChao: boolean
		cabTop: boolean
		cxEco: boolean
		cxEst: boolean
		cxLev: boolean
		cxRef: boolean
		cxSupRef: boolean
		platSMed: boolean
		cxResi: boolean
		engEco: boolean
		engLev: boolean
		engRef: boolean
		engResi: boolean
		email: string
		emailNfe: string
		tablecalc: string
		maxPg: string
		forpg: string
		frete: string
		CNPJ: string
		Ie: string
		fone: string
		celular: string
		CNAE: string
		codpais: string
		history: {
			msg: string
			date: string
			vendedor: string
		}[]
	}
}

interface Product {
	nomeProd: string
	prodId: number
	custo: number
	vFinal: number
	preco: number
	titulo: string
	modelo: string
	empresa: string
	comprimento: number
	largura: number
	altura: number
	tabela: string
	codigo: string
	pesoCx: number
	created_from: string
	ativo: boolean
	expired: boolean
	deleteIndex: boolean
	lastChange: string
}

function Produtos () {
	const [ companies, setCompanies ] = useState( [] )
	const [ selectedCompany, setSelectedCompany ] = useState<Company | null>( null )
	const [ selectedCompanyName, setSelectedCompanyName ] = useState<string | null>( null )
	const [ selectedTable, setSelectedTable ] = useState<string | null>( null )
	const { data: session } = useSession()
	const toast = useToast()
	const [ products, setProducts ] = useState<Product[]>( [] )
	useEffect( () => {
		if ( selectedCompany ) {

			const tableDefaults = {
				balcao: 0.34,
				vip: 0.28,
				bronze: 0.22,
				prata: 0.19,
				ouro: 0.16,
				platinum: 0.13,
				estrategica: 0.11
			}

			const tablecalc = Number( selectedCompany.attributes.tablecalc || 0 )
			const table = Object.keys( tableDefaults ).find( key => tableDefaults[ key as keyof typeof tableDefaults ] === tablecalc )

			setSelectedTable( String( tablecalc ) || null )
		}
	}, [ selectedCompany ] )

	const handleSearch = useCallback( async ( value: string ) => {
		setSelectedCompanyName( value )
		if ( value.length < 3 ) {
			setCompanies( [] )
			return
		}

		try {
			const response = await axios( `/api/refactory/companies?searchString=${ value }` )
			setCompanies( response.data.data )
		} catch ( error ) {
			console.error( 'Erro na busca:', error )
			const axiosError = error as AxiosError
			if ( axiosError.response?.status === 401 ) {
				// Redirecionar para login se não estiver autenticado
				window.location.href = '/api/auth/signin'
			}
		}
	}, [] )

	const handleKeyDown = ( e: React.KeyboardEvent<HTMLInputElement> ) => {
		// Limpar o campo quando Esc é pressionado, independente do estado
		if ( e.key === 'Escape' ) {
			e.preventDefault()
			setSelectedCompany( null )
			setSelectedTable( null )
			setSelectedCompanyName( '' )
			setCompanies( [] )
			return
		}

		// Se não há empresas listadas, não processa as outras teclas
		if ( companies.length === 0 ) return

		const currentIndex = companies.findIndex(
			( company: Company ) => company.attributes.nome === selectedCompanyName
		)

		if ( e.key === 'ArrowDown' ) {
			e.preventDefault()
			const nextIndex = ( currentIndex + 1 ) % companies.length
			const nextCompany: Company = companies[ nextIndex ]
			setSelectedCompany( nextCompany )
			setSelectedCompanyName( nextCompany.attributes.nome )
		} else if ( e.key === 'ArrowUp' ) {
			e.preventDefault()
			const prevIndex = currentIndex <= 0 ? companies.length - 1 : currentIndex - 1
			const prevCompany: Company = companies[ prevIndex ]
			setSelectedCompany( prevCompany )
			setSelectedCompanyName( prevCompany.attributes.nome )
		} else if ( e.key === 'Tab' ) {
			e.preventDefault()
			if ( currentIndex === -1 ) {
				const firstCompany: Company = companies[ 0 ]
				setSelectedCompany( firstCompany )
				setSelectedCompanyName( firstCompany.attributes.nome )
			} else {
				const nextIndex = ( currentIndex + 1 ) % companies.length
				const nextCompany: Company = companies[ nextIndex ]
				setSelectedCompany( nextCompany )
				setSelectedCompanyName( nextCompany.attributes.nome )
			}
		} else if ( e.key === 'Enter' && companies.length > 0 ) {
			e.preventDefault()
			if ( currentIndex === -1 ) {
				const firstCompany: Company = companies[ 0 ]
				setSelectedCompany( firstCompany )
				setSelectedCompanyName( firstCompany.attributes.nome )
			} else {
				const selectedCompany: Company = companies[ currentIndex ]
				setSelectedCompany( selectedCompany )
				setSelectedCompanyName( selectedCompany.attributes.nome )
			}
			setCompanies( [] )
		}
	}

	const handleSaveTable = useCallback( () => {
		if ( selectedCompany && selectedTable ) {
			axios.put( `/api/refactory/companies`, {
				id: selectedCompany.id,
				tablecalc: selectedTable,
			} )
				.then( () => {
					toast( {
						title: 'Tabela salva com sucesso',
						status: 'success',
						duration: 3000,
						isClosable: true,
					} )
				} )
				.catch( ( error ) => {
					console.error( 'Error saving table:', error )
				} )
		}
	}, [ selectedCompany, selectedTable, toast ] )

	const fetchProducts = useCallback( async () => {
		
		if ( !selectedCompany?.attributes?.CNPJ ) return
		if ( !session?.user?.email ) return
		
		const cnpj = selectedCompany.attributes.CNPJ
		const response = await axios.get( `/api/rbx/${ session?.user?.email }/produtos?CNPJ=${ cnpj }` )
		setProducts( response.data || [] )
	}, [ session, selectedCompany ] )

	useEffect( () => {
		fetchProducts()
	}, [ fetchProducts, selectedCompany ] )

	const handleRefreshProduct = useCallback( async ( product: Product ) => {
		console.log( { product } )
		const response = await axios.get( `/api/rbx/${ session?.user?.email }/produtos?refreshCx=${ product.prodId }` )
		console.log( response.data.info )
	}, [] )

	return (
		<Box
			display="flex"
			flexDirection="column"
			gap={ 4 }
			p={ 10 }
		>
			<Box display="flex" justifyContent="space-between" alignItems="center">
				<Box fontSize="2xl" fontWeight="bold">Produtos</Box>
				<Link href="/produtos/orcamentos" passHref legacyBehavior>
					<Button
						size="sm"
						colorScheme="blue"
						bg="blue.700"
						_hover={ { bg: 'blue.800' } }
					>
						Ver Orçamentos
					</Button>
				</Link>
			</Box>

			<Box
				display="flex"
				flexDirection="row"
				alignItems="end"
				gap={ 4 }
			>
				<Box
					display="flex"
					flexDirection="column"
				>
					<Box fontSize="sm">
						Empresa
					</Box>

					<Box position="relative">
						<Input
							size="sm"
							placeholder="Digite o nome da empresa..."
							onChange={ ( e ) => {
								handleSearch( e.target.value )
							} }
							value={ selectedCompanyName || '' }
							borderRadius="md"
							onKeyDown={ handleKeyDown }
						/>
						{ companies.length > 0 && (
							<Box
								position="absolute"
								top="100%"
								left={ 0 }
								right={ 0 }
								bg="blue.700"
								boxShadow="md"
								zIndex={ 1 }
								maxH="200px"
								overflowY="auto"
							>
								{ companies.map( ( company: Company, index: number ) => (
									<Box
										key={ index }
										p={ 2 }
										cursor="pointer"
										bg={ selectedCompanyName === company.attributes.nome ? 'blue.900' : 'transparent' }
										_hover={ { bg: 'blue.900' } }
										onClick={ () => {
											setSelectedCompany( company )
											setCompanies( [] )
											setSelectedCompanyName( company.attributes.nome )
										} }
									>
										{ company.attributes.nome }
									</Box>
								) ) }
							</Box>
						) }
					</Box>
				</Box>

				<Box
					display="flex"
					flexDirection="column"
				>
					<Box fontSize="sm">Tabela do cliente</Box>
					<Select
						size="sm"
						borderRadius="md"
						value={ selectedTable || '' }
						onChange={ ( e ) => {
							setSelectedTable( e.target.value )
						} }
						placeholder="Selecione a tabela do cliente"
						sx={ {
							'& option': {
								backgroundColor: 'blue.700'
							}
						} }
					>
						<option value="0.34">Balcão</option>
						<option value="0.28">VIP</option>
						<option value="0.22">Bronze</option>
						<option value="0.19">Prata</option>
						<option value="0.16">Ouro</option>
						<option value="0.13">Platinum</option>
						<option value="0.11">Estratégica</option>
					</Select>
				</Box>

				<Box>
					<Button
						size="sm"
						borderRadius="md"
						fontSize="sm"
						fontWeight="normal"
						colorScheme="blue"
						variant="solid"
						bg="blue.700"
						_hover={ { bg: 'blue.800' } }
						_active={ { bg: 'blue.900' } }
						_focus={ { bg: 'blue.900' } }
						_focusVisible={ { bg: 'blue.900' } }
						_focusWithin={ { bg: 'blue.900' } }
						onClick={ handleSaveTable }
					>
						Salvar tabela
					</Button>
				</Box>

			</Box>

			{ products?.length > 0 && <Box>
				<Table>
					<Thead>
						<Tr>
							<Th>Produto</Th>
							<Th>Preço</Th>
						</Tr>
					</Thead>
					<Tbody>
						{ products.map( ( product: Product, index: number ) => {
							return (
							<Tr key={ index }>
									<Td>
										<span>{ product.nomeProd } </span>
										<span>{ product.expired && (
											<>
												<Badge
													colorScheme="red"
													ml="2"
													size="xs"
													variant="subtle"
												>
													Expirado
												</Badge>
												<Button
													size="xs" colorScheme="blue" ml="2" variant="outline"
													onClick={ () => {
														handleRefreshProduct( product )
													} }
												>
													Atualizar
												</Button>
											</>
										) }</span>
									</Td>

								<Td>{ product.vFinal }</Td>
							</Tr>
						) } ) }
					</Tbody>
				</Table>
			</Box> }
		</Box>
	)
}

export default Produtos
