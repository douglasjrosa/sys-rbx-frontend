function getInternalBaseUrl (): string {
	const url =
		process.env.NEXT_PUBLIC_BASE_URL ||
		( process.env.NEXT_PUBLIC_VERCEL_URL
			? `https://${ process.env.NEXT_PUBLIC_VERCEL_URL }`
			: 'http://localhost:3000' )
	if ( process.env.NODE_ENV === 'development' && url.includes( 'localhost' ) ) {
		return url.replace( /^https:/, 'http:' )
	}
	return url
}

function encodeBlingAccountCnpj ( cnpj: string ): string {
	return encodeURIComponent( cnpj )
}

export async function resolveBlingSalesOrderId (
	blingAccountCnpj: string,
	storedBpedido: string | null | undefined,
	propostaId: string | number | null | undefined,
): Promise<number | null> {
	if ( storedBpedido ) {
		const parsed = Number( storedBpedido )
		if ( !Number.isNaN( parsed ) && parsed > 0 ) {
			return parsed
		}
	}

	if ( propostaId == null || propostaId === '' ) {
		return null
	}

	const baseUrl = getInternalBaseUrl()
	const account = encodeBlingAccountCnpj( blingAccountCnpj )
	const response = await fetch(
		`${ baseUrl }/api/bling/${ account }/pedidos/vendas?numero=${ propostaId }`,
	)

	if ( !response.ok ) {
		return null
	}

	const data = await response.json()
	return data?.data?.[ 0 ]?.id ?? null
}

export async function deleteBlingSalesOrder (
	blingAccountCnpj: string,
	blingOrderId: number,
): Promise<{ ok: boolean; notFound?: boolean; error?: string }> {
	const baseUrl = getInternalBaseUrl()
	const account = encodeBlingAccountCnpj( blingAccountCnpj )
	const response = await fetch(
		`${ baseUrl }/api/bling/${ account }/pedidos/vendas/${ blingOrderId }`,
		{ method: 'DELETE' },
	)

	if ( response.status === 404 ) {
		return { ok: true, notFound: true }
	}

	if ( !response.ok ) {
		let errorMessage = response.statusText
		try {
			const data = await response.json()
			errorMessage =
				data?.errorMessage ||
				data?.responseError?.error?.message ||
				data?.error ||
				errorMessage
		} catch {
			/* ignore parse errors */
		}
		return { ok: false, error: errorMessage }
	}

	return { ok: true }
}
