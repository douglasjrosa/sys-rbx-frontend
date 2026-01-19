/* eslint-disable no-undef */
import { NextApiRequest, NextApiResponse } from "next"
import { GET_Strapi } from "@/pages/api/lib/request_strapi/get"
import { PUT_Strapi } from "@/pages/api/lib/request_strapi/put"
import qs from "qs"

/**
 * Script to sanitize CNAE field in all empresas
 * Removes all non-numeric characters from CNAE values
 */
export default async function SanitizeCNAE (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> {
	if ( req.method !== "POST" ) {
		return res.status( 405 ).json( { message: "Only POST requests are allowed" } )
	}

	try {
		const token = process.env.ATORIZZATION_TOKEN
		if ( !token ) {
			return res.status( 500 ).json( { error: "Authorization token not configured" } )
		}

		let page = 1
		let hasMorePages = true
		let totalUpdated = 0
		let totalProcessed = 0
		let errors: Array<{ empresaId: string; nome: string; error: string }> = []
		const updatedEmpresas: Array<{ id: string; nome: string; cnaeOriginal: string; cnaeSanitizado: string }> = []

		while ( hasMorePages ) {
			// Fetch empresas with pagination
			const queryParams = {
				fields: [ 'id', 'nome', 'CNAE' ],
				pagination: {
					page,
					pageSize: 100 // Process 100 empresas at a time
				},
				sort: [ 'id:asc' ]
			}

			const queryString = qs.stringify( queryParams, { encodeValuesOnly: true } )
			const url = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/empresas?${ queryString }`

			const response = await GET_Strapi( url )

			if ( !response || !response.data || response.data.length === 0 ) {
				hasMorePages = false
				break
			}

			const empresas = response.data
			const pagination = response.meta?.pagination

			// Process each empresa
			for ( const empresa of empresas ) {
				totalProcessed++

				try {
					const cnaeOriginal = empresa.attributes?.CNAE

					// Skip if CNAE is null, undefined, or empty
					if ( !cnaeOriginal || typeof cnaeOriginal !== 'string' || cnaeOriginal.trim() === '' ) {
						continue
					}

					// Sanitize CNAE: remove all non-numeric characters
					const cnaeSanitizado = cnaeOriginal.replace( /\D/g, '' )

					// Skip if sanitized CNAE is empty or same as original
					if ( !cnaeSanitizado || cnaeSanitizado === cnaeOriginal ) {
						continue
					}

					// Update empresa in Strapi
					const updateUrl = `/empresas/${ empresa.id }`
					const updateData = {
						data: {
							CNAE: cnaeSanitizado
						}
					}

					await PUT_Strapi( updateData, updateUrl )

					totalUpdated++
					updatedEmpresas.push( {
						id: empresa.id,
						nome: empresa.attributes?.nome || 'Sem nome',
						cnaeOriginal,
						cnaeSanitizado
					} )

				} catch ( error: any ) {
					errors.push( {
						empresaId: empresa.id,
						nome: empresa.attributes?.nome || 'Sem nome',
						error: error.message || 'Erro desconhecido'
					} )
					console.error( `Erro ao processar empresa ${ empresa.id }:`, error )
				}
			}

			// Check if there are more pages
			if ( pagination ) {
				hasMorePages = page < pagination.pageCount
				page++
			} else {
				hasMorePages = false
			}
		}

		return res.status( 200 ).json( {
			success: true,
			summary: {
				totalProcessed,
				totalUpdated,
				totalErrors: errors.length
			},
			updatedEmpresas: updatedEmpresas.slice( 0, 100 ), // Return first 100 for preview
			errors: errors.slice( 0, 50 ) // Return first 50 errors
		} )

	} catch ( error: any ) {
		console.error( "Erro ao sanitizar CNAE:", error )
		return res.status( 500 ).json( {
			error: "Erro ao sanitizar CNAE",
			message: error.message || "Erro desconhecido",
			details: error.response?.data || error
		} )
	}
}
