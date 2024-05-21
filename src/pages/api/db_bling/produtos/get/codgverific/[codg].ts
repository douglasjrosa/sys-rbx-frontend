/* eslint-disable no-undef */
import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function Get ( req: NextApiRequest, res: NextApiResponse ) {
	const token = process.env.ATORIZZATION_TOKEN_BLING
	if ( req.method === 'GET' ) {
		const codg = req.query.codg
		const url = process.env.BLING_API_URL + `/produto/${ codg }/json/`
		await axios( {
			method: 'GET',
			url: url,
			params: {
				apikey: token,
			},
		} )
			.then( ( response ) => {
				const SimplesResponse = response.data.retorno
				if ( SimplesResponse.produtos ) {
					res.status( 200 ).send( true )
				}
				if ( SimplesResponse.erros ) {
					res.status( 200 ).send( false )
				}
			} )
			.catch( ( err ) => {
				res.status( 400 ).json( err )
			} )
	} else {
		return res.status( 405 ).send( { message: 'Only GET requests are allowed' } )
	}
}
