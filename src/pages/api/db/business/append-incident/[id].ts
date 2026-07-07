import { NextApiRequest, NextApiResponse } from 'next'
import { appendIncidentRecords } from '../../lib/businesses'

export default async function AppendIncidentHandler (
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if ( req.method !== 'POST' ) {
		return res.status( 405 ).json( { message: 'Only POST requests are allowed' } )
	}

	const { id } = req.query
	if ( !id || Array.isArray( id ) ) {
		return res.status( 400 ).json( { message: 'Invalid business id' } )
	}

	const body = typeof req.body === 'string'
		? JSON.parse( req.body )
		: req.body

	const entries = Array.isArray( body?.entries )
		? body.entries
		: body?.entry
			? [ body.entry ]
			: []

	if ( entries.length === 0 ) {
		return res.status( 400 ).json( { message: 'No incident entries provided' } )
	}

	try {
		await appendIncidentRecords( id, entries )
		return res.status( 200 ).json( { ok: true } )
	} catch ( error ) {
		const message = error instanceof Error ? error.message : 'Unknown error'
		return res.status( 500 ).json( { message } )
	}
}
