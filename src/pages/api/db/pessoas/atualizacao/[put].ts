/* eslint-disable no-undef */
import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function GetEmpresa (
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const id = req.query.put
	const data = req.body
	if ( req.method === 'PUT' ) {
		const token = process.env.ATORIZZATION_TOKEN

		await axios( {
			method: 'PUT',
			url: process.env.NEXT_PUBLIC_STRAPI_API_URL + '/pessoas/' + id,
			data: data,
			headers: {
				Authorization: `Bearer ${ token }`,
				'Content-Type': 'application/json',
			},
		} )
			.then( ( Response ) => {
				res.status( 200 ).json( Response.data )
			} )
			.catch( ( err ) => {
				console.error( err.response.data )
				res.status( 400 ).json( {
					error: err.response.data,
					mensage: err.response.data.error,
					detalhe: err.response.data.error.details,
				} )
			} )
	} else {
		return res.status( 405 ).send( { message: 'Only PUT requests are allowed' } )
	}
}
