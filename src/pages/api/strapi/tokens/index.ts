import { NextApiRequest, NextApiResponse } from "next"

type QueryParams = string | Record<string, string> | URLSearchParams | string[][] | undefined

const CRUD = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {
	const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL as string
	const strapiToken = process.env.ATORIZZATION_TOKEN as string

	if ( req.method === "GET" ) {
		try {
			const queryParams = req.query as QueryParams

			const params = new URLSearchParams( queryParams )
			const queryString = params.toString()

			const url = `${ strapiApiUrl }/tokens/?${ queryString }`

			const fetchStrapi = await fetch( url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${ strapiToken }`
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

			const url = `${ strapiApiUrl }/tokens`

			const fetchStrapi = await fetch( url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${ strapiToken }`
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