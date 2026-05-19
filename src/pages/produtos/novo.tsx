import {
	Box,
	Button,
	Checkbox,
	Flex,
	Heading,
	HStack,
	Input,
	Select,
	SimpleGrid,
	Text,
	Textarea,
	VStack,
	useToast,
	IconButton,
	Badge,
	Spinner,
	Divider,
	useColorModeValue,
} from '@chakra-ui/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { FaArrowLeft, FaCalculator, FaSave } from 'react-icons/fa'
import axios from 'axios'

import { modCaix } from '@/components/data/modCaix'
import { marginTables } from '@/components/data/marginTables'
import {
	FOOT_CONFIG_OPTIONS,
	ADV_CHECKBOX_LABELS,
	ADV_QUANTITY_LABELS,
	buildLegacyAdvFormOverrides,
	buildNovoProdutoCalcParams,
	createDefaultAdvCheckboxes,
	createDefaultAdvQuantities,
	getVisibleAdvCheckboxes,
	getVisibleAdvQuantities,
	isCalcInvalidatingAdvKey,
	clearVisibleAdvQuantities,
	mapCalcInfoToAdvQuantities,
	mapLegacyProductToForm,
	mergeCalcQuantityInfo,
	mergeFormAdvIntoCalcCaixa,
	modelHasAdvKey,
	modelSupportsAssembly,
	type AdvCheckboxKey,
	type AdvQuantityKey,
	type NovoProdutoFormState,
} from '@/components/data/produtoAdvConfigs'
import { FormFieldLabel } from '@/components/produtos/novo/FormFieldLabel'
import { ProductFormCard } from '@/components/produtos/novo/ProductFormCard'
import type { ProdutoCalcInfo, ProdutoSavePayload } from '@/types/produtoCalc'
import {
	normalizeProdutoCalcResponse,
	parseLegacySaveResponse,
	prepareLegacySavePayload,
	toStrapiSyncProduto,
} from '@/utils/produtoCalcResponse'
import { ASSEMBLY_OPTIONS } from '@/lib/calculadora-de-embalagem/utils/formOptions'

const formatCNPJ = ( cnpj: string | undefined | null ) => {
	if ( !cnpj ) return ''
	const cleaned = cnpj.replace( /\D/g, '' )
	return cleaned.replace( /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5' )
}

const MAX_COMPANY_NAME_LENGTH = 15

const formatCompanyDisplayName = ( name: string | undefined | null ): string => {
	if ( !name ) return ''
	const upper = name.toUpperCase()
	return upper.length > MAX_COMPANY_NAME_LENGTH
		? `${ upper.slice( 0, MAX_COMPANY_NAME_LENGTH ) }...`
		: upper
}

const inputStyles = {
	bg: 'gray.800',
	border: 'none',
	size: 'sm' as const,
	rounded: 'md',
}

function createInitialFormState( empresa: string ): NovoProdutoFormState {
	return {
		nomeProd: '',
		modelo: '',
		comprimento: '',
		largura: '',
		altura: '',
		codigo: '',
		pesoProd: '',
		tabela: '',
		empresa,
		pe: '2',
		assembly: 'disassembled',
		obsCaixa: '',
		advCheckboxes: createDefaultAdvCheckboxes(),
		advQuantities: createDefaultAdvQuantities(),
	}
}

export default function NovoProduto() {
	const router = useRouter()
	const { cnpj, prodId, edit } = router.query
	const { data: session, status } = useSession()
	const toast = useToast()

	const isEditMode = edit === '1'
	const replaceProdId = useMemo( () => {
		if ( !isEditMode || !prodId ) {
			return null
		}
		const raw = Array.isArray( prodId ) ? prodId[ 0 ] : prodId
		const parsed = Number( raw )
		return Number.isFinite( parsed ) && parsed > 0 ? parsed : null
	}, [ isEditMode, prodId ] )

	const empresaQuery =
		typeof cnpj === 'string' ? cnpj : Array.isArray( cnpj ) ? cnpj[ 0 ] : ''

	const [ isLoading, setIsLoading ] = useState( false )
	const [ isCalculating, setIsCalculating ] = useState( false )
	const [ isSaving, setIsSaving ] = useState( false )
	const [ companyData, setCompanyData ] = useState<{
		id: number
		attributes: { nome: string; CNPJ: string; tablecalc?: number }
	} | null>( null )

	const [ formData, setFormData ] = useState<NovoProdutoFormState>( () =>
		createInitialFormState( empresaQuery ),
	)

	const [ result, setResult ] = useState<ProdutoCalcInfo | null>( null )
	const [ savePayload, setSavePayload ] = useState<ProdutoSavePayload | null>( null )
	const [ replaceLoaded, setReplaceLoaded ] = useState<number | null>( null )
	const pageBottomRef = useRef<HTMLDivElement>( null )

	const cardBg = useColorModeValue( 'gray.700', 'gray.700' )
	const bgColor = useColorModeValue( 'gray.800', 'gray.800' )

	const visibleCheckboxes = useMemo(
		() => getVisibleAdvCheckboxes( formData.modelo ),
		[ formData.modelo ],
	)
	const visibleQuantities = useMemo(
		() => getVisibleAdvQuantities( formData.modelo ),
		[ formData.modelo ],
	)
	const isAdmin = session?.user?.pemission === 'Adm'
	const showFootConfig = modelHasAdvKey( formData.modelo, 'configPe' )
	const showAssemblySelect = modelSupportsAssembly( formData.modelo )
	const showAltura = formData.modelo !== 'palete_sob_medida'
	const showTabelaSelect = isAdmin

	const invalidateCalc = useCallback( () => {
		setResult( null )
		setSavePayload( null )
		setFormData( ( prev ) => ( {
			...prev,
			advQuantities: clearVisibleAdvQuantities( prev.modelo, prev.advQuantities ),
		} ) )
	}, [] )

	useEffect( () => {
		if ( empresaQuery ) {
			setFormData( ( prev ) => ( { ...prev, empresa: empresaQuery } ) )
		}
	}, [ empresaQuery ] )

	useEffect( () => {
		if ( result && pageBottomRef.current ) {
			setTimeout( () => {
				pageBottomRef.current?.scrollIntoView( { behavior: 'smooth', block: 'end' } )
			}, 200 )
		}
	}, [ result ] )

	useEffect( () => {
		if ( cnpj && session?.user?.email && router.isReady ) {
			setIsLoading( true )

			axios
				.get( `/api/refactory/companies?searchString=${ cnpj }` )
				.then( ( res ) => {
					const company = res.data.data?.[ 0 ]
					if ( company ) {
						setCompanyData( company )
						const tablecalc = parseFloat( company.attributes.tablecalc )
						if ( !isNaN( tablecalc ) ) {
							setFormData( ( prev ) => ( {
								...prev,
								tabela: tablecalc.toFixed( 2 ),
							} ) )
						}
					}
				} )
				.catch( () => {
					/* company banner optional */
				} )

			if ( isEditMode && prodId ) {
				axios
					.get( `/api/rbx/${ session.user.email }/produtos?prodId=${ prodId }` )
					.then( ( res ) => {
						const p = res.data as Record<string, unknown>
						const loadedId = Number( p.loaded )
						if ( Number.isFinite( loadedId ) && loadedId > 0 ) {
							setReplaceLoaded( loadedId )
						}

						setFormData( ( prev ) => {
							const mapped = mapLegacyProductToForm( p, prev )
							const quantityInfo = mergeCalcQuantityInfo( p, undefined )
							return {
								...prev,
								...mapped,
								advQuantities: mapCalcInfoToAdvQuantities(
									quantityInfo,
									String( mapped.modelo ?? prev.modelo ),
									prev.advQuantities,
								),
							}
						} )

						try {
							const { info, savePayload: payload } = normalizeProdutoCalcResponse( p )
							setResult( info as ProdutoCalcInfo )
							setSavePayload( payload )
						} catch {
							/* user must recalculate if calc fields are incomplete */
						}
					} )
					.catch( () => {
						toast( { title: 'Erro ao carregar produto', status: 'error' } )
					} )
					.finally( () => setIsLoading( false ) )
			} else {
				setIsLoading( false )
			}
		}
	}, [ isEditMode, prodId, cnpj, session, router.isReady, toast ] )

	const patchForm = useCallback(
		( patch: Partial<NovoProdutoFormState>, fieldName?: string ) => {
			if ( fieldName && result && isCalcInvalidatingAdvKey( fieldName ) ) {
				invalidateCalc()
			}
			setFormData( ( prev ) => ( { ...prev, ...patch } ) )
		},
		[ result, invalidateCalc ],
	)

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target
		patchForm( { [ name ]: value } as Partial<NovoProdutoFormState>, name )
	}

	const handleCheckboxChange = ( key: AdvCheckboxKey, checked: boolean ) => {
		patchForm(
			{
				advCheckboxes: { ...formData.advCheckboxes, [ key ]: checked },
			},
			key,
		)
	}

	const handleQuantityChange = ( key: AdvQuantityKey, value: string ) => {
		patchForm(
			{
				advQuantities: { ...formData.advQuantities, [ key ]: value },
			},
			key,
		)
	}

	const handleCalculate = async () => {
		if ( !formData.modelo || !formData.comprimento || !formData.largura ) {
			toast( {
				title: 'Preencha os campos obrigatórios',
				description: 'Modelo e dimensões são necessários.',
				status: 'warning',
			} )
			return
		}
		if ( showAltura && !formData.altura ) {
			toast( {
				title: 'Preencha os campos obrigatórios',
				description: 'Altura é necessária para este modelo.',
				status: 'warning',
			} )
			return
		}

		setIsCalculating( true )
		try {
			const params = buildNovoProdutoCalcParams( formData )
			const response = await axios.get(
				`/api/rbx/${ session?.user?.email }/produtos?${ params.toString() }`,
			)

			const { info, savePayload: payload } = normalizeProdutoCalcResponse(
				response.data,
			)
			const quantityInfo = mergeCalcQuantityInfo( info, payload )

			setSavePayload( payload )
			setResult( info as ProdutoCalcInfo )
			setFormData( ( prev ) => ( {
				...prev,
				advQuantities: mapCalcInfoToAdvQuantities(
					quantityInfo,
					prev.modelo,
					prev.advQuantities,
				),
			} ) )
			toast( { title: 'Cálculo realizado', status: 'success', duration: 2000 } )
		} catch ( error: unknown ) {
			const message =
				error instanceof Error ? error.message : 'Erro no cálculo'
			toast( { title: 'Erro no cálculo', description: message, status: 'error' } )
		} finally {
			setIsCalculating( false )
		}
	}

	const handleSave = async () => {
		if ( !result || !savePayload ) {
			toast( { title: 'Calcule antes de salvar', status: 'warning' } )
			return
		}

		if ( !session?.user?.email ) {
			toast( { title: 'Usuário não autenticado', status: 'error' } )
			return
		}

		setIsSaving( true )
		try {
			const cnpjStr = Array.isArray( cnpj ) ? cnpj[ 0 ] : cnpj

			let company = companyData
			if ( !company && cnpjStr ) {
				const compRes = await axios.get(
					`/api/refactory/companies?searchString=${ cnpjStr }`,
				)
				company = compRes.data.data?.[ 0 ]
			}

			if ( !company ) {
				throw new Error( 'Empresa não encontrada no sistema comercial' )
			}

			const now = new Date()
			const formattedDate = now.toLocaleDateString( 'pt-BR', {
				day: '2-digit',
				month: '2-digit',
				year: '2-digit',
			} )
			const formattedTime = now.toLocaleTimeString( 'pt-BR', {
				hour: '2-digit',
				minute: '2-digit',
			} )
			const lastChange = `${ formattedDate } - ${ formattedTime }`

			const wpSaveData = prepareLegacySavePayload( savePayload, {
				nomeProd: formData.nomeProd,
				codigo: formData.codigo,
				modelo: formData.modelo,
				comprimento: formData.comprimento,
				largura: formData.largura,
				altura: formData.altura,
				tabela: formData.tabela,
				empresa: cnpjStr,
				lastUser: session?.user?.name || 'Sistema',
				lastChange: lastChange,
				ativo: '1',
				...( modelSupportsAssembly( formData.modelo )
					? { assembly: formData.assembly }
					: {} ),
				...buildLegacyAdvFormOverrides( formData ),
				_calcCaixa: mergeFormAdvIntoCalcCaixa( savePayload._calcCaixa, formData ),
			} )

			const wpRes = await axios.post( `/api/rbx/${ session.user.email }/produtos`, {
				salvar: true,
				dados: wpSaveData,
				...( replaceProdId ? { replaceProdId } : {} ),
			} )

			const newIndice = parseLegacySaveResponse( wpRes.data )

			const syncRes = await axios.post( `/api/db/produtos/sync`, {
				empresaId: company.id,
				produtos: [ toStrapiSyncProduto( wpSaveData, newIndice ) ],
			} )

			if ( syncRes.data.failed > 0 ) {
				throw new Error(
					'Produto salvo no legado, mas houve uma falha na sincronização.',
				)
			}

			toast( {
				title: isEditMode
					? 'Nova versão do produto salva com sucesso'
					: 'Produto salvo com sucesso',
				status: 'success',
				duration: 5000,
			} )
			router.push( `/produtos?empresaId=${ company.id }` )
		} catch ( error: unknown ) {
			const err = error as { response?: { data?: { error?: string } }; message?: string }
			toast( {
				title: 'Erro ao salvar',
				description: err.response?.data?.error || err.message || 'Erro desconhecido',
				status: 'error',
				duration: 7000,
			} )
		} finally {
			setIsSaving( false )
		}
	}

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
					<Heading size="lg">
						{ isEditMode ? 'Editar Produto' : 'Novo Produto' }
					</Heading>
				</HStack>
				{ companyData && (
					<Box
						bg={ cardBg }
						px={ 4 }
						py={ 3 }
						borderRadius="md"
						shadow="md"
						alignSelf={{ base: 'stretch', md: 'flex-end' } }
					>
						<Text fontWeight="bold" fontSize="lg" color="white">
							{ formatCompanyDisplayName( companyData.attributes.nome ) }
						</Text>
						<Text fontSize="xs" color="gray.400">
							{ formatCNPJ( companyData.attributes.CNPJ ) }
						</Text>
					</Box>
				) }
			</Flex>

			<VStack spacing={ 6 } maxW="container.xl" mx="auto" align="stretch">
				<SimpleGrid columns={{ base: 1, lg: 2 }} spacing={ 6 } alignItems="stretch">
					<ProductFormCard title="Dimensões e características">
						<VStack spacing={ 4 } align="stretch">
							<SimpleGrid columns={{ base: 1, sm: 3 }} spacing={ 4 }>
								<Box>
									<FormFieldLabel>Comprimento (cm)</FormFieldLabel>
									<Input
										name="comprimento"
										type="number"
										value={ formData.comprimento }
										onChange={ handleInputChange }
										{ ...inputStyles }
									/>
								</Box>
								<Box>
									<FormFieldLabel>Largura (cm)</FormFieldLabel>
									<Input
										name="largura"
										type="number"
										value={ formData.largura }
										onChange={ handleInputChange }
										{ ...inputStyles }
									/>
								</Box>
								{ showAltura && (
									<Box>
										<FormFieldLabel>Altura (cm)</FormFieldLabel>
										<Input
											name="altura"
											type="number"
											value={ formData.altura }
											onChange={ handleInputChange }
											{ ...inputStyles }
										/>
									</Box>
								) }
							</SimpleGrid>

							<Divider borderColor="gray.600" />

							<Box>
								<FormFieldLabel>Modelo da embalagem</FormFieldLabel>
								<Select
									name="modelo"
									value={ formData.modelo }
									onChange={ handleInputChange }
									placeholder="Selecione o modelo"
									{ ...inputStyles }
								>
									{ modCaix.map( ( m ) => (
										<option
											key={ m.id }
											value={ m.id }
											style={ { background: '#1A202C' } }
										>
											{ m.title }
										</option>
									) ) }
								</Select>
							</Box>

							<Divider borderColor="gray.600" />

							<Box>
								<FormFieldLabel optional>Nome do produto</FormFieldLabel>
								<Input
									name="nomeProd"
									value={ formData.nomeProd }
									onChange={ handleInputChange }
									placeholder="Nome da embalagem"
									{ ...inputStyles }
								/>
							</Box>
							<SimpleGrid columns={ 2 } spacing={ 4 }>
								<Box>
									<FormFieldLabel optional>Cód. produto</FormFieldLabel>
									<Input
										name="codigo"
										value={ formData.codigo }
										onChange={ handleInputChange }
										placeholder="Cód. da embalagem"
										{ ...inputStyles }
									/>
								</Box>
								<Box>
									<FormFieldLabel optional>Peso produto</FormFieldLabel>
									<Input
										name="pesoProd"
										type="number"
										value={ formData.pesoProd }
										onChange={ handleInputChange }
										placeholder="Peso a embalar"
										{ ...inputStyles }
									/>
								</Box>
							</SimpleGrid>
						</VStack>
					</ProductFormCard>

					<ProductFormCard title="Configurações">
						<VStack spacing={ 4 } align="stretch">
							{ showTabelaSelect && (
								<Box>
									<FormFieldLabel>Tabela de margem</FormFieldLabel>
									<Select
										name="tabela"
										value={ formData.tabela }
										onChange={ handleInputChange }
										{ ...inputStyles }
									>
										<option value="" style={ { background: '#1A202C' } }>
											Selecione a tabela
										</option>
										{ marginTables.map( ( t ) => (
											<option
												key={ t.id }
												value={ t.profitMargin.toFixed( 2 ) }
												style={ { background: '#1A202C' } }
											>
												{ t.name } ({ ( t.profitMargin * 100 ).toFixed( 0 ) }%)
											</option>
										) ) }
									</Select>
								</Box>
							) }

							{ showAssemblySelect && (
								<>
									{ showTabelaSelect && <Divider borderColor="gray.600" /> }
									<Box>
										<FormFieldLabel>Montagem e aberturas</FormFieldLabel>
										<Select
											name="assembly"
											value={ formData.assembly }
											onChange={ handleInputChange }
											{ ...inputStyles }
										>
											{ ASSEMBLY_OPTIONS.map( ( opt ) => (
												<option
													key={ opt.value }
													value={ opt.value }
													style={ { background: '#1A202C' } }
												>
													{ opt.label }
												</option>
											) ) }
										</Select>
									</Box>
								</>
							) }

							{ showFootConfig && (
								<>
									{ ( showTabelaSelect || showAssemblySelect ) && (
										<Divider borderColor="gray.600" />
									) }
									<Box>
										<FormFieldLabel>Configuração dos pés</FormFieldLabel>
										<Select
											name="pe"
											value={ formData.pe }
											onChange={ handleInputChange }
											{ ...inputStyles }
										>
											{ FOOT_CONFIG_OPTIONS.map( ( opt ) => (
												<option
													key={ opt.value }
													value={ opt.value }
													style={ { background: '#1A202C' } }
												>
													{ opt.label }
												</option>
											) ) }
										</Select>
									</Box>
								</>
							) }
						</VStack>
					</ProductFormCard>
				</SimpleGrid>

				{ formData.modelo && (
					<SimpleGrid columns={{ base: 1, lg: 2 }} spacing={ 6 } alignItems="stretch">
						{ visibleCheckboxes.length > 0 && (
							<ProductFormCard
								title="Componentes da embalagem"
								gridColumn={
									visibleQuantities.length === 0 ? { lg: 'span 2' } : undefined
								}
							>
								<SimpleGrid columns={{ base: 1, md: 2 }} spacing={ 3 }>
									{ visibleCheckboxes.map( ( key ) => (
										<Checkbox
											key={ key }
											isChecked={ formData.advCheckboxes[ key ] }
											onChange={ ( e ) =>
												handleCheckboxChange( key, e.target.checked )
											}
											colorScheme="blue"
											size="sm"
										>
											<Text fontSize="sm">{ ADV_CHECKBOX_LABELS[ key ] }</Text>
										</Checkbox>
									) ) }
								</SimpleGrid>
							</ProductFormCard>
						) }

						{ visibleQuantities.length > 0 && (
							<ProductFormCard
								title="Quantidades de peças"
								gridColumn={{ lg: visibleCheckboxes.length > 0 ? undefined : 'span 2' }}
							>
								<VStack spacing={ 3 } align="stretch">
									{ visibleQuantities.map( ( key ) => (
										<HStack key={ key } spacing={ 3 } align="center">
											<Input
												type="number"
												min={ 0 }
												step={ 1 }
												w="72px"
												flexShrink={ 0 }
												value={ formData.advQuantities[ key ] }
												onChange={ ( e ) =>
													handleQuantityChange( key, e.target.value )
												}
												placeholder="—"
												{ ...inputStyles }
											/>
											<Text fontSize="sm" flex={ 1 }>
												{ ADV_QUANTITY_LABELS[ key ] }
											</Text>
										</HStack>
									) ) }
								</VStack>
							</ProductFormCard>
						) }

						<ProductFormCard
							title="Observações"
							gridColumn={{ lg: '1 / -1' }}
						>
							<FormFieldLabel optional mb={ 2 }>
								Observações
							</FormFieldLabel>
							<Textarea
								name="obsCaixa"
								value={ formData.obsCaixa }
								onChange={ handleInputChange }
								placeholder="Observações sobre a embalagem..."
								rows={ 3 }
								bg="gray.800"
								border="none"
								rounded="md"
								resize="vertical"
							/>
						</ProductFormCard>
					</SimpleGrid>
				) }

				<Button
					leftIcon={ <FaCalculator /> }
					colorScheme="blue"
					size="md"
					onClick={ handleCalculate }
					isLoading={ isCalculating }
					loadingText="Calculando..."
					isDisabled={ !formData.modelo }
					w={{ base: 'full', md: 'auto' } }
					alignSelf="flex-start"
				>
					Calcular
				</Button>

				{ result && (
					<ProductFormCard title="Resultado do Cálculo" mb={ 8 }>
						<VStack spacing={ 6 } align="stretch">
							<Box
								bg="green.900"
								p={ 8 }
								borderRadius="xl"
								border="1px"
								borderColor="green.500"
							>
								<VStack spacing={ 4 } align="center">
									<Text
										fontSize="sm"
										fontWeight="bold"
										color="green.200"
										textTransform="uppercase"
									>
										Preço Calculado
									</Text>
									<Heading size="2xl">
										{ new Intl.NumberFormat( 'pt-BR', {
											style: 'currency',
											currency: 'BRL',
										} ).format( Number( result.vFinal ) ) }
									</Heading>
									<Badge colorScheme="green" fontSize="md" px={ 3 } py={ 1 } borderRadius="full">
										{ formData.tabela
											? marginTables.find(
												( t ) => t.profitMargin.toFixed( 2 ) === formData.tabela,
											)?.name
											: 'Margem Padrão' }
									</Badge>
								</VStack>
							</Box>
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
						</VStack>
					</ProductFormCard>
				) }
			</VStack>

			<Box ref={ pageBottomRef } h={ 5 } />
		</Box>
	)
}
