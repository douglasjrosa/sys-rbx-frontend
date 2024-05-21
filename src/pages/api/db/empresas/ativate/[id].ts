/* eslint-disable no-undef */
import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function getId ( req: NextApiRequest, res: NextApiResponse ) {
	const { id } = req.query
	if ( req.method === 'PUT' ) {
		const token = process.env.ATORIZZATION_TOKEN
		const { cnpj } = req.body
		const update = {
			data: {
				status: true,
			},
		}

		await axios( {
			method: 'PUT',
			url: process.env.NEXT_PUBLIC_STRAPI_API_URL + '/empresas/' + id,
			data: update,
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

		const DataRbx = {
			CNPJ: cnpj,
			ativo: '1',
		}

		await axios( {
			method: 'post',
			url: process.env.RIBERMAX_API_URL + '/empresas',
			headers: {
				Email: process.env.ATORIZZATION_EMAIL,
				Token: process.env.ATORIZZATION_TOKEN_RIBERMAX,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			data: new URLSearchParams( DataRbx ).toString(),
		} )
			.then( ( response ) => {
			} )
			.catch( ( error ) => {
				console.error( error )
			} )
	} else {
		return res.status( 405 ).send( { message: 'Only GET requests are allowed' } )
	}
}
