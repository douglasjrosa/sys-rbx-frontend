import { NextApiRequest, NextApiResponse } from "next"
const blingApiEndpoint = process.env.BLING_API_V3_ENDPOINT as string

type QueryParams = string | Record<string, string> | URLSearchParams | string[][] | undefined

const CRUD = async (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> => {

	if ( req.method === "GET" ) {
		const queryParams = req.query as QueryParams

		const params = new URLSearchParams( queryParams )
		const queryString = params.toString()

		const response = await fetch( `${ blingApiEndpoint }/?${ queryString }`, {
			method: "GET",
			headers: {
				authorization: req.headers.authorization as string
			}
		} ).then( r => r.json() )
		return res.status( 200 ).json( response )
	}
}

export default CRUD