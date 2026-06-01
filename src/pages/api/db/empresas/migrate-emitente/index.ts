import { NextApiRequest, NextApiResponse } from "next"
import { requireAdminSession } from "../../tokens/lib/requireAdmin"
import {
	buildMigrationBatches,
	EMITENTE_MIGRATION_BATCH_SIZE,
	fetchPendingClientIds,
	migrateEmpresaEmitenteBatch,
} from "./lib/emitenteMigration"

export default async function handler (
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await requireAdminSession( req, res )
	if ( !session ) return

	if ( req.method === "GET" ) {
		try {
			const pendingIds = await fetchPendingClientIds()
			const batches = buildMigrationBatches( pendingIds )

			return res.status( 200 ).json( {
				totalPending: pendingIds.length,
				batchSize: EMITENTE_MIGRATION_BATCH_SIZE,
				batches,
			} )
		} catch ( error: unknown ) {
			const message = error instanceof Error
				? error.message
				: "Internal Server Error"
			return res.status( 500 ).json( { message } )
		}
	}

	if ( req.method === "POST" ) {
		try {
			const body = typeof req.body === "string"
				? JSON.parse( req.body )
				: req.body

			const empresaIds = Array.isArray( body?.empresaIds )
				? body.empresaIds.map( ( id: unknown ) => Number( id ) ).filter(
					( id: number ) => Number.isFinite( id )
				)
				: []

			if ( !empresaIds.length ) {
				return res.status( 400 ).json( {
					message: "empresaIds array is required",
				} )
			}

			if ( empresaIds.length > EMITENTE_MIGRATION_BATCH_SIZE ) {
				return res.status( 400 ).json( {
					message: `Maximum ${ EMITENTE_MIGRATION_BATCH_SIZE } companies per batch`,
				} )
			}

			const result = await migrateEmpresaEmitenteBatch( empresaIds )
			return res.status( 200 ).json( result )
		} catch ( error: unknown ) {
			const message = error instanceof Error
				? error.message
				: "Internal Server Error"
			return res.status( 500 ).json( { message } )
		}
	}

	return res.status( 405 ).json( { message: "Method not allowed" } )
}
