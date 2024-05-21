import { NextApiRequest, NextApiResponse } from "next"

const CRUD = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {
	const strapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL as string
	const strapiToken = process.env.ATORIZZATION_TOKEN as string

	if ( req.method === "GET" ) {
		try {
			const { id } = req.query

			const url = `${ strapiApiUrl }/empresas/${ id }`

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


	if ( req.method === "PUT" ) {
		try {
			const { id } = req.query
			const dataStringified = req.body

			const url = `${ strapiApiUrl }/empresas/${ id }`

			const fetchStrapi = await fetch( url, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${ strapiToken }`
				},
				body: dataStringified
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