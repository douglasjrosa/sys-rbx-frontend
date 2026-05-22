import advConfigsJson from '@/components/data/advConfigs.json'
import {
	parseLegacyAccessories,
	serializeAccessoriesForLegacy,
	type AccessoryItem,
} from '@/components/data/accessoryConfig'
import cxConfigsDefaultsJson from '@/components/data/cxConfigsDefaults.json'
import type { AssemblyType } from '@/lib/calculadora-de-embalagem/utils/packagingCalculator'

export type AdvConfigKey = string

export type AdvCheckboxKey =
	| 'BaseSN'
	| 'LatESN'
	| 'LatDSN'
	| 'TampaSN'
	| 'CabESN'
	| 'CabDSN'
	| 'LatAdFrSN'
	| 'CabAdFrSN'
	| 'LatAdExSN'
	| 'CabAdExSN'
	| 'LatForaSN'
	| 'LatChaoSN'
	| 'CabChaoSN'
	| 'CabTopoSN'
	| 'printable'

export type AdvQuantityKey =
	| 'qPes'
	| 'qVigasBase'
	| 'qTabuas'
	| 'qSarBase'
	| 'qSarLat'
	| 'qSarCab'
	| 'qSarTampa'

type ModelAdvMap = Record<string, { titulo: string; advConfigs: AdvConfigKey[] }>

const modelAdvMap = advConfigsJson as ModelAdvMap

/** Legacy getCxConfigs() — dadosgerais.indice = 37 */
const cxConfigsDefaults = cxConfigsDefaultsJson as Record<string, string>

export const ADV_CHECKBOX_LABELS: Record<AdvCheckboxKey, string> = {
	BaseSN: 'Base',
	LatESN: 'Lateral Esquerda',
	LatDSN: 'Lateral Direita',
	TampaSN: 'Tampa',
	CabESN: 'Cabeceira Esquerda',
	CabDSN: 'Cabeceira Direita',
	LatAdFrSN: 'Adesivo Frágil nas Laterais',
	CabAdFrSN: 'Adesivo Frágil nas Cabeceiras',
	LatAdExSN: 'Adesivo Especial nas Laterais',
	CabAdExSN: 'Adesivo Especial nas Cabeceiras',
	LatForaSN: 'Laterais por fora das Cabeceiras',
	LatChaoSN: 'Laterais até o chão',
	CabChaoSN: 'Cabeceiras até o chão',
	CabTopoSN: 'Cabeceiras até o topo',
	printable: 'Imprimir desenho normalmente',
}

export const ADV_QUANTITY_LABELS: Record<AdvQuantityKey, string> = {
	qPes: 'Quantidade de Pés na Base',
	qVigasBase: 'Quantidade de Vigas na Base',
	qTabuas: 'Quantidade de Tábuas na Base',
	qSarBase: 'Quantidade de Sarrafos no Meio da Base',
	qSarLat: 'Quantidade de Sarrafos no Meio das Laterais',
	qSarCab: 'Quantidade de Sarrafos no Meio das Cabeceiras',
	qSarTampa: 'Quantidade de Sarrafos no Meio da Tampa',
}

export const FOOT_CONFIG_OPTIONS = [
	{ value: '2', label: 'Pé Alto com Tocos' },
	{ value: '4', label: 'Pé Alto de Viga' },
	{ value: '1', label: 'Pé baixo' },
] as const

export const ADV_CHECKBOX_KEYS = Object.keys( ADV_CHECKBOX_LABELS ) as AdvCheckboxKey[]

export const ADV_QUANTITY_KEYS = Object.keys( ADV_QUANTITY_LABELS ) as AdvQuantityKey[]

/** EAV attributes required for legacy calcCx / imprimir after salvarCx. */
export const PRODUTO_CALC_CONFIG_PERSIST_KEYS = [
	'pesoProd',
	'pe',
	'obsCaixa',
	...ADV_CHECKBOX_KEYS,
	...ADV_QUANTITY_KEYS,
] as const

export function buildLegacyAdvFormOverrides(
	form: NovoProdutoFormState,
): Record<string, string> {
	const overrides: Record<string, string> = {}

	if ( form.pesoProd.trim() !== '' ) {
		overrides.pesoProd = form.pesoProd.trim()
	}

	if ( form.obsCaixa.trim() !== '' ) {
		overrides.obsCaixa = form.obsCaixa.trim()
	}

	if ( modelHasAdvKey( form.modelo, 'configPe' ) && form.pe ) {
		overrides.pe = form.pe
	}

	for ( const key of getVisibleAdvCheckboxes( form.modelo ) ) {
		overrides[ key ] = legacyOnOff( form.advCheckboxes[ key ] )
	}

	for ( const key of getVisibleAdvQuantities( form.modelo ) ) {
		const qty = form.advQuantities[ key ]
		if ( qty !== undefined && qty !== null && String( qty ).trim() !== '' ) {
			overrides[ key ] = String( qty )
		}
	}

	return overrides
}

export function buildLegacyAccessoryOverrides(
	form: NovoProdutoFormState,
): Record<string, string> {
	if ( form.accessories.length === 0 ) {
		return {}
	}
	return { acessorios: serializeAccessoriesForLegacy( form.accessories ) }
}

const DIMENSION_KEYS = new Set( [ 'comprimento', 'largura', 'altura' ] )

export function getModelAdvConfigKeys( modelo: string ): AdvConfigKey[] {
	if ( !modelo || !modelAdvMap[ modelo ] ) {
		return []
	}
	return modelAdvMap[ modelo ].advConfigs
}

export function modelHasAdvKey( modelo: string, key: AdvConfigKey ): boolean {
	return getModelAdvConfigKeys( modelo ).includes( key )
}

export function getVisibleAdvCheckboxes( modelo: string ): AdvCheckboxKey[] {
	return getModelAdvConfigKeys( modelo ).filter( ( k ): k is AdvCheckboxKey =>
		( ADV_CHECKBOX_KEYS as string[] ).includes( k ),
	)
}

export function getVisibleAdvQuantities( modelo: string ): AdvQuantityKey[] {
	return getModelAdvConfigKeys( modelo ).filter( ( k ): k is AdvQuantityKey =>
		( ADV_QUANTITY_KEYS as string[] ).includes( k ),
	)
}

export function isCalcInvalidatingAdvKey( key: string ): boolean {
	if ( DIMENSION_KEYS.has( key ) || key === 'configPe' ) {
		return true
	}
	if ( ( ADV_CHECKBOX_KEYS as string[] ).includes( key ) ) {
		return true
	}
	if ( ( ADV_QUANTITY_KEYS as string[] ).includes( key ) ) {
		return true
	}
	return (
		key === 'tabela' ||
		key === 'modelo' ||
		key === 'pesoProd' ||
		key === 'assembly' ||
		key === 'acessorios'
	)
}

export function getCxConfigDefaultOnOff( key: AdvCheckboxKey ): boolean {
	const raw = cxConfigsDefaults[ key ]
	return parseLegacyOnOff( raw ?? 'off' )
}

export function createDefaultAdvCheckboxes(): Record<AdvCheckboxKey, boolean> {
	const defaults = {} as Record<AdvCheckboxKey, boolean>
	for ( const key of ADV_CHECKBOX_KEYS ) {
		defaults[ key ] = getCxConfigDefaultOnOff( key )
	}
	return defaults
}

export function createDefaultAdvQuantities(): Record<AdvQuantityKey, string> {
	const defaults = {} as Record<AdvQuantityKey, string>
	for ( const key of ADV_QUANTITY_KEYS ) {
		defaults[ key ] = ''
	}
	return defaults
}

export function legacyOnOff( enabled: boolean ): 'on' | 'off' {
	return enabled ? 'on' : 'off'
}

export function parseLegacyOnOff( value: unknown ): boolean {
	if ( value === true || value === 1 ) {
		return true
	}
	const s = String( value ?? '' ).toLowerCase()
	return s === 'on' || s === '1' || s === 'true'
}

export type NovoProdutoFormState = {
	nomeProd: string
	modelo: string
	comprimento: string
	largura: string
	altura: string
	codigo: string
	pesoProd: string
	tabela: string
	empresa: string
	pe: string
	assembly: AssemblyType
	obsCaixa: string
	advCheckboxes: Record<AdvCheckboxKey, boolean>
	advQuantities: Record<AdvQuantityKey, string>
	accessories: AccessoryItem[]
}

const PALLET_MODEL_ID = 'palete_sob_medida'

export function modelSupportsAssembly( modelo: string ): boolean {
	if ( !modelo ) {
		return true
	}
	return modelo !== PALLET_MODEL_ID
}

export function buildNovoProdutoCalcParams( form: NovoProdutoFormState ): URLSearchParams {
	const params = new URLSearchParams( { calcular: '1' } )

	const scalarKeys = [
		'nomeProd',
		'modelo',
		'comprimento',
		'largura',
		'altura',
		'codigo',
		'pesoProd',
		'tabela',
		'empresa',
	] as const

	for ( const key of scalarKeys ) {
		const value = form[ key ]
		if ( value !== undefined && value !== null && String( value ).trim() !== '' ) {
			params.append( key, String( value ) )
		}
	}

	if ( modelHasAdvKey( form.modelo, 'configPe' ) && form.pe ) {
		params.append( 'pe', form.pe )
	}

	if ( form.obsCaixa.trim() ) {
		params.append( 'obsCaixa', form.obsCaixa.trim() )
	}

	if ( modelSupportsAssembly( form.modelo ) && form.assembly ) {
		params.append( 'assembly', form.assembly )
	}

	for ( const key of getVisibleAdvCheckboxes( form.modelo ) ) {
		params.append( key, legacyOnOff( form.advCheckboxes[ key ] ) )
	}

	for ( const key of getVisibleAdvQuantities( form.modelo ) ) {
		const qty = form.advQuantities[ key ]
		if ( qty !== undefined && qty !== null && String( qty ).trim() !== '' ) {
			params.append( key, String( qty ) )
		}
	}

	if ( form.accessories.length > 0 ) {
		params.append( 'acessorios', serializeAccessoriesForLegacy( form.accessories ) )
	}

	return params
}

/** Quantity fields from calc `info` / `_calcCaixa.info` after legacy calcCx. */
export function mapCalcInfoToAdvQuantities(
	info: Record<string, unknown>,
	modelo: string,
	prev: Record<AdvQuantityKey, string>,
): Record<AdvQuantityKey, string> {
	const next = { ...prev }

	for ( const key of getVisibleAdvQuantities( modelo ) ) {
		const raw = info[ key ]
		if ( raw === undefined || raw === null || String( raw ).trim() === '' ) {
			continue
		}
		const num = Number( raw )
		next[ key ] = Number.isFinite( num ) ? String( num ) : String( raw )
	}

	return next
}

export function mergeCalcQuantityInfo(
	info: Record<string, unknown>,
	savePayload?: { _calcCaixa?: unknown },
): Record<string, unknown> {
	const merged = { ...info }
	const calcCaixa = savePayload?._calcCaixa
	if ( calcCaixa && typeof calcCaixa === 'object' ) {
		const calcInfo = ( calcCaixa as Record<string, unknown> ).info
		if ( calcInfo && typeof calcInfo === 'object' ) {
			Object.assign( merged, calcInfo as Record<string, unknown> )
		}
		Object.assign( merged, info )
	}
	return merged
}

export function clearVisibleAdvQuantities(
	modelo: string,
	prev: Record<AdvQuantityKey, string>,
): Record<AdvQuantityKey, string> {
	const next = { ...prev }
	for ( const key of getVisibleAdvQuantities( modelo ) ) {
		next[ key ] = ''
	}
	return next
}

export function mapLegacyProductToForm(
	product: Record<string, unknown>,
	prev: NovoProdutoFormState,
): Partial<NovoProdutoFormState> {
	const advCheckboxes = { ...prev.advCheckboxes }
	for ( const key of ADV_CHECKBOX_KEYS ) {
		if ( key in product ) {
			advCheckboxes[ key ] = parseLegacyOnOff( product[ key ] )
		}
	}

	const advQuantities = { ...prev.advQuantities }
	for ( const key of ADV_QUANTITY_KEYS ) {
		if ( product[ key ] !== undefined && product[ key ] !== null ) {
			advQuantities[ key ] = String( product[ key ] )
		}
	}

	return {
		nomeProd: String( product.nomeProd ?? '' ),
		modelo: String( product.modelo ?? '' ),
		comprimento: String( product.comprimento ?? '' ),
		largura: String( product.largura ?? '' ),
		altura: String( product.altura ?? '' ),
		codigo: String( product.codigo ?? '' ),
		pesoProd: String( product.pesoProd ?? '' ),
		tabela: product.tabela != null ? String( product.tabela ) : prev.tabela,
		pe: product.pe != null ? String( product.pe ) : prev.pe,
		assembly:
			typeof product.assembly === 'string' && product.assembly.length > 0
				? ( product.assembly as AssemblyType )
				: prev.assembly,
		obsCaixa: String( product.obsCaixa ?? '' ),
		advCheckboxes,
		advQuantities,
		accessories: parseLegacyAccessories( product.acessorios ),
	}
}

/** Patches calc model info so salvarCx atividades match the form. */
export function mergeFormAdvIntoCalcCaixa(
	calcCaixa: unknown,
	form: NovoProdutoFormState,
): unknown {
	if ( !calcCaixa || typeof calcCaixa !== 'object' ) {
		return calcCaixa
	}

	const cloned = JSON.parse( JSON.stringify( calcCaixa ) ) as Record<string, unknown>
	const info = ( cloned.info && typeof cloned.info === 'object'
		? { ...( cloned.info as Record<string, unknown> ) }
		: {} ) as Record<string, unknown>

	info.nomeProd = form.nomeProd
	info.codigo = form.codigo
	info.pesoProd = form.pesoProd
	info.comprimento = form.comprimento
	info.largura = form.largura
	info.altura = form.altura
	info.tabela = form.tabela
	info.obsCaixa = form.obsCaixa

	if ( modelSupportsAssembly( form.modelo ) ) {
		info.assembly = form.assembly
	}

	if ( modelHasAdvKey( form.modelo, 'configPe' ) ) {
		info.pe = form.pe
	}

	for ( const key of getVisibleAdvCheckboxes( form.modelo ) ) {
		info[ key ] = legacyOnOff( form.advCheckboxes[ key ] )
	}

	for ( const key of getVisibleAdvQuantities( form.modelo ) ) {
		const qty = form.advQuantities[ key ]
		if ( qty !== '' ) {
			info[ key ] = qty
		}
	}

	if ( form.accessories.length > 0 ) {
		info.acessorios = serializeAccessoriesForLegacy( form.accessories )
	}

	cloned.info = info
	return cloned
}
