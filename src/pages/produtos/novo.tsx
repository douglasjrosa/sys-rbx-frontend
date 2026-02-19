import {
	Box,
	Button,
	Flex,
	FormLabel,
	Heading,
	HStack,
	Input,
	Select,
	VStack,
	Text,
	useToast,
	IconButton,
	Badge,
	SimpleGrid,
	Spinner,
	useColorModeValue,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef } from 'react'
import { FaArrowLeft, FaCalculator, FaSave } from 'react-icons/fa'
import axios from 'axios'

// Data
import { modCaix } from '@/components/data/modCaix'
import { marginTables } from '@/components/data/marginTables'

interface CalcResult {
	vFinal: number
	preco: number
	pesoCx: number
	titulo: string
	[ key: string ]: any
}

const formatCNPJ = ( cnpj: string | undefined | null ) => {
	if ( !cnpj ) return ''
	const cleaned = cnpj.replace( /\D/g, '' )
	return cleaned.replace( /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5' )
}

const MAX_COMPANY_NAME_LENGTH = 15

const formatCompanyDisplayName = ( name: string | undefined | null ): string => {
	if ( !name ) return ''
	const upper = name.toUpperCase()
	return upper.length > MAX_COMPANY_NAME_LENGTH ? `${ upper.slice( 0, MAX_COMPANY_NAME_LENGTH ) }...` : upper
}

export default function NovoProduto () {
	const router = useRouter()
	const { cnpj, prodId } = router.query
	const { data: session, status } = useSession()
	const toast = useToast()

	const [ isLoading, setIsLoading ] = useState( false )
	const [ isCalculating, setIsCalculating ] = useState( false )
	const [ isSaving, setIsSaving ] = useState( false )
	const [ companyData, setCompanyData ] = useState<any>( null )

	// Form State
	const [ formData, setFormData ] = useState( {
		nomeProd: '',
		modelo: '',
		comprimento: '',
		largura: '',
		altura: '',
		codigo: '',
		pesoProd: '',
		tabela: '',
		empresa: typeof cnpj === 'string' ? cnpj : ( Array.isArray( cnpj ) ? cnpj[ 0 ] : '' ),
	} )

	const [ result, setResult ] = useState<CalcResult | null>( null )
	const pageBottomRef = useRef<HTMLDivElement>( null )

	// Scroll to bottom of page when result is set (after Calcular)
	useEffect( () => {
		if ( result && pageBottomRef.current ) {
			setTimeout( () => {
				pageBottomRef.current?.scrollIntoView( { behavior: 'smooth', block: 'end' } )
			}, 200 )
		}
	}, [ result ] )

	// Fetch existing product data if prodId is provided (cloning/editing)
	useEffect( () => {
		if ( cnpj && session?.user?.email && router.isReady ) {
			setIsLoading( true )

			// 1. Fetch Company Data to get default tablecalc
			axios.get( `/api/refactory/companies?searchString=${ cnpj }` )
				.then( res => {
					const company = res.data.data?.[ 0 ]
					if ( company ) {
						setCompanyData( company )
						const tablecalc = parseFloat( company.attributes.tablecalc )
						if ( !isNaN( tablecalc ) ) {
							setFormData( prev => ( { ...prev, tabela: tablecalc.toFixed( 2 ) } ) )
						}
					}
				} )
				.catch( err => console.error( "Error fetching company:", err ) )

			// 2. Fetch existing product if provided
			if ( prodId ) {
				axios.get( `/api/rbx/${ session.user.email }/produtos?prodId=${ prodId }` )
					.then( res => {
						const p = res.data
						setFormData( prev => ( {
							...prev,
							nomeProd: p.nomeProd || '',
							modelo: p.modelo || '',
							comprimento: p.comprimento || '',
							largura: p.largura || '',
							altura: p.altura || '',
							codigo: p.codigo || '',
							pesoProd: p.pesoProd || '',
							tabela: p.tabela || prev.tabela,
						} ) )
						setResult( p )
					} )
					.catch( err => {
						console.error( "Error fetching product:", err )
						toast( { title: "Erro ao carregar produto", status: "error" } )
					} )
					.finally( () => setIsLoading( false ) )
			} else {
				setIsLoading( false )
			}
		}
	}, [ prodId, cnpj, session, router.isReady, toast ] )

	const FIELDS_THAT_INVALIDATE_RESULT = [ 'comprimento', 'largura', 'altura', 'modelo', 'tabela' ]

	const handleInputChange = ( e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> ) => {
		const { name, value } = e.target
		if ( result && FIELDS_THAT_INVALIDATE_RESULT.includes( name ) ) {
			setResult( null )
		}
		setFormData( prev => ( { ...prev, [ name ]: value } ) )
	}

	const handleCalculate = async () => {
		if ( !formData.modelo || !formData.comprimento || !formData.largura || !formData.altura ) {
			toast( { title: "Preencha os campos obrigatórios", description: "Modelo e dimensões são necessários.", status: "warning" } )
			return
		}

		setIsCalculating( true )
		try {
			const params = new URLSearchParams( {
				calcular: '1',
				...formData
			} )
			const response = await axios.get( `/api/rbx/${ session?.user?.email }/produtos?${ params.toString() }` )

			console.log( "API Response:", response.data )

			if ( response.data && !response.data.error ) {
				// The WP API returns an object with "info" or direct attributes depending on the version
				const data = response.data.info || response.data
				setResult( data )
				toast( { title: "Cálculo realizado", status: "success", duration: 2000 } )
			} else {
				throw new Error( response.data.error || "Erro no cálculo" )
			}
		} catch ( error: any ) {
			console.error( "Erro ao calcular:", error )
			toast( { title: "Erro no cálculo", description: error.message, status: "error" } )
		} finally {
			setIsCalculating( false )
		}
	}

	const handleSave = async () => {
		if ( !result ) {
			toast( { title: "Calcule antes de salvar", status: "warning" } )
			return
		}

		if ( !session?.user?.email ) {
			toast( { title: "Usuário não autenticado", status: "error" } )
			return
		}

		setIsSaving( true )
		try {
			// Garantir que cnpj seja uma string
			const cnpjStr = Array.isArray( cnpj ) ? cnpj[ 0 ] : cnpj

			// 1. Obter ID da empresa no Strapi (usar o que já carregamos se disponível)
			let company = companyData
			if ( !company && cnpjStr ) {
				const compRes = await axios.get( `/api/refactory/companies?searchString=${ cnpjStr }` )
				company = compRes.data.data?.[ 0 ]
			}

			if ( !company ) throw new Error( "Empresa não encontrada no sistema comercial" )

			// 2. Salvar no WordPress (API externa)
			const now = new Date()
			const formattedDate = now.toLocaleDateString( 'pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' } )
			const formattedTime = now.toLocaleTimeString( 'pt-BR', { hour: '2-digit', minute: '2-digit' } )
			const lastChange = `${ formattedDate } - ${ formattedTime }`

			const wpSaveData = {
				...result,
				nomeProd: formData.nomeProd,
				codigo: formData.codigo,
				modelo: formData.modelo,
				tabela: formData.tabela,
				empresa: cnpjStr,
				lastUser: session?.user?.name || 'Sistema',
				lastChange: lastChange,
				ativo: "1",
			}

			// Chamar o proxy para o WP
			const wpRes = await axios.post( `/api/rbx/${ session.user.email }/produtos`, {
				salvar: true,
				dados: wpSaveData
			} )

			if ( !wpRes.data || wpRes.data.erro ) {
				throw new Error( wpRes.data?.erro || "Erro ao salvar no sistema legado" )
			}

			const newIndice = wpRes.data.indice

			// 3. Salvar/Sincronizar no Strapi
			const syncRes = await axios.post( `/api/db/produtos/sync`, {
				empresaId: company.id,
				produtos: [ {
					...wpSaveData,
					prodId: newIndice,
				} ]
			} )

			if ( syncRes.data.failed > 0 ) {
				throw new Error( "Produto salvo no legado, mas houve uma falha na sincronização." )
			}

			toast( { title: "Produto salvo com sucesso", status: "success", duration: 5000 } )

			// Redirecionar de volta para a lista de produtos daquela empresa já carregada
			router.push( `/produtos?empresaId=${ company.id }` )

		} catch ( error: any ) {
			console.error( "Erro ao salvar:", error )
			toast( {
				title: "Erro ao salvar",
				description: error.response?.data?.error || error.message,
				status: "error",
				duration: 7000
			} )
		} finally {
			setIsSaving( false )
		}
	}

	const bgColor = useColorModeValue( 'gray.800', 'gray.800' )
	const cardBg = useColorModeValue( 'gray.700', 'gray.700' )

	if ( status === 'loading' || isLoading ) {
		return (
			<Flex h="100vh" w="100%" justify="center" align="center" bg={ bgColor }>
				<Spinner size="xl" color="blue.500" />
			</Flex>
		)
	}

	return (
		<Box px={ 10 } pt={ 10 } pb={ 16 } bg={ bgColor } minH="100vh" color="white">
			<Flex
				mb={ 8 }
				flexDirection={{ base: 'column', md: 'row' }}
				justifyContent="space-between"
				alignItems={{ base: 'stretch', md: 'center' }}
				gap={ 4 }
			>
				<HStack spacing={ 4 }>
					<IconButton
						aria-label="Voltar"
						icon={ <FaArrowLeft /> }
						onClick={ () => router.back() }
						variant="ghost"
						colorScheme="blue"
					/>
					<VStack align="start" spacing={ 0 }>
						<Heading size="lg">Novo Produto</Heading>
					</VStack>
				</HStack>
				{ companyData && (
					<Box
						bg={ cardBg }
						px={ 4 }
						py={ 3 }
						borderRadius="md"
						shadow="md"
						alignSelf={{ base: 'stretch', md: 'flex-end' }}
					>
						<Text fontWeight="bold" fontSize="lg" color="white">{ formatCompanyDisplayName( companyData.attributes.nome ) }</Text>
						<Text fontSize="xs" color="gray.400">{ formatCNPJ( companyData.attributes.CNPJ ) }</Text>
					</Box>
				) }
			</Flex>

			<SimpleGrid columns={ { base: 1, lg: 2 } } spacing={ 10 } maxW="container.xl" mx="auto" mb={ 10 } alignItems="stretch">
				{/* Coluna da Esquerda: Dimensões e Modelo */ }
				<Box bg={ cardBg } p={ 8 } borderRadius="xl" shadow="2xl" display="flex" flexDirection="column">
					<VStack spacing={ 6 } align="stretch" flex={ 1 }>
						<Heading size="sm" color="blue.300">Dimensões Internas e Modelo</Heading>
						<VStack spacing={ 4 } align="stretch" w="full">
							<Box maxW="230px" mx="auto" w="full">
								<FormLabel fontSize="sm">Comprimento (cm)</FormLabel>
								<Input
									name="comprimento"
									type="number"
									value={ formData.comprimento }
									onChange={ handleInputChange }
									bg="gray.800"
									border="none"
									w="full"
									textAlign="center"
								/>
							</Box>
							<Box maxW="230px" mx="auto" w="full">
								<FormLabel fontSize="sm">Largura (cm)</FormLabel>
								<Input
									name="largura"
									type="number"
									value={ formData.largura }
									onChange={ handleInputChange }
									bg="gray.800"
									border="none"
									w="full"
									textAlign="center"
								/>
							</Box>
							<Box maxW="230px" mx="auto" w="full">
								<FormLabel fontSize="sm">Altura (cm)</FormLabel>
								<Input
									name="altura"
									type="number"
									value={ formData.altura }
									onChange={ handleInputChange }
									bg="gray.800"
									border="none"
									w="full"
									textAlign="center"
								/>
							</Box>
							<Box maxW="230px" mx="auto" w="full">
								<FormLabel fontSize="sm">Modelo da Embalagem</FormLabel>
								<Select
									name="modelo"
									value={ formData.modelo }
									onChange={ handleInputChange }
									bg="gray.800"
									border="none"
									placeholder="Selecione o modelo"
									size="sm"
									rounded="md"
									w="full"
									textAlign="center"
								>
									{ modCaix.map( m => (
										<option key={ m.id } value={ m.id } style={ { background: '#1A202C' } }>
											{ m.title }
										</option>
									) ) }
								</Select>
							</Box>
						</VStack>
					</VStack>
				</Box>

				{/* Coluna da Direita: Identificação, Tabela, Calcular */ }
				<Box bg={ cardBg } p={ 8 } borderRadius="xl" shadow="2xl" display="flex" flexDirection="column">
					<VStack spacing={ 6 } align="stretch" flex={ 1 }>
						<Box w="full">
							<Heading size="sm" color="blue.300" mb={ 4 }>Identificação</Heading>
							<VStack spacing={ 4 } align="stretch" w="full">
								<Box maxW="230px" mx="auto" w="full">
									<FormLabel fontSize="sm">Nome do Produto (Opcional)</FormLabel>
									<Input
										name="nomeProd"
										value={ formData.nomeProd }
										onChange={ handleInputChange }
										bg="gray.800"
										border="none"
										placeholder="Ex: Embalagem para Peça X"
										size="sm"
										rounded="md"
										w="full"
										textAlign="center"
									/>
								</Box>
								<Box maxW="230px" mx="auto" w="full">
									<FormLabel fontSize="sm">Código (Opcional)</FormLabel>
									<Input
										name="codigo"
										value={ formData.codigo }
										onChange={ handleInputChange }
										bg="gray.800"
										border="none"
										placeholder="Cód. interno"
										size="sm"
										rounded="md"
										w="full"
										textAlign="center"
									/>
								</Box>
							</VStack>
						</Box>

						{ session?.user?.pemission === 'Adm' && (
							<Box w="full">
								<Heading size="sm" color="blue.300" mb={ 4 }>Tabela</Heading>
								<Box maxW="230px" mx="auto" w="full">
									<FormLabel fontSize="sm">Tabela de Margem</FormLabel>
									<Select
										name="tabela"
										value={ formData.tabela }
										onChange={ handleInputChange }
										bg="gray.800"
										border="none"
										size="sm"
										rounded="md"
										w="full"
										textAlign="center"
									>
										<option value="" style={ { background: '#1A202C' } }>Selecione a tabela</option>
										{ marginTables.map( t => (
											<option key={ t.id } value={ t.profitMargin.toFixed( 2 ) } style={ { background: '#1A202C' } }>
												{ t.name } ({ ( t.profitMargin * 100 ).toFixed( 0 ) }%)
											</option>
										) ) }
									</Select>
								</Box>
							</Box>
						) }

						<Button
							leftIcon={ <FaCalculator /> }
							colorScheme="blue"
							size="sm"
							onClick={ handleCalculate }
							isLoading={ isCalculating }
							loadingText="Calculando..."
							rounded="md"
							w="full"
						>
							Calcular
						</Button>
					</VStack>
				</Box>
			</SimpleGrid>

			{ result && (
				<Box bg={ cardBg } p={ 8 } borderRadius="xl" shadow="2xl" maxW="container.xl" mx="auto" mb={ 20 }>
					<VStack spacing={ 6 } align="stretch">
						<Heading size="sm" color="blue.300">Resultado do Cálculo</Heading>
						<Box bg="green.900" p={ 8 } borderRadius="xl" shadow="xl" border="1px" borderColor="green.500">
							<VStack spacing={ 4 } align="center">
								<Text fontSize="sm" fontWeight="bold" color="green.200" textTransform="uppercase">Preço Calculado</Text>
								<Heading size="2xl">
									{ new Intl.NumberFormat( 'pt-BR', { style: 'currency', currency: 'BRL' } ).format( result.vFinal ) }
								</Heading>
								<Badge colorScheme="green" fontSize="md" px={ 3 } py={ 1 } borderRadius="full">
									{ formData.tabela ? marginTables.find( t => t.profitMargin.toFixed( 2 ) === formData.tabela )?.name : 'Margem Padrão' }
								</Badge>
							</VStack>
						</Box>

						<Box>
							<Button
								leftIcon={ <FaSave /> }
								colorScheme="green"
								size="lg"
								w="full"
								onClick={ handleSave }
								isLoading={ isSaving }
							>
								Salvar
							</Button>
						</Box>
					</VStack>
				</Box>
			) }
			<Box ref={ pageBottomRef } h={ 5 } />
		</Box>
	)
}
