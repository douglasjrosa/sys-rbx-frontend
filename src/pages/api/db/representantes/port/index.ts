/* eslint-disable no-undef */
import { LogEmpresa } from "@/pages/api/lib/logEmpresa"
import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

export default async function GetEmpresa (
	req: NextApiRequest,
	res: NextApiResponse
) {
	const token = process.env.ATORIZZATION_TOKEN
	if ( req.method === "POST" ) {
		const data = req.body
		const cnpj: any = req.query.cnpj
		const USER: any = req.query.USER

		const url = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/representantes`

		await axios( url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${ token }`,
				"Content-Type": "application/json",
			},
			data: data,
		} )
			.then( ( RequestEnpresa ) => {
				res.status( 200 ).json( RequestEnpresa.data.data )
			} )
			.catch( ( error ) => {
				res.status( 400 ).json( error )
			} )

		await axios( {
			method: 'GET',
			url:
				process.env.NEXT_PUBLIC_STRAPI_API_URL +
				`/empresas?&populate=*&filters[CNPJ][$eq]=${ cnpj }`,
			headers: {
				Authorization: `Bearer ${ token }`,
				'Content-Type': 'application/json',
			},
		} )
			.then( async ( Response ) => {

				await LogEmpresa( Response.data.data, "PUT", USER )
			} )
			.catch( ( err ) => {

				console.error( {
					error: err.response?.data,
					mensage: err.response?.data.error,
					detalhe: err.response?.data.error?.details,
				} )
			} )

	} else {
		return res.status( 405 ).send( { message: "Only POST requests are allowed" } )
	}
}
