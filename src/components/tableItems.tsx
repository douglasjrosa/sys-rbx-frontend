import {
	Badge,
	Box,
	Button,
	Checkbox,
	Icon,
	Input,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	VStack,
	HStack,
} from '@chakra-ui/react'
import {
	DndContext,
	PointerSensor,
	closestCenter,
	useSensor,
	useSensors,
	type DragEndEvent,
} from '@dnd-kit/core'
import {
	SortableContext,
	arrayMove,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import React, {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useMemo,
} from 'react'
import { BsX } from 'react-icons/bs'
import { FaClone, FaGripVertical } from 'react-icons/fa'
import { formatCurrency, parseCurrency } from '@/utils/customNumberFormats'
import { buildProductDisplayName } from '@/utils/productDisplayName'
import { getTableBadgeColor, getTableNameInPortuguese } from '@/utils/tableUtils'

interface TableItemsProps {
	itemsList: any[]
	setItemsListOnChange: Dispatch<SetStateAction<any[]>>
	companyTablecalc?: string | number
}

let proposalItemIdCounter = 0

function createProposalItemLocalId(): string {
	proposalItemIdCounter += 1
	return `prop-item-${ Date.now() }-${ proposalItemIdCounter }`
}

function ensureProposalItemLocalId( item: any ): any {
	if ( item._localId ) {
		return item
	}
	return { ...item, _localId: createProposalItemLocalId() }
}

type SortableRowProps = {
	item: any
	index: number
	companyTablecalc?: string | number
	onItemChange: ( args: {
		index: number
		qtde?: number
		mont?: boolean
		expo?: boolean
		deleteItem?: boolean
	} ) => void
	onClone: ( index: number ) => void
	onQtyDraft: ( index: number, raw: string ) => void
	getInternalMeasurements: ( item: any ) => string | null
	minQtd: number
}

function SortableProposalRow( {
	item,
	index,
	companyTablecalc,
	onItemChange,
	onClone,
	onQtyDraft,
	getInternalMeasurements,
	minQtd,
}: SortableRowProps ) {
	const localId = String( item._localId ?? `fallback-${ index }` )
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable( { id: localId } )

	const style = {
		transform: CSS.Translate.toString( transform ),
		transition,
		opacity: isDragging ? 0.5 : 1,
	}

	const internalMeasurements = getInternalMeasurements( item )

	return (
		<Tr ref={ setNodeRef } style={ style } bg={ isDragging ? 'whiteAlpha.100' : undefined }>
			<Td textAlign="center" fontSize="xs" verticalAlign="middle" py={ 5 }>
				<Box
					ref={ setActivatorNodeRef }
					{ ...attributes }
					{ ...listeners }
					display="inline-flex"
					alignItems="center"
					justifyContent="center"
					w="24px"
					h="24px"
					color="gray.400"
					cursor="grab"
					_active={ { cursor: 'grabbing' } }
					_hover={ { color: 'gray.200' } }
					aria-label="Reordenar item"
					title="Arrastar para reordenar"
				>
					<Icon as={ FaGripVertical } boxSize={ 3 } />
				</Box>
			</Td>
			<Td
				px={ 3 }
				py={ 5 }
				fontSize="xs"
				whiteSpace="normal"
				wordBreak="break-word"
				minW="20rem"
			>
				<VStack align="start" spacing={ 2 }>
					<Box fontWeight="bold" fontSize="sm">
						{ buildProductDisplayName( item ) }
					</Box>
					{ ( internalMeasurements || item.codigo ) && (
						<Box display="flex" flexWrap="wrap" gap={ 2 }>
							{ internalMeasurements && (
								<Badge bg="yellow.400" color="black" fontSize="2xs" px={ 1.5 } py={ 0.5 }>
									{ internalMeasurements }
								</Badge>
							) }
							{ item.codigo && (
								<HStack spacing={ 2 }>
									<Badge colorScheme="gray" fontSize="2xs" px={ 1.5 } py={ 0.5 }>
										{ item.codigo }
									</Badge>
									{ ( companyTablecalc || item.tabela ) !== undefined && (
										<Badge
											fontSize="2xs"
											px={ 1.5 }
											py={ 0.5 }
											colorScheme={
												getTableBadgeColor(
													getTableNameInPortuguese(
														companyTablecalc || item.tabela,
													),
												)
											}
											color={
												getTableBadgeColor(
													getTableNameInPortuguese(
														companyTablecalc || item.tabela,
													),
												) === 'yellow'
													? 'black'
													: undefined
											}
											variant="solid"
										>
											{ getTableNameInPortuguese(
												companyTablecalc || item.tabela,
											) }
										</Badge>
									) }
								</HStack>
							) }
						</Box>
					) }
				</VStack>
			</Td>
			<Td
				textAlign="center"
				fontSize="xs"
				verticalAlign="middle"
				position="relative"
				pb={ 10 }
				py={ 5 }
			>
				{ formatCurrency( item.vFinal ) }
				<HStack
					position="absolute"
					bottom={ 1 }
					left={ 0 }
					right={ 0 }
					justifyContent="center"
					spacing={ 2 }
				>
					<Checkbox
						borderColor="whatsapp.600"
						rounded="md"
						size="sm"
						onChange={ ( e ) => {
							onItemChange( {
								index,
								mont: e.target.checked,
							} )
						} }
						isChecked={ item.mont }
					>
						<Box
							as="span"
							fontSize="2xs"
							onClick={ ( e: React.MouseEvent ) => {
								e.preventDefault()
								e.stopPropagation()
								onItemChange( {
									index,
									mont: !item.mont,
								} )
							} }
							cursor="pointer"
							userSelect="none"
						>
							Mont.
						</Box>
					</Checkbox>
					<Checkbox
						borderColor="whatsapp.600"
						rounded="md"
						size="sm"
						onChange={ ( e ) => {
							onItemChange( {
								index,
								expo: e.target.checked,
							} )
						} }
						isChecked={ item.expo }
					>
						<Box
							as="span"
							fontSize="2xs"
							onClick={ ( e: React.MouseEvent ) => {
								e.preventDefault()
								e.stopPropagation()
								onItemChange( {
									index,
									expo: !item.expo,
								} )
							} }
							cursor="pointer"
							userSelect="none"
						>
							Expo.
						</Box>
					</Checkbox>
				</HStack>
			</Td>
			<Td textAlign="center" fontSize="xs" verticalAlign="middle" py={ 5 }>
				{ ( () => {
					const unitPrice = parseCurrency( item.vFinal )
					let servicesValue = 0
					if ( item.mont ) servicesValue += unitPrice * 0.1
					if ( item.expo ) servicesValue += unitPrice * 0.1
					return formatCurrency( servicesValue )
				} )() }
			</Td>
			<Td textAlign="center" verticalAlign="middle" py={ 5 }>
				<Input
					type="number"
					min={ minQtd }
					value={ item.Qtd }
					onChange={ ( e ) => {
						const raw = e.target.value
						if ( raw === '' ) {
							onQtyDraft( index, '' )
							return
						}
						onItemChange( {
							index,
							qtde: Number( raw ),
						} )
					} }
					onBlur={ () => {
						const current = item.Qtd
						if ( current === '' || isNaN( Number( current ) ) ) {
							onItemChange( {
								index,
								qtde: 1,
							} )
						}
					} }
					textAlign="center"
					fontSize="xs"
					size="xs"
					w={ 14 }
					rounded="md"
				/>
			</Td>
			<Td textAlign="center" fontSize="xs" verticalAlign="middle" py={ 5 }>
				{ formatCurrency( item.total ) }
			</Td>
			<Td textAlign="center" fontSize="xs" verticalAlign="middle" py={ 5 }>
				<Button
					bg="transparent"
					color="blue.300"
					border="1px solid"
					borderColor="blue.300"
					rounded="md"
					width="24px"
					height="24px"
					minW="24px"
					p={ 0 }
					_hover={ {
						bg: 'blue.400',
						color: 'white',
					} }
					_active={ {
						bg: 'blue.500',
						color: 'white',
					} }
					_focus={ { boxShadow: 'none' } }
					onClick={ () => onClone( index ) }
					title="Duplicar item"
					aria-label="Duplicar item"
				>
					<Icon as={ FaClone } boxSize={ 3 } />
				</Button>
			</Td>
			<Td textAlign="center" fontSize="xs" verticalAlign="middle" py={ 5 }>
				<Button
					bg="transparent"
					color="red.500"
					border="1px solid"
					borderColor="red.500"
					rounded="md"
					width="24px"
					height="24px"
					minW="24px"
					p={ 0 }
					_hover={ {
						bg: 'red.500',
						color: 'white',
					} }
					_active={ {
						bg: 'red.600',
						color: 'white',
					} }
					_focus={ { boxShadow: 'none' } }
					onClick={ () => onItemChange( { index, deleteItem: true } ) }
					title="Excluir item"
					aria-label="Excluir item"
				>
					<Icon as={ BsX } boxSize={ 4 } />
				</Button>
			</Td>
		</Tr>
	)
}

const TableItems: React.FC<TableItemsProps> = ( {
	itemsList,
	setItemsListOnChange,
	companyTablecalc,
} ) => {
	const MIN_QTD = 0
	useEffect( () => {
		const normalized = itemsList.map( ensureProposalItemLocalId )
		const changed = normalized.some( ( item, index ) => item !== itemsList[ index ] )
		if ( changed ) {
			setItemsListOnChange( normalized )
		}
	}, [ itemsList, setItemsListOnChange ] )

	const sortableItems = useMemo(
		() => itemsList.map( ( item, index ) => String( item._localId ?? `fallback-${ index }` ) ),
		[ itemsList ],
	)

	const sensors = useSensors(
		useSensor( PointerSensor, {
			activationConstraint: { distance: 6 },
		} ),
	)

	const handleDragEnd = useCallback(
		( event: DragEndEvent ) => {
			const { active, over } = event
			if ( !over || active.id === over.id ) {
				return
			}

			const oldIndex = itemsList.findIndex(
				( item ) => String( item._localId ) === String( active.id ),
			)
			const newIndex = itemsList.findIndex(
				( item ) => String( item._localId ) === String( over.id ),
			)

			if ( oldIndex < 0 || newIndex < 0 ) {
				return
			}

			setItemsListOnChange( arrayMove( itemsList, oldIndex, newIndex ) )
		},
		[ itemsList, setItemsListOnChange ],
	)

	const handleCloneItem = useCallback(
		( index: number ) => {
			const item = itemsList[ index ]
			if ( !item ) return
			const cloned = ensureProposalItemLocalId( {
				...item,
				mont: false,
				expo: false,
			} )
			const rawPrice = parseCurrency( cloned.vFinal )
			cloned.total = ( rawPrice * Number( cloned.Qtd || 1 ) ).toLocaleString(
				'pt-BR',
				{
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				},
			)
			const updated = [ ...itemsList ]
			updated.splice( index + 1, 0, cloned )
			setItemsListOnChange( updated )
		},
		[ itemsList, setItemsListOnChange ],
	)

	const handleItemChange = useCallback(
		( args: {
			index: number
			qtde?: number
			mont?: boolean
			expo?: boolean
			deleteItem?: boolean
		} ) => {
			const { index, qtde, mont, expo, deleteItem } = args

			const updatedList = itemsList.map( ( item, i ) => {
				if ( i !== index ) {
					return item
				}
				if ( deleteItem ) {
					return null
				}

				const rawQtde = qtde !== undefined ? qtde : item.Qtd
				const parsed = Number( rawQtde )
				const validQtde = isNaN( parsed )
					? MIN_QTD
					: Math.max( MIN_QTD, parsed )
				const validMont = mont !== undefined ? mont : item.mont
				const validExp = expo !== undefined ? expo : item.expo
				let price = parseCurrency( item.vFinal )
				const aditionalService = Math.round( price * 10 ) / 100

				price += validMont ? aditionalService : 0
				price += validExp ? aditionalService : 0

				const total = ( price * validQtde ).toLocaleString( 'pt-BR', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				} )

				return {
					...item,
					Qtd: validQtde,
					mont: validMont,
					expo: validExp,
					total,
				}
			} )

			setItemsListOnChange( updatedList.filter( ( item ) => item !== null ) )
		},
		[ itemsList, setItemsListOnChange ],
	)

	const handleQtyDraft = useCallback(
		( index: number, raw: string ) => {
			const updated = itemsList.map( ( it, i ) =>
				i === index ? { ...it, Qtd: raw } : it,
			)
			setItemsListOnChange( updated )
		},
		[ itemsList, setItemsListOnChange ],
	)

	const getInternalMeasurements = useCallback( ( item: any ): string | null => {
		if ( !item.comprimento ) return null
		return `${ item.comprimento } x ${ item.largura } x ${ item.altura }cm(alt.)`
	}, [] )

	return (
		<TableContainer>
			<DndContext
				sensors={ sensors }
				collisionDetection={ closestCenter }
				onDragEnd={ handleDragEnd }
			>
				<Table variant="simple">
					<Thead>
						<Tr bg="#ffffff12">
							<Th px="0" w="1.3rem"></Th>
							<Th px="0" minW="20rem" color="white" textAlign="center" fontSize="0.7rem">
								Item
							</Th>
							<Th px="0" w="6rem" color="white" textAlign="center" fontSize="0.7rem">
								Preço un
							</Th>
							<Th px="0" w="6rem" color="white" textAlign="center" fontSize="0.7rem">
								SERVIÇOS
							</Th>
							<Th px="0" w="3rem" color="white" textAlign="center" fontSize="0.7rem">
								Qtd
							</Th>
							<Th px="0" w="6rem" color="white" textAlign="center" fontSize="0.7rem">
								Preço total
							</Th>
							<Th px="0" w="1.3rem"></Th>
							<Th px="0" w="1.3rem"></Th>
						</Tr>
					</Thead>
					<SortableContext
						items={ sortableItems }
						strategy={ verticalListSortingStrategy }
					>
						<Tbody>
							{ itemsList?.length > 0 &&
								itemsList.map( ( item, index ) => (
									<SortableProposalRow
										key={ String( item._localId ?? `fallback-${ index }` ) }
										item={ item }
										index={ index }
										companyTablecalc={ companyTablecalc }
										onItemChange={ handleItemChange }
										onClone={ handleCloneItem }
										onQtyDraft={ handleQtyDraft }
										getInternalMeasurements={ getInternalMeasurements }
										minQtd={ MIN_QTD }
									/>
								) ) }
						</Tbody>
					</SortableContext>
				</Table>
			</DndContext>
		</TableContainer>
	)
}

export default TableItems
