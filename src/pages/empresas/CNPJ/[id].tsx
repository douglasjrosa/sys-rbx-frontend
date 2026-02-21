import { ObjContato } from "@/components/data/objetivo"
import { TipoContato } from "@/components/data/tipo"
import Loading from "@/components/elements/loading"
import { MaskCep } from "@/function/Mask/cep"
import { MaskCnpj } from "@/function/Mask/cnpj"
import { formatarTelefone } from "@/function/Mask/telefone-whatsapp"
import { encontrarObjetoMaisProximoComCor } from "@/function/aviso"
import { 
	Box, 
	Divider, 
	Flex, 
	chakra, 
	Heading, 
	IconButton, 
	useToast, 
	Modal, 
	ModalOverlay, 
	ModalContent, 
	ModalHeader, 
	ModalBody, 
	Button, 
	useDisclosure, 
	FormControl, 
	FormLabel, 
	GridItem, 
	Input, 
	SimpleGrid, 
	Textarea, 
	Select, 
	Link, 
	Switch, 
	Badge, 
	Text, 
	VStack, 
	HStack, 
	Icon, 
	Table, 
	Thead, 
	Tbody, 
	Tr, 
	Th, 
	Td, 
	TableContainer,
	Avatar,
	Tooltip,
	Card,
	CardHeader,
	CardBody,
	Stack,
	StackDivider
} from "@chakra-ui/react"
import axios from "axios"
import { parseISO, differenceInDays } from "date-fns"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useCallback, useEffect, useState } from "react"
import { FiEdit3, FiPlusCircle, FiPhone, FiMail, FiMapPin, FiUser, FiCalendar, FiDollarSign, FiClock, FiFileText, FiList } from "react-icons/fi"
import { FaWhatsapp, FaTimes } from "react-icons/fa"

export default function Infos () {
	const { data: session } = useSession()
	const router = useRouter()
	const ID = router.query.id
	const [ Nome, setNome ] = useState( '' )
	const [ Razao, setRazao ] = useState( '' )
	const [ Endereço, setEndereço ] = useState( '' )
	const [ CNPJ, setCNPJ ] = useState( '' )
	const [ Numero, setNumero ] = useState( '' )
	const [ Bairro, setBairro ] = useState( '' )
	const [ CEP, setCEP ] = useState( '' )
	const [ Cidade, setCidade ] = useState( '' )
	const [ Uf, setUf ] = useState( '' )
	const [ Telefone, setTelefone ] = useState( '' )
	const [ Email, setEmail ] = useState( '' )
	const [ Tipo, setTipo ] = useState( '1' )
	const [ Objetivo, setObjetivo ] = useState( '1' )
	const [ Descricao, setDescricao ] = useState( '' )
	const [ Proximo, setProximo ] = useState( '' )
	const [ Representantes, setRepresentantes ] = useState( [] )
	const [ Historico, setHistorico ] = useState( [] )
	const [ Negocio, setNegocio ] = useState( [] )
	const [ Interacoes, setInteracoes ] = useState<any[]>( [] )
	const [ isHovered, setIsHovered ] = useState( false )
	const [ StatusAt, setStatusAt ] = useState( true )
	const [ ItenIndex, setItenIndex ] = useState( '' )
	const [ users, setUsers ] = useState( [] )
	const [ currentCompanyUser, setCurrentCompanyUser ] = useState<any>( null )
	const [ vendedor, setVendedor ] = useState( '' )
	const [ vendedorId, setVendedorId ] = useState( '' )
	const [ maxPg, setMaxPg ] = useState( "" )
	const [ purchaseFrequency, setPurchaseFrequency ] = useState( "" )
	const [ load, setload ] = useState( true )
	const [ tabelasPreco, setTabelasPreco ] = useState<any[]>( [] )
	const toast = useToast()

	const { isOpen, onOpen, onClose } = useDisclosure()

	useEffect( () => {
		( async () => {
			try {
				if ( !ID ) return
				const request = await axios( `/api/db/empresas/getId/${ ID }` )
				const response = request.data?.data

				if ( session?.user.pemission === 'Adm' ) {
					( async () => {
						try {
							const request = await axios( `/api/db/representantes/get?Vendedor=${ session?.user.name }&Empresa=${ ID }&Adm=true` )
							const dados = request.data

							setRepresentantes( dados )
						} catch ( error ) {
							console.error( "Erro ao buscar dados:", error )
						}
					} )()
				} else {
					( async () => {
						try {
							const request = await axios( `/api/db/representantes/get?Vendedor=${ session?.user.name }&Empresa=${ ID }&Adm=false` )
							const dados = request.data

							setRepresentantes( dados )
						} catch ( error ) {
							console.error( "Erro ao buscar dados:", error )
						}
					} )()
				}

				const dadosEntrada: any = !response.attributes?.representantes ? [] : response.attributes?.representantes
				const SemVendedor: any = dadosEntrada.filter( ( i: any ) => i.Vendedor === '' || !i.Vendedor )
				const comVendedor: any = dadosEntrada.filter( ( i: any ) => i.Vendedor === session?.user?.name )
				const Adm: any = dadosEntrada.filter( ( i: any ) => i.Vendedor === 'Adm' )
				const DataArray: any = [ ...SemVendedor, ...comVendedor, ...Adm ]
				setCurrentCompanyUser( response.attributes?.user )
				setVendedor( response.attributes?.vendedor )
				setVendedorId( response.attributes?.user?.data?.id || '' )
				setRepresentantes( !!response.attributes?.representantes && DataArray )
				setNome( response.attributes?.nome )
				setRazao( response.attributes?.razao )
				setEndereço( response.attributes?.endereco )
				setCNPJ( response.attributes?.CNPJ )
				setNumero( response.attributes?.numero )
				setBairro( response.attributes?.bairro )
				setCEP( response.attributes?.cep )
				setCidade( response.attributes?.cidade )
				setUf( response.attributes?.uf )
				setTelefone( response.attributes?.fone )
				setEmail( response.attributes?.email )
				setHistorico( response.attributes?.history?.slice( -3 ) || [] )
				const negocios = response.attributes?.businesses?.data || []
				// Pega os últimos 8 e inverte a ordem (mais recentes primeiro)
				setNegocio( negocios.slice( -8 ).reverse() )
				setMaxPg( response.attributes?.maxPg || "" )
				setPurchaseFrequency( response.attributes?.purchaseFrequency || "" )
				try {
					if ( session?.user.pemission === 'Adm' ) {
						const request2 = await axios( `/api/db/empresas/interacoes/get_adm?Empresa=${ response.attributes?.nome }` )
						const response2 = request2.data
						setInteracoes( Array.isArray( response2 ) ? response2 : [] )
					} else {
						const request2 = await axios( `/api/db/empresas/interacoes/get?Vendedor=${ session?.user.name }&Empresa=${ response.attributes?.nome }` )
						const response2 = request2.data
						setInteracoes( Array.isArray( response2 ) ? response2 : [] )
					}
				} catch ( error ) {
					console.error( "Erro ao buscar interações:", error )
					setInteracoes( [] )
				}
				try {
					const reqTabelas = await axios.get(
						`/api/db/tabela-preco/get/empresa/${ ID }`
					)
					setTabelasPreco( Array.isArray( reqTabelas.data ) ? reqTabelas.data : [] )
				} catch ( error ) {
					console.error( "Erro ao buscar tabelas de preço:", error )
					setTabelasPreco( [] )
				}
				setload( false )
			} catch ( error: any ) {
				console.error( error )
				toast( {
					title: 'Erro.',
					description: JSON.stringify( error.response?.data ),
					status: 'error',
					duration: 9000,
					isClosable: true,
				} )
				setTimeout( () => router.push( '/empresas' ), 1000 )
			}
		} )()
	}, [ ID, router, session?.user.name, session?.user.pemission, toast ] )

	const loadUsers = useCallback( async () => {
		const request = await axios.get( `/api/db/user` )
		const response = request.data
		setUsers( response )
	}, [] )

	useEffect( () => {
		loadUsers()
	}, [ loadUsers ] )


	if ( load ) return <Flex w={ '100%' } h={ '100vh' } bg={ 'gray.800' } justifyContent={ 'center' } alignItems={ 'center' }><Loading size="200px">Carregando...</Loading></Flex>

	const Save = async () => {
		if ( !Proximo ) {
			toast( {
				title: 'Opss.',
				description: "Interação não pode ser valva, falta definir a data",
				status: 'warning',
				duration: 9000,
				isClosable: true,
			} )
		} else {
			const dados = {
				data: {
					"vendedor": session?.user.id,
					"vendedor_name": session?.user.name,
					"empresa": ID,
					"descricao": Descricao,
					"tipo": parseInt( Tipo ),
					"objetivo": parseInt( Objetivo ),
					"proxima": Proximo,
					"pontual": true,
					"CNPJ": CNPJ,
					"status_atendimento": StatusAt
				}
			}

			setload( true )
			const url = `/api/db/empresas/interacoes/post`
			await axios( {
				url: url,
				method: 'POST',
				data: dados
			} )
				.then( async ( resposta: any ) => {
					setDescricao( '' )
					setTipo( '' )
					setObjetivo( '' )
					setProximo( '' )
					try {
						if ( session?.user.pemission === 'Adm' ) {
							const request2 = await axios( `/api/db/empresas/interacoes/get_adm?Empresa=${ Nome }` )
							const response2 = request2.data
							setInteracoes( response2 || [] )
						} else {
							const request2 = await axios( `/api/db/empresas/interacoes/get?Vendedor=${ session?.user.name }&Empresa=${ Nome }` )
							const response2 = request2.data
							setInteracoes( response2 || [] )
						}
						setload( false )
						onClose()
					} catch ( error: any ) {
						toast( {
							title: 'Erro.',
							description: JSON.stringify( error.response?.data || error ),
							status: 'error',
							duration: 9000,
							isClosable: true,
						} )
						setload( false )
					}
				} )
				.catch( ( error: any ) => {
					console.error( error )
					setload( false )
				} )
		}
	}

	const Alert = encontrarObjetoMaisProximoComCor( Interacoes, vendedor )
	const letra = 'white'

	const handleMouseEnter = ( i: any ) => {
		setIsHovered( true )
		setItenIndex( i )
	}

	const handleMouseLeave = () => {
		setIsHovered( false )
		setItenIndex( '' )
	}

	return (
		<>
			<Box minW="100%" minH="100vh" bg="gray.900" color="white" p={{ base: 4, md: 8 }}>
				{/* Header Section */}
				<Flex 
					flexDir={{ base: 'column', md: 'row' }} 
					justifyContent="space-between" 
					alignItems="center" 
					mb={8} 
					gap={{ base: 6, md: 4 }}
				>
					<HStack spacing={4} align="center" justify={{ base: 'center', md: 'flex-start' }} w="full">
						<VStack align={{ base: 'center', md: 'flex-start' }} spacing={0}>
							<Heading size="lg" color="blue.300" textAlign={{ base: 'center', md: 'left' }}>{Nome}</Heading>
							<HStack mt={1} justify={{ base: 'center', md: 'flex-start' }}>
								<Badge colorScheme="blue" variant="subtle" fontSize="0.7rem" rounded="full" px={2}>
									{MaskCnpj(CNPJ)}
								</Badge>
								{purchaseFrequency && (
									<Badge colorScheme="purple" variant="outline" fontSize="0.7rem" rounded="full" px={2}>
										{purchaseFrequency}
									</Badge>
								)}
							</HStack>
						</VStack>
					</HStack>
					<Button
						leftIcon={<FiEdit3 />}
						colorScheme="blue"
						variant="solid"
						size="sm"
						px={8}
						onClick={() => router.push(`/empresas/atualizar/${ID}`)}
						shadow="md"
					>
						Editar Empresa
					</Button>
				</Flex>

				{/* Admin Controls */}
				{session?.user.pemission === 'Adm' && (
					<Card bg="gray.800" borderColor="gray.700" borderWidth="1px" mb={8} shadow="xl" overflow="hidden">
						<CardHeader bg="gray.750" py={3} borderBottomWidth="1px" borderColor="gray.700">
							<Heading size="xs" textTransform="uppercase" letterSpacing="wider" color="gray.400">
								Controles de Administrador
							</Heading>
						</CardHeader>
						<CardBody>
							<SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} alignItems="flex-end" textAlign="center">
								<FormControl>
									<FormLabel fontSize="xs" fontWeight="bold" color="gray.100" textAlign="center">Vendedor Responsável</FormLabel>
									<Select
										size="sm"
										bg="gray.700"
										borderColor="gray.600"
										color="white"
										defaultValue={vendedorId}
										textAlign="center"
										onChange={(e) => {
											const selectedUser: any = users.find((user: any) => user.id === Number(e.target.value))
											setVendedor(selectedUser?.username || '')
											setCurrentCompanyUser(selectedUser || null)
											setVendedorId(e.target.value)
										}}
									>
										<option value="" style={{ backgroundColor: "#2D3748", color: "white" }}>Nenhum</option>
										{users.map((user: any) => (
											<option key={user.id} value={user.id} style={{ backgroundColor: "#2D3748", color: "white" }}>
												{user.username}
											</option>
										))}
									</Select>
								</FormControl>

								<FormControl>
									<FormLabel fontSize="xs" fontWeight="bold" color="gray.100" textAlign="center">Prazo Máximo (dias)</FormLabel>
									<Input
										size="sm"
										bg="gray.700"
										borderColor="gray.600"
										color="white"
										value={maxPg || ''}
										textAlign="center"
										onChange={(e) => setMaxPg(e.target.value)}
										type="number"
									/>
								</FormControl>

								<FormControl>
									<FormLabel fontSize="xs" fontWeight="bold" color="gray.100" textAlign="center">Frequência de Compra</FormLabel>
									<Select
										size="sm"
										bg="gray.700"
										borderColor="gray.600"
										color="white"
										value={purchaseFrequency || ''}
										textAlign="center"
										onChange={(e) => setPurchaseFrequency(e.target.value)}
									>
										<option value="" style={{ backgroundColor: "#2D3748", color: "white" }}>Selecione</option>
										<option value="Mensalmente" style={{ backgroundColor: "#2D3748", color: "white" }}>Mensalmente</option>
										<option value="Eventualmente" style={{ backgroundColor: "#2D3748", color: "white" }}>Eventualmente</option>
										<option value="Raramente" style={{ backgroundColor: "#2D3748", color: "white" }}>Raramente</option>
									</Select>
								</FormControl>
							</SimpleGrid>
							<Flex justifyContent="center" mt={6}>
								<Button
									size="sm"
									colorScheme="green"
									px={8}
									onClick={async () => {
										try {
											const request = await axios.put(`/api/refactory/companies`, {
												id: ID,
												user: vendedorId ? { id: parseInt(vendedorId) } : null,
												vendedor: vendedor,
												maxPg: maxPg,
												purchaseFrequency: purchaseFrequency || null
											})
											if (request.status === 200) {
												toast({ title: 'Sucesso.', description: "Dados atualizados com sucesso", status: 'success', duration: 5000, isClosable: true })
											}
										} catch (error) {
											console.error(error)
											toast({ title: 'Erro.', description: "Erro ao atualizar dados", status: 'error', duration: 5000, isClosable: true })
										}
									}}
								>
									Salvar Alterações
								</Button>
							</Flex>
						</CardBody>
					</Card>
				)}

				{/* Main Content Grid */}
				<SimpleGrid columns={{ base: 1, xl: 2 }} spacing={8}>
					{/* Left Column: Businesses and Interactions */}
					<Stack spacing={8}>
						{/* Negócios Card */}
						<Card bg="gray.800" borderColor="gray.700" borderWidth="1px" shadow="xl">
							<CardHeader borderBottomWidth="1px" borderColor="gray.700" py={4}>
								<Flex justify="space-between" align="center">
									<Heading size="md" color="white">Últimos Negócios</Heading>
									<Icon as={FiDollarSign} color="green.400" />
								</Flex>
							</CardHeader>
							<CardBody p={0}>
								<TableContainer>
									<Table variant="simple" size="sm">
										<Thead bg="gray.750">
											<Tr>
												<Th color="gray.200">Data</Th>
												<Th color="gray.200">Vendedor</Th>
												<Th color="gray.200" textAlign="center">Duração</Th>
												<Th color="gray.200" isNumeric>Valor</Th>
											</Tr>
										</Thead>
										<Tbody>
											{Negocio && Negocio.length > 0 ? Negocio.map((i: any) => {
												if (!i || !i.attributes) return null
												const vend = i.attributes.vendedor?.data?.attributes?.username || i.attributes.vendedor_name || '-'
												const pedidos = i.attributes.pedidos?.data || []
												const pPedido = pedidos.length > 0 ? pedidos[0] : null
												const valBudget = i.attributes?.Budget ? parseFloat(i.attributes.Budget.toString().replace(/\./g, '').replace(',', '.')) : null
												const valPedido = pPedido?.attributes?.totalGeral ? parseFloat(pPedido.attributes.totalGeral.toString().replace(/\./g, '').replace(',', '.')) : null
												const valor = valBudget || valPedido || null
												const dConclucao = i.attributes?.date_conclucao ? parseISO(i.attributes.date_conclucao).toLocaleDateString('pt-BR') : '-'
												
												let duracao = '-'
												if (i.attributes?.date_conclucao && i.attributes?.createdAt) {
													const dCriacao = parseISO(i.attributes.createdAt)
													const dias = differenceInDays(parseISO(i.attributes.date_conclucao), dCriacao)
													const dur = dias >= 0 ? dias + 1 : 0
													duracao = dur > 0 ? `${dur} ${dur === 1 ? 'dia' : 'dias'}` : '-'
												}

												const statusColor = i.attributes?.etapa === 6 && i.attributes?.andamento === 1 ? 'red.400' : 
																   i.attributes?.etapa === 6 && i.attributes?.andamento === 5 ? 'green.400' : 'yellow.400'

												return (
													<Tr 
														key={i.id} 
														_hover={{ bg: 'whiteAlpha.50' }} 
														cursor="pointer" 
														onClick={() => router.push(`/negocios/${i.id}`)}
													>
														<Td fontSize="xs" color="white">{dConclucao}</Td>
														<Td fontSize="xs" fontWeight="medium" color="white">{vend}</Td>
														<Td fontSize="xs" textAlign="center" color="white">{duracao}</Td>
														<Td fontSize="xs" isNumeric fontWeight="bold" color={statusColor}>
															{valor ? valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
														</Td>
													</Tr>
												)
											}) : (
												<Tr><Td colSpan={4} textAlign="center" py={8} color="gray.400">Nenhum negócio encontrado</Td></Tr>
											)}
										</Tbody>
									</Table>
								</TableContainer>
							</CardBody>
						</Card>

						{/* Interações Card */}
						<Card bg="gray.800" borderColor="gray.700" borderWidth="1px" shadow="xl">
							<CardHeader borderBottomWidth="1px" borderColor="gray.700" py={4}>
								<Flex justify="space-between" align="center">
									<Heading size="md" color="white">Últimas Interações</Heading>
									<Button
										leftIcon={<FiPlusCircle />}
										colorScheme="green"
										size="sm"
										rounded="md"
										onClick={onOpen}
									>
										Nova
									</Button>
								</Flex>
							</CardHeader>
							<CardBody maxH="500px" overflowY="auto" sx={{
								'&::-webkit-scrollbar': { width: '6px' },
								'&::-webkit-scrollbar-track': { background: 'transparent' },
								'&::-webkit-scrollbar-thumb': { background: 'gray.600', borderRadius: '3px' },
							}}>
								<Stack divider={<StackDivider borderColor="gray.700" />} spacing={4}>
									{Interacoes && Interacoes.length > 0 ? Interacoes.map((i: any) => {
										if (!i || !i.attributes) return null
										const obj = ObjContato.find(o => o.id == i.attributes?.objetivo)?.title || "Sem objetivo"
										const tipo = TipoContato.find(t => t.id == i.attributes?.tipo)?.title || "Sem tipo"
										const date = i.attributes?.proxima ? new Date(parseISO(i.attributes.proxima)) : new Date()
										const vName = i.attributes?.vendedor?.data?.attributes?.nome || i.attributes?.vendedor_name || "Vendedor"

										return (
											<Box key={i.id} p={2}>
												<Flex justify="space-between" align="flex-start" mb={2}>
													<VStack align="flex-start" spacing={0}>
														<Text fontWeight="bold" color="blue.300" fontSize="sm">{obj}</Text>
														<Text fontSize="xs" color="gray.400">{vName}</Text>
													</VStack>
													<Badge colorScheme="blue" variant="subtle" fontSize="2xs">{tipo}</Badge>
												</Flex>
												<Text fontSize="xs" color="gray.300" mb={2} noOfLines={3}>{i.attributes?.descricao}</Text>
												<Flex justify="flex-end">
													<HStack spacing={1} color="gray.400">
														<Icon as={FiCalendar} size={10} />
														<Text fontSize="2xs">{date.toLocaleDateString()}</Text>
													</HStack>
												</Flex>
											</Box>
										)
									}) : (
										<Text textAlign="center" py={8} color="gray.400">Nenhuma interação registrada</Text>
									)}
								</Stack>
							</CardBody>
							{Alert && (
								<Box bg={Alert.cor === 'yellow' ? 'yellow.500' : Alert.cor} p={2} textAlign="center">
									<Text fontSize="xs" fontWeight="bold" color="white">
										{Alert.info} {Alert.data?.toLocaleDateString()}
									</Text>
								</Box>
							)}
						</Card>

						{/* Tabelas de Preços Card */}
						<Card bg="gray.800" borderColor="gray.700" borderWidth="1px" shadow="xl">
							<CardHeader borderBottomWidth="1px" borderColor="gray.700" py={4}>
								<Flex justify="space-between" align="center">
									<Heading size="md" color="white">Tabelas de Preços</Heading>
									<Button
										leftIcon={<FiPlusCircle />}
										colorScheme="green"
										size="sm"
										rounded="md"
										onClick={() => router.push(
											`/produtos?empresaId=${ ID }&tabelaPrecos=true`
										)}
									>
										Nova
									</Button>
								</Flex>
							</CardHeader>
							<CardBody maxH="350px" overflowY="auto" p={0} sx={{
								'&::-webkit-scrollbar': { width: '6px' },
								'&::-webkit-scrollbar-track': { background: 'transparent' },
								'&::-webkit-scrollbar-thumb': {
									background: 'gray.600',
									borderRadius: '3px',
								},
							}}>
								{tabelasPreco.length > 0 ? (
									<TableContainer>
										<Table variant="simple" size="sm">
											<Thead bg="gray.750">
												<Tr>
													<Th color="gray.200">Data</Th>
													<Th color="gray.200" textAlign="center">Itens</Th>
													<Th color="gray.200">Vendedor</Th>
												</Tr>
											</Thead>
											<Tbody>
												{tabelasPreco.map( ( tab: any ) => (
													<Tr
														key={tab.id}
														_hover={{ bg: 'whiteAlpha.50' }}
														cursor="pointer"
														onClick={() => window.open(
															`/api/db/tabela-preco/pdf/${ tab.id }`,
															'_blank'
														)}
													>
														<Td fontSize="xs" color="white">
															<HStack spacing={1}>
																<Icon as={FiList} color="green.400" boxSize={3} />
																<Text>
																	{new Date( tab.createdAt )
																		.toLocaleDateString( 'pt-BR' )}
																</Text>
															</HStack>
														</Td>
														<Td
															fontSize="xs"
															textAlign="center"
															color="white"
														>
															<Badge colorScheme="green" variant="subtle">
																{tab.itensCount}
															</Badge>
														</Td>
														<Td fontSize="xs" color="white">
															{tab.vendedor}
														</Td>
													</Tr>
												) )}
											</Tbody>
										</Table>
									</TableContainer>
								) : (
									<Text
										textAlign="center"
										py={8}
										color="gray.400"
									>
										Nenhuma tabela de preços gerada
									</Text>
								)}
							</CardBody>
						</Card>
					</Stack>

					{/* Right Column: Contacts and Registration Info */}
					<Stack spacing={8}>
						{/* Contatos Card */}
						<Card bg="gray.800" borderColor="gray.700" borderWidth="1px" shadow="xl">
							<CardHeader borderBottomWidth="1px" borderColor="gray.700" py={4}>
								<Flex justify="space-between" align="center">
									<Heading size="md" color="white">Contatos</Heading>
									<Icon as={FiUser} color="blue.400" />
								</Flex>
							</CardHeader>
							<CardBody p={0}>
								<Stack divider={<StackDivider borderColor="gray.700" />} spacing={0}>
									{Representantes && Representantes.length > 0 ? Representantes.map((item: any, index: number) => {
										const tel = item.attributes?.whatsapp || item.attributes?.telefone
										return (
											<Box key={index} p={4} _hover={{ bg: 'whiteAlpha.50' }}>
												<Flex align="center" gap={4} mb={3}>
													<Avatar size="sm" name={item.attributes?.nome} bg="blue.600" />
													<VStack align="flex-start" spacing={0}>
														<Text fontWeight="bold" fontSize="sm" color="white">{item.attributes?.nome}</Text>
														<Text fontSize="xs" color="gray.400">{item.attributes?.cargo} • {item.attributes?.departamento}</Text>
													</VStack>
												</Flex>
												<SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
													<HStack spacing={2} color="blue.200">
														<Icon as={tel?.length === 11 ? FaWhatsapp : FiPhone} />
														{tel?.length === 11 ? (
															<Link 
																fontSize="xs" 
																onClick={() => window.open(`https://wa.me//55${tel}`, '_blank')}
																_hover={{ color: 'blue.400' }}
															>
																{formatarTelefone(tel)}
															</Link>
														) : (
															<Text fontSize="xs">{formatarTelefone(tel) || 'Não informado'}</Text>
														)}
													</HStack>
													<HStack spacing={2} color="blue.200">
														<Icon as={FiMail} />
														<Link 
															href={`mailto:${item.attributes?.email}`} 
															fontSize="xs"
															isTruncated
															_hover={{ color: 'blue.400' }}
														>
															{item.attributes?.email || 'Não informado'}
														</Link>
													</HStack>
												</SimpleGrid>
											</Box>
										)
									}) : (
										<Text textAlign="center" py={8} color="gray.400">Nenhum contato cadastrado</Text>
									)}
								</Stack>
							</CardBody>
						</Card>

						{/* Dados Cadastrais Card */}
						<Card bg="gray.800" borderColor="gray.700" borderWidth="1px" shadow="xl">
							<CardHeader borderBottomWidth="1px" borderColor="gray.700" py={4}>
								<Flex justify="space-between" align="center">
									<Heading size="md" color="white">Dados Cadastrais</Heading>
									<Icon as={FiFileText} color="orange.400" />
								</Flex>
							</CardHeader>
							<CardBody>
								<Stack spacing={3}>
									<HStack justify="space-between" wrap="wrap">
										<Text color="gray.400" fontSize="xs" fontWeight="bold" textTransform="uppercase">Razão Social</Text>
										<Text fontSize="xs" textAlign="right" maxW="70%" color="white">{Razao}</Text>
									</HStack>
									<Divider borderColor="gray.700" />
									<HStack justify="space-between">
										<Text color="gray.400" fontSize="xs" fontWeight="bold" textTransform="uppercase">CNPJ</Text>
										<Text fontSize="xs" color="white">{MaskCnpj(CNPJ)}</Text>
									</HStack>
									<Divider borderColor="gray.700" />
									<HStack justify="space-between" align="flex-start">
										<Text color="gray.400" fontSize="xs" fontWeight="bold" textTransform="uppercase">Endereço</Text>
										<VStack align="flex-end" spacing={0}>
											<Text fontSize="xs" textAlign="right" color="white">{Endereço}, {Numero}</Text>
											<Text fontSize="xs" color="gray.400">{Bairro} • {MaskCep(CEP)}</Text>
											<Text fontSize="xs" color="gray.400">{Cidade} - {Uf}</Text>
										</VStack>
									</HStack>
									<Divider borderColor="gray.700" />
									<HStack justify="space-between">
										<Text color="gray.400" fontSize="xs" fontWeight="bold" textTransform="uppercase">Telefone Principal</Text>
										<Text fontSize="xs" color="white">{formatarTelefone(Telefone)}</Text>
									</HStack>
									<Divider borderColor="gray.700" />
									<HStack justify="space-between">
										<Text color="gray.400" fontSize="xs" fontWeight="bold" textTransform="uppercase">E-mail Principal</Text>
										<Text fontSize="xs" color="blue.300">{Email}</Text>
									</HStack>
								</Stack>
							</CardBody>
						</Card>
					</Stack>
				</SimpleGrid>
			</Box>

			<Modal closeOnOverlayClick={ false } isOpen={ isOpen } onClose={ onClose } size="lg">
				<ModalOverlay backdropFilter='blur(4px)' />
				<ModalContent bg="gray.800" color="white" borderRadius="xl" position="relative">
					<IconButton
						aria-label="Fechar"
						icon={ <FaTimes size={ 18 } /> }
						position="absolute"
						top="8px"
						right="8px"
						zIndex={ 1 }
						size="sm"
						variant="solid"
						bg="red.500"
						color="white"
						rounded="md"
						_hover={ { bg: "red.600" } }
						onClick={ onClose }
					/>
					<ModalHeader borderBottomWidth="1px" borderColor="gray.700" pr="48px">
						Nova Interação
					</ModalHeader>
					<ModalBody py={6}>
						<VStack spacing={6}>
							<FormControl w={{ base: "100%", md: "auto" }}>
								<HStack justify={{ base: "center", md: "flex-start" }}>
									<Switch
										colorScheme="blue"
										isChecked={StatusAt}
										onChange={(e) => setStatusAt(e.target.checked)}
									/>
									<FormLabel mb="0" fontSize="xs" fontWeight="bold" color="gray.400">
										Cliente qualificado
									</FormLabel>
								</HStack>
							</FormControl>

							<FormControl>
								<FormLabel fontSize="xs" fontWeight="bold" color="gray.400">Objetivo</FormLabel>
								<Select
									size="sm"
									bg="gray.700"
									borderColor="gray.600"
									rounded="md"
									onChange={(e) => setObjetivo(e.target.value)}
									value={Objetivo}
								>
									<option value="1" style={{ backgroundColor: '#2D3748' }}>Sondar decisores</option>
									<option value="2" style={{ backgroundColor: '#2D3748' }}>Aproximação</option>
									<option value="3" style={{ backgroundColor: '#2D3748' }}>Sondar interesses</option>
									<option value="4" style={{ backgroundColor: '#2D3748' }}>Gerar negócio</option>
									<option value="5" style={{ backgroundColor: '#2D3748' }}>Resolver problemas</option>
								</Select>
							</FormControl>

							<FormControl>
								<FormLabel fontSize="xs" fontWeight="bold" color="gray.400">Resumo da Interação</FormLabel>
								<Textarea
									size="sm"
									bg="gray.700"
									borderColor="gray.600"
									placeholder="Especifique aqui os detalhes do contato..."
									rows={4}
									rounded="md"
									onChange={(e) => setDescricao(e.target.value)}
									value={Descricao}
								/>
							</FormControl>

							<FormControl w={{ base: "100%", md: "200px" }}>
								<FormLabel fontSize="xs" fontWeight="bold" color="gray.400">
									Próximo Contato
								</FormLabel>
								<Input
									type="date"
									size="sm"
									bg="gray.700"
									borderColor="gray.600"
									rounded="md"
									onChange={(e) => setProximo(e.target.value)}
									value={Proximo}
								/>
							</FormControl>

							<HStack w="100%" spacing={4} pt={4} borderTopWidth="1px" borderColor="gray.700" justify="center">
								<Button colorScheme="blue" onClick={Save} size="sm" px={8}>Salvar Interação</Button>
							</HStack>
						</VStack>
					</ModalBody>
				</ModalContent>
			</Modal>
		</>
	)
}
