import { NextApiRequest, NextApiResponse } from 'next'
import { blingApiEndpoint, getBlingToken } from '@/pages/api/bling'

export default async function handler ( req: NextApiRequest, res: NextApiResponse ) {
	try {
		const { cnpj, routes, ...params } = req.query

		if ( !Array.isArray( routes ) ) {
			res.status( 400 ).json( { error: 'Invalid "routes" parameter' } )
			return
		}

		const blingToken = await getBlingToken( cnpj as string )

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
		const externalUrl = `${ blingApiEndpoint }/${ routes.join( '/' ) }${ queryString ? '?' + queryString : '' }`
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
		
		if ( !blingApiEndpoint ) {
			res.status( 500 ).json( { error: 'BLING_API_V3_ENDPOINT is not configured' } )
			return
		}

		const response = await fetch( externalUrl, {
			method: req.method as string,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${ blingToken }`,
			},
			body: [ 'POST', 'PUT', 'PATCH' ].includes( req.method as string ) ? JSON.stringify( bodyData ) : null
		} )

		let responseData: any = null
		const contentType = response.headers.get( 'content-type' )
		if ( contentType?.includes( 'application/json' ) ) {
			try {
				responseData = await response.json()
			} catch {
				responseData = null
			}
		}

		if ( !!responseData && !response.ok ) {
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
