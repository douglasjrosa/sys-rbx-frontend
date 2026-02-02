/* eslint-disable no-undef */
import { GET_Strapi } from "@/pages/api/lib/request_strapi/get"
import { NextApiRequest, NextApiResponse } from "next"
import qs from "qs"

/**
 * GetEmpresa function to fetch empresa data from the API.
 *
 * @param req - The NextApiRequest object.
 * @param res - The NextApiResponse object.
 * @returns Promise<void>
 */
export default async function GetEmpresaAllMin (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> {
	if ( req.method === "GET" ) {
		try {
			const userId = req.query.userId || ""
			const page = req.query.page || "1"


			const queryParams = {
				sort: [ 'nome:asc' ],
				fields: [ 'nome' ],
				populate: {
					businesses: '*',
					interacaos: {
						fields: [ 'proxima', 'vendedor_name', 'status_atendimento' ]
					}
				},
				pagination: {
					limit: 50,
					page: page || 1
				},
				filters: {
					user: {
						id: { $eq: userId }
					}
				}
			}

			const url = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/empresas?${ qs.stringify( queryParams ) }`

			const response = await GET_Strapi( url )
			res.status( 200 ).json( response.data )
		} catch ( error ) {
			res.status( 400 ).json( error )
		}
	} else {
		return res.status( 405 ).send( { message: "Only GET requests are allowed" } )
	}
}
