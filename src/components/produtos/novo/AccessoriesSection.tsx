import {
	Box,
	Button,
	Flex,
	HStack,
	Input,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Select,
	SimpleGrid,
	Spinner,
	Text,
	VStack,
	Wrap,
	WrapItem,
	useToast,
} from '@chakra-ui/react'
import { useCallback, useMemo, useState } from 'react'

import {
	ACCESSORY_MP_CATEGORIES,
	ACCESSORY_PART_OPTIONS,
	DEFAULT_ACCESSORY_PART,
	type AccessoryItem,
	type AccessoryMpOption,
	type AccessoryMpType,
	type AccessoryPart,
	ensureAccessoryLocalId,
	getAccessoryFieldRequirements,
	normalizeAccessoriesList,
} from '@/components/data/accessoryConfig'
import { AccessorySortableList } from '@/components/produtos/novo/AccessorySortableList'
import { FormFieldLabel } from '@/components/produtos/novo/FormFieldLabel'
import {
	produtoInputStyles,
	produtoSelectOptionProps,
	produtoSelectStyles,
} from '@/components/produtos/novo/produtoFormStyles'

const inputStyles = produtoInputStyles

const PART_BUTTON_ACTIVE_BG = '#BEE3F8'
const PART_BUTTON_ACTIVE_BORDER = '#63B3ED'
const PART_BUTTON_ACTIVE_TEXT = '#1A365D'
const PART_BUTTON_INACTIVE_BG = '#2C5282'
const PART_BUTTON_INACTIVE_TEXT = '#90CDF4'
const PART_BUTTON_INACTIVE_OPACITY = 0.45

type DraftState = {
	acessorioMp: string
	acessorioQtde: string
	acessorioComp: string
	acessorioLarg: string
	acessorioName: string
	acessorioPart: AccessoryPart
}

const EMPTY_DRAFT: DraftState = {
	acessorioMp: '',
	acessorioQtde: '',
	acessorioComp: '',
	acessorioLarg: '',
	acessorioName: '',
	acessorioPart: DEFAULT_ACCESSORY_PART,
}

type AccessoriesSectionProps = {
	items: AccessoryItem[]
	mpOptions: AccessoryMpOption[]
	isLoadingMps: boolean
	onChange: ( items: AccessoryItem[] ) => void
}

export function AccessoriesSection( {
	items,
	mpOptions,
	isLoadingMps,
	onChange,
}: AccessoriesSectionProps ) {
	const toast = useToast()
	const [ activeMpCategory, setActiveMpCategory ] =
		useState<AccessoryMpType | null>( null )
	const [ draft, setDraft ] = useState<DraftState>( EMPTY_DRAFT )

	const filteredMpOptions = useMemo( () => {
		if ( activeMpCategory === null ) {
			return []
		}
		return mpOptions.filter( ( o ) => o.acess === activeMpCategory )
	}, [ activeMpCategory, mpOptions ] )

	const activeCategoryMeta = useMemo(
		() =>
			ACCESSORY_MP_CATEGORIES.find( ( c ) => c.acess === activeMpCategory ) ??
			null,
		[ activeMpCategory ],
	)

	const selectedMp = useMemo(
		() => filteredMpOptions.find( ( o ) => o.index === draft.acessorioMp ),
		[ draft.acessorioMp, filteredMpOptions ],
	)

	const fieldReq = getAccessoryFieldRequirements(
		selectedMp?.acess ?? activeMpCategory ?? undefined,
	)

	const commitItems = useCallback(
		( next: AccessoryItem[] ) => {
			onChange( normalizeAccessoriesList( next ) )
		},
		[ onChange ],
	)

	const closeAddForm = useCallback( () => {
		setActiveMpCategory( null )
		setDraft( EMPTY_DRAFT )
	}, [] )

	const openAddForm = useCallback(
		( acess: AccessoryMpType ) => {
			if ( activeMpCategory === acess ) {
				closeAddForm()
				return
			}
			setActiveMpCategory( acess )
			setDraft( EMPTY_DRAFT )
		},
		[ activeMpCategory, closeAddForm ],
	)

	const updateDraft = useCallback( ( patch: Partial<DraftState> ) => {
		setDraft( ( prev ) => ( { ...prev, ...patch } ) )
	}, [] )

	const handleMpChange = ( mpIndex: string ) => {
		const mp = filteredMpOptions.find( ( o ) => o.index === mpIndex )
		const req = getAccessoryFieldRequirements( mp?.acess )
		setDraft( ( prev ) => ( {
			...prev,
			acessorioMp: mpIndex,
			acessorioComp: req.comp ? prev.acessorioComp : '',
			acessorioLarg: req.larg ? prev.acessorioLarg : '',
		} ) )
	}

	const handleAdd = () => {
		if ( !draft.acessorioMp || !draft.acessorioQtde.trim() ) {
			toast( {
				title: 'Preencha matéria-prima e quantidade',
				status: 'warning',
			} )
			return
		}

		if ( fieldReq.comp && !draft.acessorioComp.trim() ) {
			toast( {
				title: 'Informe o comprimento do acessório',
				status: 'warning',
			} )
			return
		}

		if ( fieldReq.larg && !draft.acessorioLarg.trim() ) {
			toast( {
				title: 'Informe a largura do acessório',
				status: 'warning',
			} )
			return
		}

		const item = ensureAccessoryLocalId( {
			acessorioMp: draft.acessorioMp,
			acessorioQtde: draft.acessorioQtde.trim(),
			acessorioPart: draft.acessorioPart,
		} )

		if ( fieldReq.comp ) {
			item.acessorioComp = draft.acessorioComp.trim()
		}
		if ( fieldReq.larg ) {
			item.acessorioLarg = draft.acessorioLarg.trim()
		}
		if ( draft.acessorioName.trim() ) {
			item.acessorioName = draft.acessorioName.trim()
		}

		commitItems( [ ...items, item ] )
		closeAddForm()
	}

	return (
		<VStack align="stretch" spacing={ 4 }>
			<AccessorySortableList
				items={ items }
				mpOptions={ mpOptions }
				onChange={ commitItems }
			/>

			<Wrap spacing={ 2 }>
				{ ACCESSORY_MP_CATEGORIES.map( ( category ) => (
					<WrapItem key={ category.acess }>
						<Button
							size="sm"
							variant="outline"
							color="gray.100"
							borderColor="gray.500"
							colorScheme={
								activeMpCategory === category.acess ? 'blue' : undefined
							}
							_hover={ {
								bg: 'gray.600',
								borderColor: 'gray.400',
								color: 'white',
							} }
							_active={ { bg: 'gray.600' } }
							onClick={ () => openAddForm( category.acess ) }
							isDisabled={ isLoadingMps }
						>
							{ category.addLabel }
						</Button>
					</WrapItem>
				) ) }
			</Wrap>

			<Modal
				isOpen={ activeMpCategory !== null }
				onClose={ closeAddForm }
				size="lg"
				isCentered
			>
				<ModalOverlay />
				<ModalContent bg="gray.700">
					<ModalHeader color="blue.300">
						{ activeCategoryMeta?.formTitle ?? 'Acessório' }
					</ModalHeader>
					<ModalCloseButton color="gray.300" />
					<ModalBody pb={ 2 }>
						{ isLoadingMps ? (
							<HStack>
								<Spinner size="sm" />
								<Text fontSize="sm">Carregando matérias-primas...</Text>
							</HStack>
						) : filteredMpOptions.length === 0 ? (
							<Text fontSize="sm" color="gray.400">
								Nenhuma matéria-prima disponível nesta categoria.
							</Text>
						) : (
							<SimpleGrid columns={{ base: 1, md: 2 }} spacing={ 3 }>
								<Box gridColumn={{ md: '1 / -1' } }>
									<FormFieldLabel>Matéria-prima</FormFieldLabel>
									<Select
										placeholder="Selecione..."
										value={ draft.acessorioMp }
										onChange={ ( e ) => handleMpChange( e.target.value ) }
										{ ...produtoSelectStyles }
									>
										<option value="" { ...produtoSelectOptionProps }>
											Selecione...
										</option>
										{ filteredMpOptions.map( ( mp ) => (
											<option
												key={ mp.index }
												value={ mp.index }
												{ ...produtoSelectOptionProps }
											>
												{ mp.label }
											</option>
										) ) }
									</Select>
								</Box>

								<Box>
									<FormFieldLabel>Quantidade</FormFieldLabel>
									<Input
										type="number"
										min={ 1 }
										step={ 1 }
										placeholder="Peças"
										value={ draft.acessorioQtde }
										onChange={ ( e ) =>
											updateDraft( { acessorioQtde: e.target.value } )
										}
										{ ...inputStyles }
									/>
								</Box>

								{ fieldReq.comp && (
									<Box>
										<FormFieldLabel>Comprimento (cm)</FormFieldLabel>
										<Input
											type="number"
											min={ 0 }
											step="any"
											placeholder="Comprimento"
											value={ draft.acessorioComp }
											onChange={ ( e ) =>
												updateDraft( { acessorioComp: e.target.value } )
											}
											{ ...inputStyles }
										/>
									</Box>
								) }

								{ fieldReq.larg && (
									<Box>
										<FormFieldLabel>Largura (cm)</FormFieldLabel>
										<Input
											type="number"
											min={ 0 }
											step="any"
											placeholder="Largura"
											value={ draft.acessorioLarg }
											onChange={ ( e ) =>
												updateDraft( { acessorioLarg: e.target.value } )
											}
											{ ...inputStyles }
										/>
									</Box>
								) }

								<Box>
									<FormFieldLabel optional>Nome do acessório</FormFieldLabel>
									<Input
										placeholder="Ex.: Reforço lateral extra"
										value={ draft.acessorioName }
										onChange={ ( e ) =>
											updateDraft( { acessorioName: e.target.value } )
										}
										{ ...inputStyles }
									/>
								</Box>

								<Box gridColumn={{ md: '1 / -1' } }>
									<FormFieldLabel>Parte da embalagem</FormFieldLabel>
									<Wrap spacing={ 2 } mt={ 1 }>
										{ ACCESSORY_PART_OPTIONS.map( ( opt ) => {
											const isActive =
												draft.acessorioPart === opt.value
											return (
												<WrapItem key={ opt.value }>
													<Button
														size="sm"
														variant="unstyled"
														px={ 3 }
														py={ 1 }
														rounded="md"
														fontSize="xs"
														fontWeight={
															isActive ? 'semibold' : 'normal'
														}
														bg={
															isActive
																? PART_BUTTON_ACTIVE_BG
																: PART_BUTTON_INACTIVE_BG
														}
														color={
															isActive
																? PART_BUTTON_ACTIVE_TEXT
																: PART_BUTTON_INACTIVE_TEXT
														}
														opacity={
															isActive
																? 1
																: PART_BUTTON_INACTIVE_OPACITY
														}
														borderWidth="1px"
														borderColor={
															isActive
																? PART_BUTTON_ACTIVE_BORDER
																: 'transparent'
														}
														_hover={ { opacity: 1 } }
														onClick={ () =>
															updateDraft( {
																acessorioPart: opt.value,
															} )
														}
													>
														{ opt.label }
													</Button>
												</WrapItem>
											)
										} ) }
									</Wrap>
								</Box>
							</SimpleGrid>
						) }
					</ModalBody>
					<ModalFooter gap={ 2 }>
						<Button
							variant="ghost"
							size="sm"
							color="gray.100"
							_hover={ { bg: 'whiteAlpha.200', color: 'white' } }
							onClick={ closeAddForm }
						>
							Cancelar
						</Button>
						<Button
							size="sm"
							colorScheme="green"
							onClick={ handleAdd }
							isDisabled={ filteredMpOptions.length === 0 }
						>
							Adicionar à lista
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</VStack>
	)
}
