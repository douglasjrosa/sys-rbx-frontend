/* eslint-disable no-undef */
import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

export default async function GetEmpresa (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method === "GET" ) {
		const token = process.env.ATORIZZATION_TOKEN
		const Vendedor = req.query.Vendedor
		const EMPRESAS = req.query.EMPRESAS

		const url = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/empresas?filters[status][$eq]=true&sort[0]=nome%3Aasc&fields[0]=nome&fields[1]=interacaos&populate[user][fields][0]=username`

		await axios( url, {
			headers: {
				Authorization: `Bearer ${ token }`,
				"Content-Type": "application/json",
			},
		} )
			.then( ( RequestEnpresa: any ) => {
				res.status( 200 ).json( RequestEnpresa.data.data )

			} )
			.catch( ( error: any ) => {
				res.status( 400 ).json( error )
			} )
	} else {
		return res.status( 405 ).send( { message: "Only GET requests are allowed" } )
	}
}
