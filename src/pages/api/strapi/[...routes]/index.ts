import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler ( req: NextApiRequest, res: NextApiResponse ) {
	try {
		const { cnpj, routes, ...params } = req.query
		
		if ( !Array.isArray( routes ) ) {
			res.status( 400 ).json( { error: 'Invalid "routes" parameter' } )
			return
		}
		
		const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL as string
		const strapiToken = process.env.ATORIZZATION_TOKEN
		
		const queryParams = new URLSearchParams()
		for ( const [ key, value ] of Object.entries( params ) ) {
			if ( value !== undefined ) {
				if ( Array.isArray( value ) ) {
					value.forEach( val => queryParams.append( key, val ) )
				} else {
					queryParams.append( key, value as string )
				}
			}
		}

		const queryString = queryParams.toString()
		const externalUrl = `${ strapiApiUrl }/${ routes.join( '/' ) }${ queryString ? '?' + queryString : '' }`

		let bodyData
		if ( [ 'POST', 'PUT', 'PATCH' ].includes( req.method as string ) ) {
			if ( req.body ) {
				try {
					bodyData = JSON.parse( req.body )
				} catch ( error ) {
					res.status( 400 ).json( { error: 'Invalid JSON in request body' } )
					return
				}
			}
		}

		const response = await fetch( externalUrl, {
			method: req.method as string,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${ strapiToken }`,
			},
			body: [ 'POST', 'PUT', 'PATCH' ].includes( req.method as string ) ? JSON.stringify( bodyData ) : null
		} )

		const responseData = await response.json()

		if ( !response.ok ) {
			res.status( response.status ).json( {
				errorMessage: `Request failed: ${ response.statusText }`,
				responseError: responseData
			} )
			return
		}

		res.status( response.status ).json( responseData )
	} catch ( error: any ) {
		console.error( 'Error in handler:', error )
		res.status( 500 ).json( { error: error.message || 'Internal Server Error' } )
	}
}
