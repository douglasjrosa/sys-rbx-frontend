import { NextApiRequest, NextApiResponse } from 'next'

export const config = { maxDuration: 60 }

const FETCH_TIMEOUT_MS = 55000

export default async function handler ( req: NextApiRequest, res: NextApiResponse ) {
	try {
		const { email, routes, ...params } = req.query

		if ( !Array.isArray( routes ) ) {
			res.status( 400 ).json( { error: 'Invalid "routes" parameter' } )
			return
		}

		const rbxApiUrl = process.env.RIBERMAX_API_URL as string
		const rbxApiToken = process.env.RIBERMAX_API_TOKEN as string

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
		const externalUrl = `${ rbxApiUrl }/${ routes.join( '/' ) }${ queryString ? '?' + queryString : '' }`

		let bodyData = req.body
		if ( [ 'POST', 'PUT', 'PATCH' ].includes( req.method as string ) ) {
			if ( typeof bodyData === 'string' && bodyData.length > 0 ) {
				try {
					bodyData = JSON.parse( bodyData )
				} catch ( error ) {
					res.status( 400 ).json( { error: 'Invalid JSON in request body' } )
					return
				}
			}
		}

		const controller = new AbortController()
		const timeout = setTimeout( () => controller.abort(), FETCH_TIMEOUT_MS )

		let response: Response
		try {
			response = await fetch( externalUrl, {
				method: req.method as string,
				headers: {
					Email: String( email ),
					Token: rbxApiToken,
					'Content-Type': 'application/json'
				},
				body: [ 'POST', 'PUT', 'PATCH' ].includes( req.method as string ) ? JSON.stringify( bodyData ) : null,
				signal: controller.signal
			} )
		} finally {
			clearTimeout( timeout )
		}

		const responseText = await response.text()
		let responseData: unknown
		try {
			responseData = responseText ? JSON.parse( responseText ) : {}
		} catch {
			responseData = { error: 'Invalid JSON response from legacy API', raw: responseText.substring( 0, 500 ) }
		}

		if ( !response.ok ) {
			const errMsg = ( responseData as { message?: string } )?.message
				|| ( responseData as { error?: string } )?.error
				|| response.statusText
			res.status( response.status ).json( {
				error: errMsg,
				errorMessage: `Request failed: ${ response.statusText }`,
				responseError: responseData
			} )
			return
		}

		res.status( response.status ).json( responseData )
	} catch ( error: any ) {
		const isAbort = error?.name === 'AbortError'
		if ( isAbort ) {
			res.status( 504 ).json( { error: 'External API timeout' } )
			return
		}
		console.error( 'Error in handler:', error )
		res.status( 500 ).json( { error: error.message || 'Internal Server Error' } )
	}
}
