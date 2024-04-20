import { NextApiRequest, NextApiResponse } from 'next'

export default function refresh ( req: NextApiRequest, res: NextApiResponse ) {
	const formData = JSON.parse( req.body )

	if (
		req.method === "POST"
		&& formData.hasOwnProperty( "client_id" )
		&& formData.hasOwnProperty( "client_secret" )
		&& formData.hasOwnProperty( "refresh_token" )
	) {
		const { refresh_token, client_id, client_secret } = formData
		const credentials = btoa( `${ client_id }:${ client_secret }` )
		
		const url = process.env.BLING_API_TOKEN_ENDPOINT as string
		fetch( url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Basic ${ credentials }`
			},
			body: JSON.stringify( {
				grant_type: 'refresh_token',
				refresh_token
			} )
		} )
			.then( response => response.json() )
			.then( data => res.status( 200 ).send( data ) )
			.catch( error => {
				console.error( 'Error:', error )
				res.status( 500 ).json( { error: 'Erro ao fazer requisição' } )
			} )
	} else {
		res.status( 400 ).json( { error: 'Parâmetros inválidos' } )
	}
}