import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

export default async function GetTabelasPorEmpresa (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method !== "GET" ) {
		return res.status( 405 ).send( { message: "Only GET requests are allowed" } )
	}

	const { empresaId } = req.query
	const token = process.env.ATORIZZATION_TOKEN

	const url =
		`${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/tabela-precos` +
		`?filters[empresa][id][$eq]=${ empresaId }` +
		`&sort=createdAt:desc` +
		`&populate=user` +
		`&pagination[limit]=20`

	try {
		const response = await axios.get( url, {
			headers: { Authorization: `Bearer ${ token }` },
		} )

		const tabelas = ( response.data?.data || [] ).map( ( item: any ) => ( {
			id: item.id,
			createdAt: item.attributes.createdAt,
			itensCount: Array.isArray( item.attributes.itens )
				? item.attributes.itens.length
				: 0,
			vendedor: item.attributes.user?.data?.attributes?.username || "",
		} ) )

		res.status( 200 ).json( tabelas )
	} catch ( error: any ) {
		console.error( "Error fetching tabelas-preco:", error?.response?.data || error )
		res.status( 500 ).json( {
			error: error?.response?.data || "Internal server error",
		} )
	}
}
