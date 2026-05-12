/* eslint-disable no-undef */
import { NextApiRequest, NextApiResponse } from "next"
import { PUT_Strapi } from "@/pages/api/lib/request_strapi/put"
import { LogEmpresa } from "@/pages/api/lib/logEmpresa"
import { getEmpresa } from "@/pages/api/db/empresas/atualizacao/functions/getEmpresa"
import axios from "axios"

/** Hobby plan caps serverless duration at 60s; Pro allows higher values. */
export const config = { maxDuration: 60 }

/** Parallel Strapi updates per batch (bounded to avoid overloading Strapi). */
const MIGRATE_CONCURRENCY = 4

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
				} catch {
					// Username stays empty; PUT still sends user id
				}
			}

			const results: Array<{ empresaId: unknown; success: boolean; data: unknown }> = []
			const errors: Array<{ empresaId: unknown; error: unknown }> = []

			for ( let i = 0; i < empresaIds.length; i += MIGRATE_CONCURRENCY ) {
				const chunk = empresaIds.slice( i, i + MIGRATE_CONCURRENCY )
				const chunkOutcomes = await Promise.all(
					chunk.map( async ( empresaId ) => {
						try {
							const dadosAtual = await getEmpresa( empresaId )
							await LogEmpresa( dadosAtual, "PUT", vendedorName || "Sistema" )
							const updateData = {
								data: {
									user: { id: Number( novoVendedorId ) },
									vendedor: novoVendedorUsername,
								},
							}
							const response = await PUT_Strapi( updateData, `/empresas/${ empresaId }` )
							return {
								ok: true as const,
								empresaId,
								data: response,
							}
						} catch ( error: any ) {
							return {
								ok: false as const,
								empresaId,
								error: error.response?.data || error.message || "Unknown error",
							}
						}
					} )
				)
				for ( const outcome of chunkOutcomes ) {
					if ( outcome.ok ) {
						results.push( {
							empresaId: outcome.empresaId,
							success: true,
							data: outcome.data,
						} )
					} else {
						errors.push( {
							empresaId: outcome.empresaId,
							error: outcome.error,
						} )
					}
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
			res.status( 500 ).json( {
				error: error.message || "Internal Server Error",
			} )
		}
	} else {
		return res.status( 405 ).send( { message: "Only POST requests are allowed" } )
	}
}
