import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler ( req: NextApiRequest, res: NextApiResponse ) {
	try {
		const { routes, ...params } = req.query

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

		let bodyData: unknown = undefined
		if ( [ 'POST', 'PUT', 'PATCH' ].includes( req.method as string ) ) {
			if ( req.body ) {
				if ( typeof req.body === 'string' ) {
					try {
						bodyData = JSON.parse( req.body )
					} catch ( error ) {
						res.status( 400 ).json( { error: 'Invalid JSON in request body' } )
						return
					}
				} else {
					bodyData = req.body
				}
			}
		}

		const method = req.method as string
		const hasWriteBody = [ 'POST', 'PUT', 'PATCH' ].includes( method )
		const response = await fetch( externalUrl, {
			method,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${ strapiToken }`,
			},
			body: hasWriteBody ? JSON.stringify( bodyData ?? {} ) : null,
		} )

		const rawBody = await response.text()
		let responseData: unknown = null
		if ( rawBody ) {
			try {
				responseData = JSON.parse( rawBody )
			} catch {
				if ( !response.ok ) {
					res.status( response.status ).json( {
						errorMessage: `Request failed: ${ response.statusText }`,
						responseError: rawBody.slice( 0, 500 ),
					} )
					return
				}
				responseData = { ok: true, raw: rawBody.slice( 0, 500 ) }
			}
		}

		if ( !response.ok ) {
			res.status( response.status ).json( {
				errorMessage: `Request failed: ${ response.statusText }`,
				responseError: responseData
			} )
			return
		}

		if ( responseData === null ) {
			res.status( response.status ).end()
			return
		}

		res.status( response.status ).json( responseData )
	} catch ( error: any ) {
		console.error( 'Error in handler:', error )
		res.status( 500 ).json( { error: error.message || 'Internal Server Error' } )
	}
}
