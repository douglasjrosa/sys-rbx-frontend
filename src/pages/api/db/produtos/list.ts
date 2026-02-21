import { GET_Strapi } from "@/pages/api/lib/request_strapi/get"
import { NextApiRequest, NextApiResponse } from "next"

export const config = { maxDuration: 60 }

export default async function ListProdutos (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> {
	if ( req.method !== "GET" ) {
		return res.status( 405 ).send( { message: "Only GET requests are allowed" } )
	}

	try {
		const { empresaId, cnpj } = req.query

		if ( !empresaId && !cnpj ) {
			return res.status( 400 ).json( { error: "empresaId or cnpj is required" } )
		}

		let url = `/produtos?pagination[limit]=1000&populate=*&sort[0]=prodId:desc`
		
		if ( empresaId ) {
			url += `&filters[empresa][id][$eq]=${ empresaId }`
		} else if ( cnpj ) {
			url += `&filters[empresa][CNPJ][$eq]=${ cnpj }`
		}

		const response = await GET_Strapi( url )

		// Map Strapi response to the structure expected by the frontend
		const products = response.data.map( ( item: any ) => ( {
			id: item.id,
			...item.attributes,
			empresa: item.attributes.empresa?.data?.attributes?.nome || "",
			// Map tablecalc back to what frontend expects if needed, 
			// though we already updated the frontend to use tablecalc
		} ) )

		res.status( 200 ).json( products )
	} catch ( error: any ) {
		console.error( "Error in ListProdutos proxy:", error?.response?.data || error.message )

		res.status( error?.response?.status || 400 ).json( {
			error: error?.response?.data?.error || error.message || "Unknown error"
		} )
	}
}
