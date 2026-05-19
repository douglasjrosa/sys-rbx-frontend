import { PRODUTO_CALC_CONFIG_PERSIST_KEYS } from '@/components/data/produtoAdvConfigs'
import type { ProdutoSavePayload } from '@/types/produtoCalc'

export const PRODUTO_PERSIST_FIELD_NAMES = [
	'nomeProd',
	'titulo',
	'modelo',
	'empresa',
	'comprimento',
	'largura',
	'altura',
	'codigo',
	'pesoCx',
	'custo',
	'tabela',
	'tabelas',
	'nomeTabelaAtual',
	'preco',
	'vFinal',
	'mLucro',
	'mComissao',
	'mPremio',
	'mImposto',
	'lucro',
	'comissao',
	'premio',
	'imposto',
	'ncm',
	'created_from',
	'ativo',
	'deleteIndex',
	'lastChange',
	'lastUser',
	'assembly',
	...PRODUTO_CALC_CONFIG_PERSIST_KEYS,
] as const

function resolveNcm( titulo: string ): string {
	return /^Palete/.test( titulo ) ? '44152000' : '44151000'
}

function buildSavePayloadFromInfo(
	info: Record<string, unknown>,
	calcModel: Record<string, unknown>,
): ProdutoSavePayload {
	const payload: ProdutoSavePayload = {}

	for ( const key of PRODUTO_PERSIST_FIELD_NAMES ) {
		if ( info[ key ] !== undefined && info[ key ] !== null ) {
			payload[ key ] = info[ key ]
		}
	}

	const titulo = String( payload.titulo ?? '' )
	payload.ncm = resolveNcm( titulo )
	payload._calcCaixa = calcModel

	return payload
}

/**
 * Normalizes legacy (model root) and new ({ info, savePayload }) calc API responses.
 */
export function normalizeProdutoCalcResponse( data: unknown ): {
	info: Record<string, unknown>
	savePayload: ProdutoSavePayload
} {
	if ( !data || typeof data !== 'object' ) {
		throw new Error( 'Resposta de cálculo inválida.' )
	}

	const body = data as Record<string, unknown>

	if ( body.error ) {
		throw new Error( String( body.error ) )
	}

	if ( body.savePayload && typeof body.savePayload === 'object' ) {
		const info = ( body.info ?? body.savePayload ) as Record<string, unknown>
		return {
			info,
			savePayload: body.savePayload as ProdutoSavePayload,
		}
	}

	const info = ( body.info ?? body ) as Record<string, unknown>
	if ( info.vFinal === undefined && info.preco === undefined ) {
		throw new Error( 'Resposta de cálculo incompleta. Tente novamente.' )
	}

	return {
		info,
		savePayload: buildSavePayloadFromInfo( info, body ),
	}
}

type LegacySaveResponse = {
	erro?: unknown
	error?: unknown
	indice?: unknown
	deactivateErro?: unknown
}

/**
 * Builds POST body for legacy salvarCx (persist fields + optional _calcCaixa).
 */
export function prepareLegacySavePayload(
	savePayload: ProdutoSavePayload,
	overrides: Record<string, unknown>,
): ProdutoSavePayload {
	const merged: ProdutoSavePayload = {
		...savePayload,
		...overrides,
	}
	const out: ProdutoSavePayload = {}
	for ( const key of PRODUTO_PERSIST_FIELD_NAMES ) {
		if ( merged[ key ] !== undefined && merged[ key ] !== null ) {
			out[ key ] = merged[ key ]
		}
	}
	if ( merged._calcCaixa !== undefined ) {
		out._calcCaixa = merged._calcCaixa
	}
	return out
}

/** Validates legacy salvar response; returns prodId (indice). */
export function parseLegacySaveResponse( data: unknown ): number {
	if ( !data || typeof data !== 'object' ) {
		throw new Error( 'Resposta inválida do sistema legado.' )
	}
	const body = data as LegacySaveResponse
	if ( body.error ) {
		throw new Error( String( body.error ) )
	}
	if ( body.erro && body.erro !== false ) {
		throw new Error( String( body.erro ) )
	}
	const indice = Number( body.indice )
	if ( !Number.isFinite( indice ) || indice <= 0 ) {
		throw new Error(
			'Produto não foi gravado no sistema legado (ID ausente). Strapi não foi atualizado.',
		)
	}
	if ( body.deactivateErro ) {
		throw new Error(
			'Nova versão gravada, mas falha ao inativar o produto anterior no legado.',
		)
	}
	return indice
}

/** Strips internal fields before Strapi sync. */
export function toStrapiSyncProduto(
	payload: ProdutoSavePayload,
	prodId: number,
): Record<string, unknown> {
	const { _calcCaixa: _omit, ...rest } = payload
	void _omit
	return { ...rest, prodId }
}

/** Active legacy products with numeric prodId for Strapi sync. */
export function mapLegacyProductsForSync(
	products: unknown[],
): Array<Record<string, unknown> & { prodId: number }> {
	return products
		.filter( ( p ): p is Record<string, unknown> => !!p && typeof p === 'object' )
		.filter( ( p ) => String( p.ativo ) === '1' )
		.map( ( p ) => ( {
			...p,
			prodId: Number( p.prodId ?? p.indice ),
		} ) )
		.filter( ( p ) => Number.isFinite( p.prodId ) && p.prodId > 0 )
}
