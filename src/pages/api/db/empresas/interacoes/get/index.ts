/* eslint-disable no-undef */
import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

const PAGE_SIZE = 20

export default async function GetEmpresa (
	req: NextApiRequest,
	res: NextApiResponse
) {
	const token = process.env.ATORIZZATION_TOKEN
	if ( req.method === "GET" && req.query.Vendedor !== "" ) {
		const Vendedor = req.query.Vendedor
		const EmpresaId = req.query.EmpresaId
		const page = Math.max( 1, parseInt( String( req.query.page || "1" ), 10 ) )

		if ( !EmpresaId ) {
			return res.status( 400 ).json( { message: "EmpresaId is required" } )
		}

		const paginationParams = `pagination[page]=${ page }&pagination[pageSize]=${ PAGE_SIZE }&pagination[withCount]=true`
		const sortParam = "sort[0]=createdAt:desc"
		const url = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/interacoes?filters[vendedor][username][$containsi]=${ Vendedor }&filters[empresa][id][$eq]=${ EmpresaId }&${ paginationParams }&${ sortParam }&populate=*`

		await axios( url, {
			headers: {
				Authorization: `Bearer ${ token }`,
				"Content-Type": "application/json",
			},
		} )
			.then( ( RequestEnpresa ) => {
				const strapiData = RequestEnpresa.data
				const data = Array.isArray( strapiData?.data ) ? strapiData.data : []
				const meta = strapiData?.meta?.pagination || {}
				res.status( 200 ).json( {
					data,
					pagination: {
						page: meta.page ?? page,
						pageSize: meta.pageSize ?? PAGE_SIZE,
						pageCount: meta.pageCount ?? 1,
						total: meta.total ?? data.length,
					},
				} )

			} )
			.catch( ( error ) => {
				console.error( error )

				res.status( 400 ).json( error )
			} )
	} else {
		if ( req.method !== "GET" ) {
			return res
				.status( 405 )
				.send( { message: "Only GET requests are allowed" } )
		} else {
			return res.status( 500 ).send( { message: "falta vendedor" } )
		}
	}
}
