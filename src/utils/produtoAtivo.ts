/** Legacy produto ativo flag (EAV valor = "1" | "0"). */
export function isProdutoAtivo( ativo: unknown ): boolean {
	if ( ativo === undefined || ativo === null ) {
		return true
	}
	if ( typeof ativo === 'boolean' ) {
		return ativo
	}
	return String( ativo ) === '1'
}
