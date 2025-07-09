/* eslint-disable no-undef */
import { GET_Strapi } from "@/pages/api/lib/request_strapi/get"
import { NextApiRequest, NextApiResponse } from "next"
import qs from "qs"

/**
 * GetEmpresaAusente function to fetch empresas without vendedor from the API.
 *
 * @param req - The NextApiRequest object.
 * @param res - The NextApiResponse object.
 * @returns Promise<void>
 */
export default async function GetEmpresaAusente (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> {
	if ( req.method === "GET" ) {
		try {
			const page = parseInt( req.query.page as string ) || 1
			const filtro = req.query.filtro as string || ""

			// Filtros para empresas sem vendedor ou não pertencentes ao usuário atual
			const filters = {
				user: {
					id: { $notNull: false }
				},
				...( filtro && {
					nome: {
						$containsi: filtro
					}
				} )
			}

			const queryParams = {
				sort: [ 'nome:asc' ],
				fields: [ 'nome' ],
				populate: {
					businesses: '*',
					interacaos: {
						fields: [ 'proxima', 'vendedor_name', 'status_atendimento' ]
					},
					user: {
						fields: [ 'username' ]
					}
				},
				pagination: {
					page,
					pageSize: 50
				},
				filters
			}

			const url = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/empresas?${ qs.stringify( queryParams ) }`

			const response = await GET_Strapi( url )
			res.status( 200 ).json( {
				data: response.data,
				meta: {
					pagination: {
						page,
						pageSize: 50,
						pageCount: Math.ceil( response.meta.pagination.total / 50 ),
						total: response.meta.pagination.total
					}
				}
			} )
		} catch ( error ) {
			res.status( 400 ).json( error )
		}
	} else {
		return res.status( 405 ).send( { message: "Only GET requests are allowed" } )
	}
} 