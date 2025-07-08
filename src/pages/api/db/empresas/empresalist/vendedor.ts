/* eslint-disable no-undef */
import { GET_Strapi } from "@/pages/api/lib/request_strapi/get"
import { NextApiRequest, NextApiResponse } from "next"
import qs from "qs"

/**
 * GetEmpresaVendedor function to fetch empresas with vendedor from the API.
 *
 * @param req - The NextApiRequest object.
 * @param res - The NextApiResponse object.
 * @returns Promise<void>
 */
export default async function GetEmpresaVendedor (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> {
	if ( req.method === "GET" ) {
		try {
			const userId = req.query.userId || ""
			const page = parseInt( req.query.page as string ) || 1
			const filtroTexto = req.query.filtro || ""
			const pageSize = 50 // Número de itens por página

			// Definir filtros com base no userId e texto de filtro
			let filters: any = {}

			if ( userId === "" ) {
				// Se userId for vazio, retornar todas as empresas com vendedor
				filters = {
					user: {
						id: { $notNull: true }
					}
				}
			} else {
				// Filtro específico para empresas do vendedor atual
				filters = {
					user: {
						id: { $eq: userId }
					}
				}
			}

			// Adicionar filtro por nome se houver texto de busca
			if ( filtroTexto ) {
				filters.nome = {
					$containsi: filtroTexto
				}
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
					pageSize
				},
				filters
			}

			const url = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/empresas?${ qs.stringify( queryParams ) }`

			const response = await GET_Strapi( url )
			res.status( 200 ).json( response )
		} catch ( error ) {
			res.status( 400 ).json( error )
		}
	} else {
		return res.status( 405 ).send( { message: "Only GET requests are allowed" } )
	}
} 