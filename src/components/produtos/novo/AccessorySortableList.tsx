import { Badge, Box, Flex, Heading, IconButton, Text, VStack } from '@chakra-ui/react'
import {
	DndContext,
	PointerSensor,
	pointerWithin,
	rectIntersection,
	useDroppable,
	useSensor,
	useSensors,
	type CollisionDetection,
	type DragEndEvent,
} from '@dnd-kit/core'
import {
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import {
	ACCESSORY_PART_OPTIONS,
	ACCESSORY_UNCATEGORIZED_KEY,
	type AccessoryItem,
	type AccessoryMpOption,
	type AccessoryPartGroup,
	accessoryCustomName,
	accessoryMpLabel,
	getCategoryInsertIndex,
	moveAccessoryToPosition,
	normalizeAccessoriesList,
	partKeyToAccessoryPart,
} from '@/components/data/accessoryConfig'
import { useEffect } from 'react'
import { FaGripVertical, FaTimes } from 'react-icons/fa'

const PART_DROP_PREFIX = 'part-'

function isPartDropTarget( id: string | number ): boolean {
	return String( id ).startsWith( PART_DROP_PREFIX )
}

/** Prefer accessory rows; category title drop only when pointer is on the title. */
const accessoryCollisionDetection: CollisionDetection = ( args ) => {
	const pointerHits = pointerWithin( args )
	if ( pointerHits.length > 0 ) {
		const rowHit = pointerHits.find( ( hit ) => !isPartDropTarget( hit.id ) )
		if ( rowHit ) {
			return [ rowHit ]
		}
		const titleHit = pointerHits.find( ( hit ) => isPartDropTarget( hit.id ) )
		if ( titleHit ) {
			return [ titleHit ]
		}
		return pointerHits
	}
	const rectHits = rectIntersection( args )
	const rowHit = rectHits.find( ( hit ) => !isPartDropTarget( hit.id ) )
	if ( rowHit ) {
		return [ rowHit ]
	}
	return rectHits
}

type AccessorySortableListProps = {
	items: AccessoryItem[]
	mpOptions: AccessoryMpOption[]
	onChange: ( items: AccessoryItem[] ) => void
}

function buildAllPartGroups( items: AccessoryItem[] ): AccessoryPartGroup[] {
	const grouped = new Map<string, AccessoryPartGroup[ 'entries' ]>()

	items.forEach( ( item, index ) => {
		const key = item.acessorioPart ?? ACCESSORY_UNCATEGORIZED_KEY
		const list = grouped.get( key ) ?? []
		list.push( { item, index } )
		grouped.set( key, list )
	} )

	const groups: AccessoryPartGroup[] = ACCESSORY_PART_OPTIONS.map( ( opt ) => ( {
		partKey: opt.value,
		label: opt.label,
		entries: grouped.get( opt.value ) ?? [],
	} ) )

	const uncategorized = grouped.get( ACCESSORY_UNCATEGORIZED_KEY )
	if ( uncategorized && uncategorized.length > 0 ) {
		groups.push( {
			partKey: ACCESSORY_UNCATEGORIZED_KEY,
			label: 'Sem categoria',
			entries: uncategorized,
		} )
	}

	return groups
}

type SortableRowProps = {
	item: AccessoryItem
	mpOptions: AccessoryMpOption[]
	onRemove: ( localId: string ) => void
}

function SortableAccessoryRow( { item, mpOptions, onRemove }: SortableRowProps ) {
	const localId = item._localId ?? ''
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable( { id: localId } )

	const style = {
		transform: CSS.Translate.toString( transform ),
		transition,
		opacity: isDragging ? 0.45 : 1,
	}

	const customName = accessoryCustomName( item )

	return (
		<Box
			ref={ setNodeRef }
			style={ style }
			data-accessory-row
			w="100%"
			bg="gray.800"
			p={ 3 }
			rounded="md"
			borderWidth={ isDragging ? '1px' : 0 }
			borderColor="blue.400"
		>
			<Flex align="center" gap={ 2 } flexWrap="wrap" w="100%">
				<Box
					{ ...attributes }
					{ ...listeners }
					flexShrink={ 0 }
					color="gray.500"
					cursor="grab"
					_active={ { cursor: 'grabbing' } }
					touchAction="none"
					aria-label="Arrastar para reordenar ou mudar de categoria"
				>
					<FaGripVertical />
				</Box>
				{ customName && (
					<Badge colorScheme="yellow" fontSize="xs">
						{ customName }
					</Badge>
				) }
				<Badge colorScheme="cyan" fontSize="xs" variant="subtle">
					{ accessoryMpLabel( item, mpOptions ) }
				</Badge>
				{ item.acessorioComp && (
					<Badge colorScheme="gray" fontSize="xs">
						Comp.: { item.acessorioComp }
					</Badge>
				) }
				{ item.acessorioLarg && (
					<Badge colorScheme="gray" fontSize="xs">
						Larg.: { item.acessorioLarg }
					</Badge>
				) }
				<Badge colorScheme="gray" fontSize="xs">
					{ item.acessorioQtde } peças
				</Badge>
				<IconButton
					aria-label="Remover acessório"
					icon={ <FaTimes /> }
					size="xs"
					variant="outline"
					colorScheme="red"
					ml="auto"
					onClick={ () => onRemove( localId ) }
				/>
			</Flex>
		</Box>
	)
}

type PartGroupSectionProps = {
	group: AccessoryPartGroup
	mpOptions: AccessoryMpOption[]
	onRemove: ( localId: string ) => void
}

function PartGroupSection( { group, mpOptions, onRemove }: PartGroupSectionProps ) {
	const dropId = `${ PART_DROP_PREFIX }${ group.partKey }`
	const { setNodeRef: setTitleDropRef, isOver: isTitleOver } = useDroppable( {
		id: dropId,
	} )
	const sortableIds = group.entries
		.map( ( entry ) => entry.item._localId )
		.filter( ( id ): id is string => Boolean( id ) )

	return (
		<Box w="100%">
			<Heading
				ref={ setTitleDropRef }
				as="div"
				size="xs"
				color="purple.300"
				textTransform="uppercase"
				letterSpacing="wider"
				mb={ 2 }
				px={ 2 }
				py={ 1 }
				rounded="md"
				w="fit-content"
				maxW="100%"
				cursor="default"
				bg={ isTitleOver ? 'whiteAlpha.200' : 'transparent' }
				outline={ isTitleOver ? '1px dashed' : 'none' }
				outlineColor="blue.400"
				title="Solte aqui para mover para esta categoria"
			>
				{ group.label }
			</Heading>
			<SortableContext
				items={ sortableIds }
				strategy={ verticalListSortingStrategy }
			>
				<VStack align="stretch" spacing={ 2 } w="100%">
					{ group.entries.length === 0 && (
						<Text fontSize="xs" color="gray.500" py={ 1 }>
							Nenhum item nesta categoria
						</Text>
					) }
					{ group.entries.map( ( entry ) => (
						<SortableAccessoryRow
							key={ entry.item._localId }
							item={ entry.item }
							mpOptions={ mpOptions }
							onRemove={ onRemove }
						/>
					) ) }
				</VStack>
			</SortableContext>
		</Box>
	)
}

export function AccessorySortableList( {
	items,
	mpOptions,
	onChange,
}: AccessorySortableListProps ) {
	useEffect( () => {
		const sorted = normalizeAccessoriesList( items )
		const needsIds = items.some( ( item ) => !item._localId )
		const needsOrder =
			items.length === sorted.length &&
			sorted.some(
				( item, index ) => item._localId !== items[ index ]?._localId,
			)
		if ( needsIds || needsOrder ) {
			onChange( sorted )
		}
	}, [ items, onChange ] )

	const displayItems = normalizeAccessoriesList( items )
	const groups = buildAllPartGroups( displayItems )

	const sensors = useSensors(
		useSensor( PointerSensor, { activationConstraint: { distance: 6 } } ),
	)

	const commitItems = ( next: AccessoryItem[] ) => {
		onChange( normalizeAccessoriesList( next ) )
	}

	const handleRemove = ( localId: string ) => {
		commitItems( displayItems.filter( ( item ) => item._localId !== localId ) )
	}

	const handleDragEnd = ( event: DragEndEvent ) => {
		const { active, over } = event
		if ( !over ) {
			return
		}

		const activeId = String( active.id )
		const overId = String( over.id )
		const fromIndex = displayItems.findIndex(
			( item ) => item._localId === activeId,
		)
		if ( fromIndex < 0 ) {
			return
		}

		if ( overId.startsWith( PART_DROP_PREFIX ) ) {
			const partKey = overId.slice( PART_DROP_PREFIX.length )
			const insertAt = getCategoryInsertIndex( displayItems, partKey )
			commitItems(
				moveAccessoryToPosition(
					displayItems,
					fromIndex,
					insertAt,
					partKeyToAccessoryPart( partKey ),
				),
			)
			return
		}

		const toIndex = displayItems.findIndex( ( item ) => item._localId === overId )
		if ( toIndex < 0 ) {
			return
		}

		const overPartKey =
			displayItems[ toIndex ].acessorioPart ?? ACCESSORY_UNCATEGORIZED_KEY
		commitItems(
			moveAccessoryToPosition(
				displayItems,
				fromIndex,
				toIndex,
				partKeyToAccessoryPart( overPartKey ),
			),
		)
	}

	if ( displayItems.length === 0 ) {
		return null
	}

	return (
		<DndContext
			sensors={ sensors }
			collisionDetection={ accessoryCollisionDetection }
			onDragEnd={ handleDragEnd }
		>
			<VStack align="stretch" spacing={ 4 }>
				{ groups.map( ( group ) => (
					<PartGroupSection
						key={ group.partKey }
						group={ group }
						mpOptions={ mpOptions }
						onRemove={ handleRemove }
					/>
				) ) }
			</VStack>
		</DndContext>
	)
}
