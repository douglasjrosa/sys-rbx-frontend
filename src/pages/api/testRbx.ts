import { NextApiRequest, NextApiResponse } from 'next'
import { PostLoteRibermmax } from './db/nLote/lib/postLoteRibermax'

export default async function handler ( req: NextApiRequest, res: NextApiResponse ) {
	try {
		const resp = await PostLoteRibermmax( "2106" )

		res.status( 201 ).json( resp )
	} catch ( error ) {
		res.status( 500 ).json( { message: 'Error al obtener el lote' } )
	}
}