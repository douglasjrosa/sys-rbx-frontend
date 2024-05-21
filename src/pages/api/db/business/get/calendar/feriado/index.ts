import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

export default async function GetEmpresa (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method === "GET" ) {
		const token = process.env.ATORIZZATION_TOKEN
		await axios
			.get( `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/feriados`, {
				headers: {
					Authorization: `Bearer ${ token }`,
					"Content-Type": "application/json",
				},
			} )
			.then( ( Response: any ) => {
				res.status( 200 ).json( Response.data.data )
			} )
			.catch( ( error: any ) => {
				console.error( error )
				res.status( 400 ).json( error )
			} )
	} else {
		res.status( 405 ).json( { message: "Only GET requests are allowed" } )
	}
}
