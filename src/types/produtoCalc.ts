/** Legacy save payload from calc (includes _calcCaixa for atividades, no indice). */
export type ProdutoSavePayload = Record<string, unknown> & {
	_calcCaixa?: unknown
}

export type ProdutoCalcInfo = ProdutoSavePayload & {
	vFinal?: number
	preco?: number
	pesoCx?: number
	titulo?: string
}
