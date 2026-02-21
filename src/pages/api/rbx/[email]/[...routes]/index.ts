import { NextApiRequest, NextApiResponse } from 'next'

const FETCH_TIMEOUT_MS = 8000

export default async function handler ( req: NextApiRequest, res: NextApiResponse ) {
	const t0 = Date.now()
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
		const routePath = routes.join( '/' )
		const externalUrl = `${ rbxApiUrl }/${ routePath }${ queryString ? '?' + queryString : '' }`

		console.log( `[rbx-proxy] ${req.method} /${routePath}?${queryString}` )

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

		const elapsed = Date.now() - t0
		console.log( `[rbx-proxy] /${routePath} status=${response.status} ${elapsed}ms` )

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
		const elapsed = Date.now() - t0
		const isAbort = error?.name === 'AbortError'
		if ( isAbort ) {
			console.error( `[rbx-proxy] Timeout after ${elapsed}ms (limit=${FETCH_TIMEOUT_MS}ms)` )
			res.status( 504 ).json( { error: 'External API timeout', elapsedMs: elapsed } )
			return
		}
		console.error( `[rbx-proxy] Error after ${elapsed}ms:`, error?.message || error )
		res.status( 500 ).json( { error: error.message || 'Internal Server Error' } )
	}
}
