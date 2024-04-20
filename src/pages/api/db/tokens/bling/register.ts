import { NextApiRequest, NextApiResponse } from "next"

export default function POST (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method === "POST" ) {
		try {
			const strapiToken = process.env.ATORIZZATION_TOKEN
			const strapiEndpoint = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/tokens`

			const data = JSON.parse( req.body )

			fetch( strapiEndpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${ strapiToken }`,
				},
				body: JSON.stringify( data )
			} )
				.then( r => r.json() )
				.then( r => res.status( 200 ).json( r ) )
		} catch ( error ) {
			console.error( "Erro:", error )
			res.status( 500 ).json( { error: "Erro ao registrar o token" } )
		}
	}
	else {
		res.status( 403 ).json( { error: "Método inadequado." } )
	}
}