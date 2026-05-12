/**
 * Builds a safe string for Chakra toast descriptions from axios/API errors.
 * Prevents React error #31 when the API returns `error` as an object (e.g. 504 bodies).
 */
export function getToastErrorMessage ( err: unknown, fallback: string ): string {
	const ax = err as { response?: { status?: number; data?: unknown }; message?: string }
	if ( ax?.response?.status === 504 ) {
		return (
			'Tempo limite excedido. Tente novamente em alguns instantes ou migre menos empresas por vez.'
		)
	}
	const d = ax?.response?.data
	if ( typeof d === 'string' ) return d
	if ( typeof ( d as { error?: unknown } )?.error === 'string' ) {
		return ( d as { error: string } ).error
	}
	const errObj = ( d as { error?: { message?: string }; message?: string } )?.error
	if ( errObj && typeof errObj === 'object' && typeof errObj.message === 'string' ) {
		return errObj.message
	}
	if ( typeof ( d as { message?: string } )?.message === 'string' ) {
		return ( d as { message: string } ).message
	}
	return ax?.message || fallback
}
