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

		let url = `/produtos?pagination[limit]=1000&sort[0]=prodId:desc`
		url += `&fields[0]=nomeProd&fields[1]=modelo&fields[2]=altura`
		url += `&fields[3]=comprimento&fields[4]=largura&fields[5]=vFinal`
		url += `&fields[6]=prodId&fields[7]=codigo&fields[8]=lastChange`
		url += `&fields[9]=lastUser&fields[10]=titulo&fields[11]=tablecalc`
		url += `&fields[12]=pesoCx&fields[13]=ncm&fields[14]=ativo&fields[15]=custoMp`
		
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
			empresa: "",
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
