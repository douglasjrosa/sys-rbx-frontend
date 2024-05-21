/* eslint-disable no-undef */
import { GET_Strapi } from "@/pages/api/lib/request_strapi/get"
import { NextApiRequest, NextApiResponse } from "next"

export default async function GetEmpresa (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method === "GET" ) {
		try {
			const cnpj = req.query.CNPJ
			const Url = `/log-empresas?filters[CNPJ][$eq]=${ cnpj }`
			const response = await GET_Strapi( Url )
			res.status( 200 ).json( response.data )
		} catch ( error ) {
			console.error( error )
			res.status( 400 ).json( error )
		}
	} else {
		return res.status( 405 ).send( { message: "Only GET requests are allowed" } )
	}
}
