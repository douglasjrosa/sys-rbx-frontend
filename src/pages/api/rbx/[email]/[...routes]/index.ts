import { NextApiRequest, NextApiResponse } from 'next'

export const config = { maxDuration: 60 }

const FETCH_TIMEOUT_MS = 55000

/** Locaweb nginx WAF blocks legacy GET URLs above ~350 chars (acessorios JSON). */
const LEGACY_GET_QUERY_MAX_LEN = 320

function shouldPostLegacyCalc ( queryString: string, params: Record<string, unknown> ): boolean {
	if ( params.calcular !== '1' ) {
		return false
	}
	if ( params.acessorios !== undefined && params.acessorios !== '' ) {
		return true
	}
	return queryString.length > LEGACY_GET_QUERY_MAX_LEN
}

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
		const routePath = `${ rbxApiUrl }/${ routes.join( '/' ) }`
		const useLegacyCalcPost =
			req.method === 'GET' &&
			shouldPostLegacyCalc( queryString, params as Record<string, unknown> )

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

		const externalUrl = useLegacyCalcPost
			? routePath
			: `${ routePath }${ queryString ? '?' + queryString : '' }`
		const fetchMethod = useLegacyCalcPost ? 'POST' : ( req.method as string )
		const fetchBody = useLegacyCalcPost
			? JSON.stringify( Object.fromEntries( queryParams.entries() ) )
			: [ 'POST', 'PUT', 'PATCH' ].includes( req.method as string )
				? JSON.stringify( bodyData )
				: null

		const controller = new AbortController()
		const timeout = setTimeout( () => controller.abort(), FETCH_TIMEOUT_MS )

		let response: Response
		try {
			response = await fetch( externalUrl, {
				method: fetchMethod,
				headers: {
					Email: String( email ),
					Token: rbxApiToken,
					'Content-Type': 'application/json'
				},
				body: fetchBody,
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
			res.status( 502 ).json( {
				error: 'Invalid JSON response from legacy API',
				erro: 'Resposta inválida do sistema legado.',
				raw: responseText.substring( 0, 500 ),
			} )
			return
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
