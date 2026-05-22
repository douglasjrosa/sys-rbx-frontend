export type AccessoryMpType = 1 | 2 | 3

export type AccessoryMpOption = {
	index: string
	label: string
	acess: AccessoryMpType
	defaultName: string
}

export type AccessoryPart =
	| 'base'
	| 'side'
	| 'head'
	| 'lid'
	| 'loose'

export const DEFAULT_ACCESSORY_PART: AccessoryPart = 'loose'

export type AccessoryItem = {
	/** Client-only stable key for drag-and-drop (not sent to legacy API). */
	_localId?: string
	acessorioMp: string
	acessorioQtde: string
	acessorioComp?: string
	acessorioLarg?: string
	acessorioName?: string
	acessorioPart?: AccessoryPart
}

let accessoryLocalIdCounter = 0

export function createAccessoryLocalId(): string {
	accessoryLocalIdCounter += 1
	return `acc-${ Date.now() }-${ accessoryLocalIdCounter }`
}

export function ensureAccessoryLocalId( item: AccessoryItem ): AccessoryItem {
	if ( item._localId ) {
		return item
	}
	return { ...item, _localId: createAccessoryLocalId() }
}

/** Canonical order: Base → Lateral → Cabeceira → Tampa → Itens avulsos. */
export function sortAccessoriesByPart( items: AccessoryItem[] ): AccessoryItem[] {
	const withIds = items.map( ensureAccessoryLocalId )
	return groupAccessoriesByPart( withIds ).flatMap( ( group ) =>
		group.entries.map( ( entry ) => entry.item ),
	)
}

export function normalizeAccessoriesList( items: AccessoryItem[] ): AccessoryItem[] {
	return sortAccessoriesByPart( items )
}

/** Legacy almoxarifado.acess — drives accessory MP picker categories. */
export const ACCESSORY_MP_CATEGORIES: ReadonlyArray<{
	acess: AccessoryMpType
	addLabel: string
	formTitle: string
}> = [
	{ acess: 1, addLabel: 'Adicionar madeira', formTitle: 'Madeira' },
	{ acess: 2, addLabel: 'Adicionar compensado', formTitle: 'Compensado' },
	{ acess: 3, addLabel: 'Adicionar item avulso', formTitle: 'Item avulso' },
]

export const ACCESSORY_PART_OPTIONS: ReadonlyArray<{
	value: AccessoryPart
	label: string
}> = [
	{ value: 'base', label: 'Base' },
	{ value: 'side', label: 'Lateral' },
	{ value: 'head', label: 'Cabeceira' },
	{ value: 'lid', label: 'Tampa' },
	{ value: 'loose', label: 'Itens avulsos' },
]

export const ACCESSORY_UNCATEGORIZED_KEY = 'uncategorized'

export type AccessoryGroupedEntry = {
	item: AccessoryItem
	index: number
}

export type AccessoryPartGroup = {
	partKey: string
	label: string
	entries: AccessoryGroupedEntry[]
}

/** Groups accessory rows by packaging part for sectioned UI. */
export function groupAccessoriesByPart( items: AccessoryItem[] ): AccessoryPartGroup[] {
	const buckets = new Map<string, AccessoryGroupedEntry[]>()

	items.forEach( ( item, index ) => {
		const key = item.acessorioPart ?? ACCESSORY_UNCATEGORIZED_KEY
		const list = buckets.get( key ) ?? []
		list.push( { item, index } )
		buckets.set( key, list )
	} )

	const groups: AccessoryPartGroup[] = []

	for ( const opt of ACCESSORY_PART_OPTIONS ) {
		const entries = buckets.get( opt.value )
		if ( entries?.length ) {
			groups.push( { partKey: opt.value, label: opt.label, entries } )
			buckets.delete( opt.value )
		}
	}

	const uncategorized = buckets.get( ACCESSORY_UNCATEGORIZED_KEY )
	if ( uncategorized?.length ) {
		groups.push( {
			partKey: ACCESSORY_UNCATEGORIZED_KEY,
			label: 'Sem categoria',
			entries: uncategorized,
		} )
		buckets.delete( ACCESSORY_UNCATEGORIZED_KEY )
	}

	for ( const [ partKey, entries ] of buckets ) {
		if ( entries.length > 0 ) {
			const label = isAccessoryPart( partKey )
				? accessoryPartLabel( partKey )
				: partKey
			groups.push( { partKey, label, entries } )
		}
	}

	return groups
}

export function partKeyToAccessoryPart(
	partKey: string,
): AccessoryPart | undefined {
	if ( partKey === ACCESSORY_UNCATEGORIZED_KEY ) {
		return undefined
	}
	return isAccessoryPart( partKey ) ? partKey : undefined
}

/** Index to append an item at the end of a category block in the flat list. */
export function getCategoryInsertIndex(
	items: AccessoryItem[],
	partKey: string,
): number {
	const partOrder = ACCESSORY_PART_OPTIONS.map( ( o ) => o.value )
	const targetOrder =
		partKey === ACCESSORY_UNCATEGORIZED_KEY
			? partOrder.length
			: partOrder.indexOf( partKey as AccessoryPart )

	let lastInCategory = -1
	items.forEach( ( item, index ) => {
		const itemKey = item.acessorioPart ?? ACCESSORY_UNCATEGORIZED_KEY
		if ( itemKey === partKey ) {
			lastInCategory = index
		}
	} )
	if ( lastInCategory >= 0 ) {
		return lastInCategory + 1
	}

	for ( let i = 0; i < items.length; i++ ) {
		const itemKey = items[ i ].acessorioPart ?? ACCESSORY_UNCATEGORIZED_KEY
		const itemOrder =
			itemKey === ACCESSORY_UNCATEGORIZED_KEY
				? partOrder.length
				: partOrder.indexOf( itemKey as AccessoryPart )
		if ( itemOrder > targetOrder ) {
			return i
		}
	}
	return items.length
}

/**
 * Moves an accessory in the flat list and optionally assigns a packaging part.
 */
export function moveAccessoryToPosition(
	items: AccessoryItem[],
	fromIndex: number,
	toIndex: number,
	targetPart?: AccessoryPart,
): AccessoryItem[] {
	if ( fromIndex < 0 || fromIndex >= items.length ) {
		return items
	}
	const next = items.map( ( item ) => ( { ...item } ) )
	const [ moved ] = next.splice( fromIndex, 1 )
	const insertAt = Math.max( 0, Math.min( toIndex, next.length ) )

	if ( insertAt === fromIndex ) {
		const partUnchanged =
			targetPart === undefined
				? !moved.acessorioPart
				: moved.acessorioPart === targetPart
		if ( partUnchanged ) {
			return items
		}
	}

	if ( targetPart !== undefined ) {
		moved.acessorioPart = targetPart
	} else {
		delete moved.acessorioPart
	}

	next.splice( insertAt, 0, moved )
	return next
}

/** All category sections (for drop targets while dragging). */
export function buildAccessoryDisplayGroups(
	items: AccessoryItem[],
	includeEmptyCategories: boolean,
): AccessoryPartGroup[] {
	if ( !includeEmptyCategories ) {
		return groupAccessoriesByPart( items )
	}

	const grouped = groupAccessoriesByPart( items )
	const byKey = new Map( grouped.map( ( g ) => [ g.partKey, g ] ) )

	const allGroups: AccessoryPartGroup[] = ACCESSORY_PART_OPTIONS.map(
		( opt ) => ( {
			partKey: opt.value,
			label: opt.label,
			entries: byKey.get( opt.value )?.entries ?? [],
		} ),
	)

	allGroups.push( {
		partKey: ACCESSORY_UNCATEGORIZED_KEY,
		label: 'Sem categoria',
		entries: byKey.get( ACCESSORY_UNCATEGORIZED_KEY )?.entries ?? [],
	} )

	return allGroups
}

export function getAccessoryFieldRequirements(
	acess: AccessoryMpType | undefined,
): { comp: boolean; larg: boolean } {
	if ( acess === 1 ) {
		return { comp: true, larg: false }
	}
	if ( acess === 2 ) {
		return { comp: true, larg: true }
	}
	return { comp: false, larg: false }
}

export function parseLegacyAccessories( raw: unknown ): AccessoryItem[] {
	if ( raw === undefined || raw === null || raw === '' ) {
		return []
	}

	let parsed: unknown = raw
	if ( typeof raw === 'string' ) {
		const trimmed = raw.trim()
		if ( trimmed === '' || trimmed === '[]' ) {
			return []
		}
		try {
			parsed = JSON.parse( trimmed )
		} catch {
			return []
		}
	}

	if ( !Array.isArray( parsed ) ) {
		return []
	}

	return normalizeAccessoriesList(
		parsed
			.map( ( entry ) => mapLegacyAccessoryEntry( entry ) )
			.filter( ( item ): item is AccessoryItem => item !== null ),
	)
}

function mapLegacyAccessoryEntry( entry: unknown ): AccessoryItem | null {
	if ( !entry || typeof entry !== 'object' ) {
		return null
	}
	const row = entry as Record<string, unknown>
	const mp = String( row.acessorioMp ?? '' ).trim()
	const qtde = String( row.acessorioQtde ?? '' ).trim()
	if ( !mp || !qtde ) {
		return null
	}

	const item: AccessoryItem = { acessorioMp: mp, acessorioQtde: qtde }

	const comp = String( row.acessorioComp ?? '' ).trim()
	if ( comp ) {
		item.acessorioComp = comp
	}

	const larg = String( row.acessorioLarg ?? '' ).trim()
	if ( larg ) {
		item.acessorioLarg = larg
	}

	const name = String( row.acessorioName ?? '' ).trim()
	if ( name ) {
		item.acessorioName = name
	}

	const part = String( row.acessorioPart ?? '' ).trim()
	if ( isAccessoryPart( part ) ) {
		item.acessorioPart = part
	}

	return item
}

function isAccessoryPart( value: string ): value is AccessoryPart {
	return ACCESSORY_PART_OPTIONS.some( ( opt ) => opt.value === value )
}

/** Legacy calc/save expects a JSON string in query/body. */
export function serializeAccessoriesForLegacy( items: AccessoryItem[] ): string {
	const payload = items.map( ( item ) => {
		const row: Record<string, string> = {
			acessorioMp: item.acessorioMp,
			acessorioQtde: item.acessorioQtde,
		}
		if ( item.acessorioComp ) {
			row.acessorioComp = item.acessorioComp
		}
		if ( item.acessorioLarg ) {
			row.acessorioLarg = item.acessorioLarg
		}
		if ( item.acessorioName?.trim() ) {
			row.acessorioName = item.acessorioName.trim()
		}
		if ( item.acessorioPart ) {
			row.acessorioPart = item.acessorioPart
		}
		return row
	} )
	return JSON.stringify( payload )
}

export function accessoryMpLabel(
	item: AccessoryItem,
	mpOptions: AccessoryMpOption[],
): string {
	const mp = mpOptions.find( ( o ) => o.index === item.acessorioMp )
	return mp?.label ?? mp?.defaultName ?? item.acessorioMp
}

export function accessoryCustomName( item: AccessoryItem ): string {
	return item.acessorioName?.trim() ?? ''
}

export function accessoryPartLabel( part: AccessoryPart | undefined ): string {
	if ( !part ) {
		return ''
	}
	return ACCESSORY_PART_OPTIONS.find( ( o ) => o.value === part )?.label ?? ''
}
