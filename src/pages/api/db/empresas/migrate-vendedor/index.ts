/* eslint-disable no-undef */
import { NextApiRequest, NextApiResponse } from "next"
import { PUT_Strapi } from "@/pages/api/lib/request_strapi/put"
import { LogEmpresa } from "@/pages/api/lib/logEmpresa"
import { getEmpresa } from "@/pages/api/db/empresas/atualizacao/functions/getEmpresa"
import axios from "axios"

/**
 * Migrate empresas from one vendedor to another in bulk
 * 
 * @param req - The NextApiRequest object
 * @param res - The NextApiResponse object
 * @returns Promise<void>
 */
export default async function MigrateVendedor (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> {
	if ( req.method === "POST" ) {
		try {
			const { empresaIds, novoVendedorId, vendedorName } = req.body

			if ( !empresaIds || !Array.isArray( empresaIds ) || empresaIds.length === 0 ) {
				return res.status( 400 ).json( { error: "empresaIds must be a non-empty array" } )
			}

			if ( !novoVendedorId ) {
				return res.status( 400 ).json( { error: "novoVendedorId is required" } )
			}

			// Get user data to get username
			const token = process.env.ATORIZZATION_TOKEN
			let novoVendedorUsername = vendedorName || ""

			if ( !novoVendedorUsername ) {
				try {
					const userResponse = await axios.get(
						`${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/users/${ novoVendedorId }`,
						{
							headers: {
								Authorization: `Bearer ${ token }`,
								"Content-Type": "application/json",
							},
						}
					)
					// Strapi v4 returns data directly, v3 might wrap it
					novoVendedorUsername = userResponse.data?.username || userResponse.data?.data?.username || ""
				} catch ( error ) {
					console.error( "Error fetching user:", error )
				}
			}

			const results = []
			const errors = []

			// Update each empresa
			for ( const empresaId of empresaIds ) {
				try {
					// Get current empresa data for logging
					const dadosAtual = await getEmpresa( empresaId )

					// Log the change
					await LogEmpresa( dadosAtual, "PUT", vendedorName || "Sistema" )

					// Update empresa with new vendedor
					const updateData = {
						data: {
							user: {
								id: Number( novoVendedorId ),
							},
							vendedor: novoVendedorUsername,
						},
					}

					const urlStrapi = `/empresas/${ empresaId }`
					const response = await PUT_Strapi( updateData, urlStrapi )

					results.push( {
						empresaId,
						success: true,
						data: response,
					} )
				} catch ( error: any ) {
					console.error( `Error updating empresa ${ empresaId }:`, error )
					errors.push( {
						empresaId,
						error: error.response?.data || error.message || "Unknown error",
					} )
				}
			}

			res.status( 200 ).json( {
				success: errors.length === 0,
				updated: results.length,
				failed: errors.length,
				results,
				errors,
			} )
		} catch ( error: any ) {
			console.error( "Error in MigrateVendedor:", error )
			res.status( 500 ).json( {
				error: error.message || "Internal Server Error",
			} )
		}
	} else {
		return res.status( 405 ).send( { message: "Only POST requests are allowed" } )
	}
}
