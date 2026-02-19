import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

export default async function GetEmpresa (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method === "GET" ) {
		const token = process.env.ATORIZZATION_TOKEN
		await axios
			.get( `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/feriados?pagination[pageSize]=1000&publicationState=preview`, {
				headers: {
					Authorization: `Bearer ${ token }`,
					"Content-Type": "application/json",
				},
			} )
			.then( ( Response: any ) => {
				// Handle both Strapi v4 { data: [...] } and Strapi v3 [...] formats
				const data = Response.data?.data || (Array.isArray(Response.data) ? Response.data : [])
				res.status( 200 ).json( data )
			} )
			.catch( ( error: any ) => {
				console.error( 'Error fetching feriados:', error.response?.data || error.message )
				res.status( error.response?.status || 400 ).json( error.response?.data || error )
			} )
	} else {
		res.status( 405 ).json( { message: "Only GET requests are allowed" } )
	}
}
