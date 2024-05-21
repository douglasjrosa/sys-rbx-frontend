import { NextApiRequest, NextApiResponse } from "next"

type QueryParams = string | Record<string, string> | URLSearchParams | string[][] | undefined

const CRUD = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {
	const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL as string
	const token = process.env.ATORIZZATION_TOKEN

	if ( req.method === "GET" ) {
		try {
			const queryParams = req.query as QueryParams

			const params = new URLSearchParams( queryParams )
			const queryString = params.toString()

			const url = `${ strapiApiUrl }/empresas/?${ queryString }`

			const fetchStrapi = await fetch( url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${ token }`
				}
			} ).then( r => r.json() )
			res.status( 200 ).send( fetchStrapi )
		}
		catch ( error ) {
			console.error( error )
			res.status( 500 ).send( error )
		}
	}
	if ( req.method === "POST" ) {
		try {
			const { data } = req.body

			const url = `${ strapiApiUrl }/empresas`

			const fetchStrapi = await fetch( url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${ token }`
				},
				body: JSON.stringify( data )
			} ).then( r => r.json() )
			res.status( 200 ).send( fetchStrapi )
		}
		catch ( error ) {
			console.error( error )
			res.status( 500 ).send( error )
		}
	}

	if ( req.method === "PUT" ) {
		try {
			const { data } = req.body

			const url = `${ strapiApiUrl }/empresas`

			const fetchStrapi = await fetch( url, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${ token }`
				},
				body: JSON.stringify( data )
			} ).then( r => r.json() )
			res.status( 200 ).send( fetchStrapi )
		}
		catch ( error ) {
			console.error( error )
			res.status( 500 ).send( error )
		}
	}
}

export default CRUD