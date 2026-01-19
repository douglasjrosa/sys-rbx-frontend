import axios from "axios"

/**
 * Calculate difference in months between two dates
 */
function calcularDiferencaEmMeses ( data1: Date, data2: Date ): number {
	const anos = data2.getFullYear() - data1.getFullYear()
	const meses = data2.getMonth() - data1.getMonth()
	return anos * 12 + meses
}

/**
 * Add days to a date and return as ISO string (YYYY-MM-DD)
 */
function adicionarDias ( data: Date, dias: number ): string {
	const novaData = new Date( data )
	novaData.setDate( novaData.getDate() + dias )
	return novaData.toISOString().slice( 0, 10 )
}

/**
 * Add months to a date and return as ISO string (YYYY-MM-DD)
 */
function adicionarMeses ( data: Date, meses: number ): string {
	const novaData = new Date( data )
	novaData.setMonth( novaData.getMonth() + meses )
	return novaData.toISOString().slice( 0, 10 )
}

/**
 * Calculate expiresIn based on purchaseFrequency from current date
 * Returns ISO date string (YYYY-MM-DD)
 */
export function calculateExpiresInFromFrequency ( purchaseFrequency: string | null ): string | null {
	if ( !purchaseFrequency ) {
		return null
	}

	const dataAtual = new Date()

	if ( purchaseFrequency === "Raramente" ) {
		// 365 days (12 months)
		return adicionarMeses( dataAtual, 12 )
	} else if ( purchaseFrequency === "Eventualmente" ) {
		// 60 days
		return adicionarDias( dataAtual, 60 )
	} else if ( purchaseFrequency === "Mensalmente" ) {
		// 40 days
		return adicionarDias( dataAtual, 40 )
	}

	return null
}

/**
 * Build empresa API base URL
 */
function getEmpresaBaseUrl ( empresaId: string ): string {
	return `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/empresas/${ empresaId }`
}

/**
 * Build axios request headers
 */
function buildHeaders ( token: string ): Record<string, string> {
	return {
		Authorization: `Bearer ${ token }`,
		"Content-Type": "application/json",
	}
}

interface UpdateEmpresaPurchaseParams {
	empresaId: string
	dataCompra: string // ISO date string (YYYY-MM-DD)
	valorCompra: string | null
	token: string
}

/**
 * Update empresa purchase data (ultima_compra, penultima_compra, purchaseFrequency, expiresIn)
 * This function is called when a business is won (andamento=5 and etapa=6)
 */
export async function updateEmpresaPurchase ( {
	empresaId,
	dataCompra,
	valorCompra,
	token,
}: UpdateEmpresaPurchaseParams ): Promise<void> {
	try {
		// Fetch current empresa data
		const empresaResponse = await axios.get(
			`${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/empresas/${ empresaId }?fields[0]=ultima_compra&fields[1]=penultima_compra&fields[2]=purchaseFrequency&fields[3]=expiresIn`,
			{ headers: buildHeaders( token ) }
		)

		const empresaData = empresaResponse.data.data?.attributes || {}
		const {
			ultima_compra: currentUltimaCompra,
			penultima_compra: currentPenultimaCompra,
			purchaseFrequency: currentPurchaseFrequency,
			expiresIn: currentExpiresIn,
		} = empresaData

		const update: any = {}

		// Update ultima_compra and penultima_compra
		// New purchase becomes ultima_compra, old ultima_compra becomes penultima_compra
		if ( currentUltimaCompra && currentUltimaCompra !== dataCompra ) {
			update.penultima_compra = currentUltimaCompra
		}
		update.ultima_compra = dataCompra

		// Update valor_ultima_compra if provided
		if ( valorCompra !== null && valorCompra !== undefined ) {
			update.valor_ultima_compra = valorCompra
		}

		// Calculate purchase frequency based on date comparison
		const novaUltimaCompra = dataCompra
		const novaPenultimaCompra = currentUltimaCompra && currentUltimaCompra !== dataCompra
			? currentUltimaCompra
			: currentPenultimaCompra

		const temUltimaCompra = novaUltimaCompra && novaUltimaCompra !== ""
		const temPenultimaCompra = novaPenultimaCompra && novaPenultimaCompra !== ""

		// Step 1: Define purchaseFrequency based on date comparison
		if ( !temUltimaCompra || !temPenultimaCompra ) {
			// Rule 1: No records of both dates
			update.purchaseFrequency = "Raramente"
		} else {
			const dataUltima = new Date( novaUltimaCompra )
			const dataPenultima = new Date( novaPenultimaCompra )
			const diferencaMeses = calcularDiferencaEmMeses( dataPenultima, dataUltima )

			// Rule 2: Difference > 12 months
			if ( diferencaMeses > 12 ) {
				update.purchaseFrequency = "Raramente"
			}
			// Rule 3: Difference between 2 and 12 months
			else if ( diferencaMeses >= 2 && diferencaMeses <= 12 ) {
				update.purchaseFrequency = "Eventualmente"
			}
			// Rule 4: Difference < 2 months
			else if ( diferencaMeses < 2 ) {
				update.purchaseFrequency = "Mensalmente"
			}
		}

		// Step 2: Define expiresIn based on purchaseFrequency
		if ( temUltimaCompra ) {
			const dataUltima = new Date( novaUltimaCompra )

			if ( update.purchaseFrequency === "Raramente" ) {
				// Rule: If Raramente, expiresIn = ultima_compra + 12 months
				update.expiresIn = adicionarMeses( dataUltima, 12 )
			} else if ( update.purchaseFrequency === "Eventualmente" ) {
				// Rule: Set expiresIn (60 days after ultima_compra)
				update.expiresIn = adicionarDias( dataUltima, 60 )
			} else if ( update.purchaseFrequency === "Mensalmente" ) {
				// Rule: Set expiresIn (40 days after ultima_compra)
				update.expiresIn = adicionarDias( dataUltima, 40 )
			}
		}

		// Update empresa
		await axios.put(
			getEmpresaBaseUrl( empresaId ),
			{ data: update },
			{ headers: buildHeaders( token ) }
		)

		console.log( `Updated empresa ${ empresaId } purchase data:`, update )
	} catch ( error: any ) {
		console.error( `Error updating empresa ${ empresaId } purchase data:`, error.response?.data || error.message )
		// Don't throw - this is a background operation and shouldn't fail the business update
	}
}
