/* eslint-disable no-undef */
import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function getId ( req: NextApiRequest, res: NextApiResponse ) {
	if ( req.method === 'POST' ) {
		const token = process.env.ATORIZZATION_TOKEN
		const { CNPJ } = req.body

		const data = req.body

		await axios( {
			method: 'POST',
			url:
				process.env.NEXT_PUBLIC_STRAPI_API_URL +
				'/empresas/?filters[CNPJ][$eq]=' +
				CNPJ,
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
				res.status( 400 ).json( {
					error: err.response.data,
					mensage: err.response.data.error,
					detalhe: err.response.data.error.details,
				} )
			} )
	} else {
		return res.status( 405 ).send( { message: 'Only POST requests are allowed' } )
	}
}
