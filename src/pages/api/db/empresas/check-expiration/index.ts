import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

interface Empresa {
	id: string
	attributes: {
		nome: string | null
		expiresIn: string | null
		vendedorId: string | null
		vendedor: string | null
		user: { data: any } | null
	}
}

interface ProcessResult {
	empresaId: string
	success: boolean
	updates?: any
	companyName?: string | null
	expiresIn?: string | null
	vendedor?: string | null
	message?: string
	error?: any
}

const FIELDS_QUERY = "fields[0]=nome&fields[1]=expiresIn&fields[2]=vendedorId&fields[3]=vendedor&populate[user][fields][0]=username"

/**
 * Get empresa API base URL
 */
function getEmpresaBaseUrl ( empresaId: string ): string {
	return `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/empresas/${ empresaId }`
}

/**
 * Build empresa search URL
 */
function buildEmpresasUrl ( page: number, pageSize: number ): string {
	return `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/empresas?filters[status][$eq]=true&${ FIELDS_QUERY }&pagination[page]=${ page }&pagination[pageSize]=${ pageSize }`
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

/**
 * Build response object for empresa processing
 */
function buildResponse (
	empresaId: string,
	nome: string | null,
	expiresIn: string | null,
	vendedor: string | null,
	update?: any,
	message?: string
): ProcessResult {
	return {
		empresaId,
		success: true,
		...( update && { updates: update } ),
		...( message && { message } ),
		companyName: nome,
		expiresIn,
		vendedor,
	}
}

/**
 * Process a batch of empresas sequentially to avoid DB deadlocks on empresas_user_links.
 * Optional delayMs after each update to allow DB to release locks.
 */
async function processarLote (
	empresas: Empresa[],
	token: string,
	dataAtual: Date,
	delayMs: number = 150
): Promise<ProcessResult[]> {
	const resultados: ProcessResult[] = []

	for ( const empresa of empresas ) {
		try {
			const resultado = await processarEmpresa( empresa, token, dataAtual )
			resultados.push( resultado )
			// Delay after each update to avoid deadlocks on empresas_user_links
			if ( resultado.updates && delayMs > 0 ) {
				await new Promise( ( resolve ) => setTimeout( resolve, delayMs ) )
			}
		} catch ( error: any ) {
			resultados.push( {
				empresaId: empresa.id,
				success: false,
				error: error.response?.data || error.message || "Unknown error",
			} )
		}
	}

	return resultados
}

/**
 * Process a single empresa - only checks if expiresIn has passed and clears vendedor
 */
async function processarEmpresa (
	empresa: Empresa,
	token: string,
	dataAtual: Date
): Promise<ProcessResult> {
	const {
		nome,
		expiresIn,
		vendedor,
	} = empresa.attributes

	let update: any = {}
	let needsUpdate = false

	// Check if expiresIn has passed and vendedor needs to be cleared
	if ( expiresIn ) {
		const dataExpiracao = new Date( expiresIn )
		if ( dataAtual > dataExpiracao ) {
			// Rule: If expiresIn has passed, set vendedor to null
			update.vendedorId = null
			update.vendedor = null
			update.user = null
			needsUpdate = true
		}
	}

	// Determine final values after potential updates
	const vendedorFinal = update.vendedor !== undefined ? update.vendedor : vendedor

	// Update empresa if needed
	if ( needsUpdate ) {
		await axios.put(
			getEmpresaBaseUrl( empresa.id ),
			{ data: update },
			{ headers: buildHeaders( token ) }
		)
	}

	return buildResponse(
		empresa.id,
		nome,
		expiresIn,
		vendedorFinal,
		needsUpdate ? update : undefined,
		needsUpdate ? undefined : "No updates needed"
	)
}

/**
 * Split array into chunks
 */
function dividirEmLotes<T> ( array: T[], tamanhoLote: number ): T[][] {
	const lotes: T[][] = []
	for ( let i = 0; i < array.length; i += tamanhoLote ) {
		lotes.push( array.slice( i, i + tamanhoLote ) )
	}
	return lotes
}

/**
 * Check and update empresa vendedor expiration status
 * Only checks if expiresIn has passed and clears vendedor
 */
export default async function CheckExpiration (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> {
	if ( req.method !== "GET" ) {
		return res.status( 405 ).send( { message: "Only GET requests are allowed" } )
	}

	try {
		const token = process.env.ATORIZZATION_TOKEN
		if ( !token ) {
			return res.status( 500 ).json( {
				error: "Authorization token not configured",
			} )
		}

		const dataAtual = new Date()
		const tokenString: string = token
		const tamanhoLote = parseInt( req.query.batchSize as string ) || 50
		const delayMs = Math.max( 0, parseInt( req.query.delayMs as string ) || 150 )
		const limit = parseInt( req.query.pageSize as string ) || 100
		const page = parseInt( req.query.page as string ) || 1

		// Fetch the requested page
		const response = await axios.get(
			buildEmpresasUrl( page, limit ),
			{ headers: buildHeaders( tokenString ) }
		)

		const paginacao = response.data.meta?.pagination || {}
		const totalEmpresas = paginacao.total || 0
		const empresas: Empresa[] = response.data.data

		const results: ProcessResult[] = []
		const errors: ProcessResult[] = []

		if ( empresas.length > 0 ) {
			// Divide empresas into batches
			const lotes = dividirEmLotes( empresas, tamanhoLote )

			// Process each batch sequentially (no concurrency to avoid deadlocks)
			for ( let i = 0; i < lotes.length; i++ ) {
				const lote = lotes[ i ]

				const resultadosLote = await processarLote( lote, tokenString, dataAtual, delayMs )

				// Separate successes and errors
				resultadosLote.forEach( ( item: ProcessResult ) => {
					if ( item.success ) {
						results.push( item )
					} else {
						errors.push( item )
					}
				} )

				// Delay between batches to avoid DB lock contention
				if ( i < lotes.length - 1 ) {
					await new Promise( ( resolve ) => setTimeout( resolve, 200 ) )
				}
			}
		}

		res.status( 200 ).json( {
			success: errors.length === 0,
			total: totalEmpresas,
			count: empresas.length,
			updated: results.filter( ( r ) => r.updates ).length,
			noChanges: results.filter( ( r ) => !r.updates ).length,
			failed: errors.length,
			results,
			errors,
			pagination: paginacao,
			batchSize: tamanhoLote,
			delayMs,
		} )
	} catch ( err: any ) {
		console.error( "Error in CheckExpiration:", err )
		res.status( 500 ).json( {
			error: err.response?.data || err.message || "Internal Server Error",
		} )
	}
}
