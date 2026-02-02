import { Box, Button, Input, Select, Table, Thead, Th, Tr, Tbody, Td, useToast, Badge, Flex, Heading, Text, InputGroup, InputLeftElement, Spinner, HStack, VStack, Skeleton, useDisclosure,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ModalCloseButton,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState, useMemo } from 'react'
import axios, { AxiosError } from 'axios'
import Link from 'next/link'
import { FaSearch, FaSync, FaFileInvoiceDollar, FaTrash, FaInfoCircle } from 'react-icons/fa'
import { marginTables } from '@/components/data/marginTables'

interface Company {
	id: number
	attributes: {
		nome: string
		CNPJ: string
		tablecalc: string
		email: string
		emailNfe: string
		// ... other attributes
	}
}

interface Product {
	nomeProd: string
	prodId: number
	custo: number
	custoMp?: number
	vFinal: number
	preco: number
	titulo: string
	modelo: string
	empresa: string
	comprimento: number
	largura: number
	altura: number
	tabela: string
	tablecalc?: number
	ncm?: string
	codigo: string
	pesoCx: number
	created_from: string
	ativo: boolean
	expired: boolean
	expiresIn?: string
	deleteIndex: boolean
	lastChange: string
	lastUser?: string
	audit?: any
}

const formatCNPJ = ( cnpj: string ) => {
	const cleaned = cnpj.replace( /\D/g, '' )
	return cleaned.replace( /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5' )
}

const formatDate = ( dateString?: string ) => {
	if ( !dateString || dateString === '-' ) return '-'
	try {
		// Tentar detectar se a data está no formato DD/MM/YYYY
		if ( typeof dateString === 'string' && dateString.includes( '/' ) ) {
			const parts = dateString.split( '/' )
			if ( parts.length === 3 ) {
				// Assumindo DD/MM/YYYY, JavaScript espera MM/DD/YYYY ou YYYY-MM-DD
				const day = parts[ 0 ]
				const month = parts[ 1 ]
				const year = parts[ 2 ]
				return `${ day }/${ month }/${ year }`
			}
		}

		const date = new Date( dateString )
		if ( isNaN( date.getTime() ) ) return dateString // Retornar original se não conseguir parsear
		return new Intl.DateTimeFormat( 'pt-BR' ).format( date )
	} catch {
		return dateString || '-'
	}
}

const getTableBadgeColor = ( tableName?: string ) => {
	if ( !tableName ) return 'gray'
	const name = tableName.toLowerCase()
	if ( name.includes( 'balcão' ) ) return 'gray'
	if ( name.includes( 'vip' ) ) return 'blue'
	if ( name.includes( 'bronze' ) ) return 'orange'
	if ( name.includes( 'prata' ) ) return 'gray'
	if ( name.includes( 'ouro' ) ) return 'yellow'
	if ( name.includes( 'platina' ) ) return 'cyan'
	if ( name.includes( 'estratégico' ) ) return 'purple'
	return 'teal'
}

const getTableNameInPortuguese = ( margin?: number | string ) => {
	if ( margin === undefined || margin === null ) return '-'
	const marginValue = parseFloat( String( margin ) )
	const table = marginTables.find( t => t.profitMargin.toFixed( 2 ) === marginValue.toFixed( 2 ) )
	if ( table ) return table.name
	return `${ ( marginValue * 100 ).toFixed( 0 ) }%`
}

function Produtos () {
	const [ companies, setCompanies ] = useState( [] )
	const [ selectedCompany, setSelectedCompany ] = useState<Company | null>( null )
	const [ selectedCompanyName, setSelectedCompanyName ] = useState<string | null>( null )
	const [ selectedTable, setSelectedTable ] = useState<string | null>( null )
	const [ searchTerm, setSearchTerm ] = useState( '' )
	const { data: session } = useSession()
	const toast = useToast()
	const [ products, setProducts ] = useState<Product[]>( [] )
	const [ isLoadingProducts, setIsLoadingProducts ] = useState( false )
	const [ isUpdatingAll, setIsUpdatingAll ] = useState( false )

	// Modal States
	const { isOpen: isDeleteOpen, onOpen: onOpenDelete, onClose: onDeleteClose } = useDisclosure()
	const { isOpen: isDetailsOpen, onOpen: onOpenDetails, onClose: onDetailsClose } = useDisclosure()
	const [ productToDelete, setProductToDelete ] = useState<Product | null>( null )
	const [ productToShow, setProductToDetails ] = useState<Product | null>( null )
	const [ isDeleting, setIsDeleting ] = useState( false )

	const fetchProducts = useCallback( async () => {
		if ( !selectedCompany?.id || !session?.user?.email ) return
		
		setIsLoadingProducts( true )
		try {
			const empresaId = selectedCompany.id
			const response = await axios.get( `/api/db/produtos/list?empresaId=${ empresaId }` )
			setProducts( response.data || [] )
		} catch ( error ) {
			console.error( 'Erro ao buscar produtos:', error )
		} finally {
			setIsLoadingProducts( false )
		}
	}, [ session, selectedCompany ] )

	const handleDeleteProduct = useCallback( async () => {
		if ( !productToDelete || !session?.user?.email ) return

		setIsDeleting( true )
		try {
			// 1. Excluir do Strapi
			const strapiRes = await axios.get( `/api/db/produtos/list?empresaId=${ selectedCompany?.id }` )
			const strapiProduct = strapiRes.data.find( ( p: any ) => p.prodId === productToDelete.prodId )
			
			if ( strapiProduct ) {
				await axios.delete( `/api/db/produtos/delete?id=${ strapiProduct.id }` )
			}

			// 2. Desativar na API externa (WordPress)
			await axios.post( `/api/rbx/${ session?.user?.email }/produtos`, {
				salvar: true,
				dados: {
					indice: productToDelete.prodId,
					ativo: "0"
				}
			} )

			toast( {
				title: 'Produto excluído',
				description: 'O produto foi removido do sistema comercial e desativado no legado.',
				status: 'success',
				duration: 3000,
			} )
			
			onDeleteClose()
			fetchProducts()
		} catch ( error ) {
			console.error( 'Erro ao excluir produto:', error )
			toast( {
				title: 'Erro ao excluir',
				description: 'Não foi possível completar a exclusão.',
				status: 'error',
			} )
		} finally {
			setIsDeleting( false )
		}
	}, [ productToDelete, session, selectedCompany, toast, onDeleteClose, fetchProducts ] )

	useEffect( () => {
		if ( selectedCompany ) {
			const tablecalc = parseFloat( selectedCompany.attributes.tablecalc ) || 0
			// Find exact match or just set the value
			setSelectedTable( tablecalc.toFixed( 2 ) )
		}
	}, [ selectedCompany ] )

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

	const handleKeyDown = ( e: React.KeyboardEvent<HTMLInputElement> ) => {
		if ( e.key === 'Escape' ) {
			e.preventDefault()
			setSelectedCompany( null )
			setSelectedTable( null )
			setSelectedCompanyName( '' )
			setCompanies( [] )
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
				setSelectedCompany( companyToSelect )
				setSelectedCompanyName( companyToSelect.attributes.nome )
				setCompanies( [] )
			}
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
					fetchProducts() // Refresh prices
				} )
				.catch( ( error ) => {
					console.error( 'Error saving table:', error )
				} )
		}
	}, [ selectedCompany, selectedTable, toast, fetchProducts ] )

	useEffect( () => {
		fetchProducts()
	}, [ fetchProducts ] )

	const handleRefreshProduct = useCallback( async ( product: Product ) => {
		try {
			// 1. Atualizar no WordPress (API externa)
			await axios.get( `/api/rbx/${ session?.user?.email }/produtos?refreshCx=${ product.prodId }` )
			
			// 2. Obter os dados atualizados do WordPress
			const res = await axios.get( `/api/rbx/${ session?.user?.email }/produtos?prodId=${ product.prodId }` )
			const updatedProduct = res.data

			// 3. Sincronizar para o Strapi
			if ( selectedCompany?.id ) {
				await axios.post( `/api/db/produtos/sync`, {
					empresaId: selectedCompany.id,
					produtos: [ updatedProduct ]
				} )
			}

			toast( {
				title: 'Produto atualizado',
				status: 'success',
				duration: 2000,
			} )
			fetchProducts()
		} catch ( error ) {
			console.error( 'Erro ao atualizar produto:', error )
		}
	}, [ session, fetchProducts, toast, selectedCompany ] )

	const handleUpdateAllExpired = async () => {
		const expiredOnes = products.filter( p => p.expired )
		if ( expiredOnes.length === 0 ) return

		setIsUpdatingAll( true )
		toast( {
			id: 'update-all-toast',
			title: 'Atualizando produtos',
			description: `Processando ${ expiredOnes.length } produtos...`,
			status: 'info',
			duration: null,
		} )

		try {
			for ( let i = 0; i < expiredOnes.length; i++ ) {
				const product = expiredOnes[ i ]
				toast.update( 'update-all-toast', {
					description: `Atualizando (${ i + 1 }/${ expiredOnes.length }): ${ product.nomeProd }`
				} )
				
				// 1. Atualizar no WordPress
				await axios.get( `/api/rbx/${ session?.user?.email }/produtos?refreshCx=${ product.prodId }` )
				
				// 2. Obter dados atualizados
				const res = await axios.get( `/api/rbx/${ session?.user?.email }/produtos?prodId=${ product.prodId }` )
				const updatedProduct = res.data

				// 3. Sincronizar para o Strapi
				if ( selectedCompany?.id ) {
					await axios.post( `/api/db/produtos/sync`, {
						empresaId: selectedCompany.id,
						produtos: [ updatedProduct ]
					} )
				}

				// Small delay to prevent rate limiting
				await new Promise( resolve => setTimeout( resolve, 300 ) )
			}
			toast.close( 'update-all-toast' )
			toast( {
				title: 'Sucesso',
				description: 'Todos os produtos foram atualizados e sincronizados.',
				status: 'success',
				duration: 5000,
			} )
			fetchProducts()
		} catch ( error ) {
			console.error( 'Erro na atualização em massa:', error )
			toast.update( 'update-all-toast', {
				title: 'Erro',
				description: 'Ocorreu um erro ao atualizar alguns produtos.',
				status: 'error',
				duration: 5000,
			} )
		} finally {
			setIsUpdatingAll( false )
		}
	}

	const filteredProducts = useMemo( () => {
		if ( !searchTerm ) return products
		const term = searchTerm.toLowerCase()
		return products.filter( p => 
			p.nomeProd?.toLowerCase().includes( term ) || 
			p.modelo?.toLowerCase().includes( term ) ||
			p.codigo?.toLowerCase().includes( term )
		)
	}, [ products, searchTerm ] )

	const expiredCount = useMemo( () => products.filter( p => p.expired ).length, [ products ] )

	const currentTableName = useMemo( () => {
		if ( !selectedCompany?.attributes.tablecalc ) return null
		const margin = parseFloat( selectedCompany.attributes.tablecalc )
		const table = marginTables.find( t => t.profitMargin.toFixed( 2 ) === margin.toFixed( 2 ) )
		return table ? table.name : `${ ( margin * 100 ).toFixed( 0 ) }%`
	}, [ selectedCompany ] )

	return (
		<Box display="flex" flexDirection="column" gap={ 6 } p={ 10 } bg="gray.800" minH="100vh" color="white">
			<Flex justifyContent="space-between" alignItems="center">
				<Heading size="lg">Produtos</Heading>
				<HStack spacing={4}>
					{selectedCompany && (
						<HStack spacing={4}>
							<Link href={{
								pathname: '/produtos/novo',
								query: { 
									cnpj: selectedCompany.attributes.CNPJ,
									email: selectedCompany.attributes.email || selectedCompany.attributes.emailNfe || session?.user?.email 
								}
							}} passHref>
								<Button leftIcon={<FaFileInvoiceDollar />} colorScheme="green" size="sm">
									Novo Produto
								</Button>
							</Link>
							<Link href={{
								pathname: '/produtos/historico',
								query: { 
									cnpj: selectedCompany.attributes.CNPJ,
									email: selectedCompany.attributes.email || selectedCompany.attributes.emailNfe || session?.user?.email 
								}
							}} passHref>
								<Button leftIcon={<FaSearch />} colorScheme="blue" size="sm">
									Histórico de Orçamentos
								</Button>
							</Link>
						</HStack>
					)}
				</HStack>
			</Flex>

			<Box bg="gray.700" p={ 6 } borderRadius="xl" shadow="xl">
				<Flex direction={{ base: 'column', md: 'row' }} gap={ 6 } align={{ base: 'center', md: 'flex-end' }} justify="center">
					<Box w={{ base: 'full', md: '320px' }} minW="250px">
						<Text fontSize="sm" fontWeight="bold" mb={ 2 } color="gray.300" textAlign="left">Empresa</Text>
						<Box position="relative">
							<InputGroup size="sm">
								<InputLeftElement pointerEvents="none">
									<FaSearch color="gray.400" />
								</InputLeftElement>
								<Input
									placeholder="Pesquisar empresa por nome ou CNPJ..."
									onChange={ ( e ) => handleSearch( e.target.value ) }
									value={ selectedCompanyName || '' }
									borderRadius="md"
									onKeyDown={ handleKeyDown }
									bg="gray.800"
									border="none"
									_focus={{ ring: 2, ringColor: 'blue.500' }}
								/>
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
									{ companies.map( ( company: Company, index: number ) => (
										<Box
											key={ `${company.id}-${index}` }
											p={ 3 }
											cursor="pointer"
											bg={ selectedCompanyName === company.attributes.nome ? 'blue.900' : 'transparent' }
											_hover={ { bg: 'blue.700' } }
											onClick={ () => {
												setSelectedCompany( company )
												setSelectedCompanyName( company.attributes.nome )
												setCompanies( [] )
											} }
										>
											<Text fontWeight="bold" pointerEvents="none">{ company.attributes.nome }</Text>
											<Text fontSize="xs" color="gray.400" pointerEvents="none">{ formatCNPJ( company.attributes.CNPJ ) }</Text>
										</Box>
									) ) }
								</Box>
							) }
						</Box>
					</Box>

					{ selectedCompany && (
						<>
							<Box w={{ base: 'full', md: '320px' }} minW="250px">
								<Text fontSize="sm" fontWeight="bold" mb={ 2 } color="gray.300" textAlign="left">
									Tabela
								</Text>
								<Select
									size="sm"
									borderRadius="md"
									value={ selectedTable || '' }
									onChange={ ( e ) => setSelectedTable( e.target.value ) }
									bg="gray.800"
									border="none"
								>
									<option value="" style={{ background: '#1A202C' }}>Selecione uma tabela</option>
									{marginTables.map(table => (
										<option key={table.id} value={table.profitMargin.toFixed(2)} style={{ background: '#1A202C' }}>
											{table.name} ({ (table.profitMargin * 100).toFixed(0) }%)
										</option>
									))}
								</Select>
							</Box>

							<Button
								size="sm"
								colorScheme="green"
								onClick={ handleSaveTable }
								isDisabled={ !selectedCompany || !selectedTable }
								w={{ base: 'full', md: '320px' }}
								minW="250px"
							>
								Aplicar Margem
							</Button>
						</>
					) }
				</Flex>
			</Box>

			{ selectedCompany && (
				<Box bg="gray.700" p={ 6 } borderRadius="xl" shadow="xl">
					<Flex justifyContent="space-between" alignItems="center" mb={ 6 }>
						<HStack spacing={4}>
							<Heading size="md">Produtos Vinculados</Heading>
							<Badge colorScheme="blue" borderRadius="full" px={2}>{ products.length }</Badge>
						</HStack>
						
						<HStack spacing={4}>
							<InputGroup size="sm" w="300px">
								<InputLeftElement pointerEvents="none">
									<FaSearch color="gray.400" />
								</InputLeftElement>
								<Input 
									placeholder="Filtrar nesta lista..." 
									value={searchTerm} 
									onChange={(e) => setSearchTerm(e.target.value)}
									bg="gray.800"
									border="none"
								/>
							</InputGroup>
							{ expiredCount > 0 && (
								<Button 
									size="sm" 
									leftIcon={<FaSync />} 
									colorScheme="orange" 
									onClick={handleUpdateAllExpired}
									isLoading={isUpdatingAll}
									loadingText="Atualizando..."
								>
									Atualizar {expiredCount} Expirados
								</Button>
							)}
						</HStack>
					</Flex>

					{ isLoadingProducts ? (
						<Box overflowX="auto">
							<Table variant="simple" size="sm">
								<Thead>
									<Tr>
										<Th color="gray.400">Código</Th>
										<Th color="gray.400">Produto</Th>
										<Th color="gray.400" textAlign="center">Preço Final</Th>
										<Th color="gray.400" textAlign="center">Histórico</Th>
										<Th color="gray.400" textAlign="right">Ações</Th>
									</Tr>
								</Thead>
								<Tbody>
									{[1, 2, 3, 4, 5].map((i) => (
										<Tr key={i}>
											<Td><Skeleton h="20px" w="60px" /><Skeleton h="12px" w="40px" mt={1} /></Td>
											<Td><Skeleton h="20px" w="200px" /><Skeleton h="12px" w="150px" mt={1} /></Td>
											<Td><VStack align="center"><Skeleton h="20px" w="80px" /><Skeleton h="15px" w="50px" /></VStack></Td>
											<Td><VStack align="center"><Skeleton h="20px" w="80px" /><Skeleton h="12px" w="60px" /></VStack></Td>
											<Td textAlign="right"><Skeleton h="25px" w="80px" ml="auto" /></Td>
										</Tr>
									))}
								</Tbody>
							</Table>
						</Box>
					) : products.length === 0 ? (
						<Text textAlign="center" py={10} color="gray.400">Nenhum produto encontrado para esta empresa.</Text>
					) : (
						<Box overflowX="auto">
							<Table variant="simple" size="sm">
								<Thead>
									<Tr>
										<Th color="gray.400">Código</Th>
										<Th color="gray.400">Produto</Th>
										<Th color="gray.400" textAlign="center">Preço Final</Th>
										<Th color="gray.400" textAlign="center">Histórico</Th>
										<Th color="gray.400" textAlign="center">Ações</Th>
									</Tr>
								</Thead>
								<Tbody>
									{ filteredProducts.map( ( product: Product, index: number ) => (
										<Tr key={ index } _hover={{ bg: 'gray.600' }} transition="0.2s">
											<Td fontWeight="bold" color="blue.300">
												<VStack align="start" spacing={1}>
													<Text>{ product.codigo }</Text>
													<Badge colorScheme="gray" variant="subtle" fontSize="9px">
														rbx-{ product.prodId }
													</Badge>
												</VStack>
											</Td>
											<Td>
												<Box>
													<Text fontWeight="bold">{ product.nomeProd }</Text>
													<Flex gap={2} mb={1} alignItems="center">
														<Text fontSize="xs" color="gray.400">{ product.titulo }</Text>
													</Flex>
													<HStack spacing={2}>
														{product.pesoCx > 0 && (
															<Badge variant="subtle" colorScheme="orange" fontSize="10px">
																{product.pesoCx}kg
															</Badge>
														)}
														<Badge variant="outline" colorScheme="gray" textTransform="lowercase" fontSize="10px">
															{ `${product.altura} x ${product.largura} x ${product.comprimento} cm (alt.)` }
														</Badge>
													</HStack>
												</Box>
											</Td>
											<Td fontWeight="bold" color="green.300">
												<VStack align="center" spacing={1}>
													<Text fontSize="sm">
														{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.vFinal) }
													</Text>
													{product.tablecalc !== undefined && (
														<Badge 
															fontSize="10px" 
															colorScheme={getTableBadgeColor(getTableNameInPortuguese(product.tablecalc))} 
															variant="solid"
														>
															{getTableNameInPortuguese(product.tablecalc)}
														</Badge>
													)}
													{ session?.user?.pemission === 'Adm' && product.custoMp && (
														<Badge fontSize="10px" colorScheme="orange" variant="subtle">
															Custo MP: { new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.custoMp) }
														</Badge>
													) }
												</VStack>
											</Td>
											<Td textAlign="center">
												<VStack spacing={1}>
													{product.expiresIn && product.expiresIn !== '-' && (
														<Badge colorScheme={product.expired ? "red" : "green"} variant={product.expired ? "solid" : "subtle"}>
															{ formatDate( product.expiresIn ) }
														</Badge>
													)}
													<Box fontSize="10px" color="gray.400" textAlign="center">
														<Text>Última alteração em { formatDate( product.lastChange ) }</Text>
														{ product.lastUser && <Text>Por {product.lastUser}</Text> }
													</Box>
												</VStack>
											</Td>
											<Td textAlign="center">
												<HStack spacing={1} justify="center">
													<Button
														size="xs" 
														leftIcon={<FaInfoCircle />}
														colorScheme="blue" 
														variant="ghost"
														onClick={ () => {
															setProductToDetails( product )
															onOpenDetails()
														} }
													>
														Detalhes
													</Button>
													{ session?.user?.pemission === 'Adm' && (
														<>
															<Button
																size="xs" 
																leftIcon={<FaSync />}
																colorScheme="blue" 
																variant="ghost"
																onClick={ () => handleRefreshProduct( product ) }
															>
																Atualizar
															</Button>
															<Link href={{
																pathname: '/produtos/novo',
																query: { 
																	cnpj: selectedCompany?.attributes.CNPJ, 
																	email: selectedCompany?.attributes.email || selectedCompany?.attributes.emailNfe || session?.user?.email,
																	prodId: product.prodId
																}
															}} passHref>
																<Button
																	size="xs" 
																	leftIcon={<FaFileInvoiceDollar />}
																	colorScheme="green" 
																	variant="ghost"
																>
																	Orçar
																</Button>
															</Link>
															<Button
																size="xs" 
																leftIcon={<FaTrash />}
																colorScheme="red" 
																variant="ghost"
																onClick={ () => {
																	setProductToDelete( product )
																	onOpenDelete()
																} }
															>
																Excluir
															</Button>
														</>
													) }
												</HStack>
											</Td>
										</Tr>
									) ) }
								</Tbody>
							</Table>
						</Box>
					) }
				</Box>
			)}
		</Box>
	)
}

export default Produtos
