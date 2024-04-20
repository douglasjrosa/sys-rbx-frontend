import { NextApiRequest, NextApiResponse } from "next"

export default function PUT (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method === "PUT" ) {
		try {
			const strapiToken = process.env.ATORIZZATION_TOKEN
			
			const data = JSON.parse( req.body )
			const { id } = data
			
			const strapiEndpoint = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/tokens/${id}`
			fetch( strapiEndpoint, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${ strapiToken }`,
				},
				body: JSON.stringify( { data } )
			} )
				.then( r => r.json() )
				.then( r => res.status( 200 ).json( r ) )
		} catch ( error ) {
			console.error( "Erro:", error )
			res.status( 500 ).json( { error: "Erro ao atualizar o token" } )
		}
	}
	else {
		res.status( 403 ).json( { error: "Método inadequado." } )
	}
}