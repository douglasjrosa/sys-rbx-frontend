import { refreshToken, updateToken } from "@/pages/api/bling"
import { NextApiRequest, NextApiResponse } from "next"

function isExpired ( expires_in: string, updatedAt: string ): boolean {
	const dateCreated = new Date( updatedAt )
	const timeCreated = dateCreated.getTime()
	const timeExpires = timeCreated + ( parseInt( expires_in ) * 1000 ) - 1200

	const now = new Date()
	const timeNow = now.getTime()

	return timeNow > timeExpires
}

export default async function getToken (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method !== "GET" ) {
		res.status( 405 ).json( { message: "Method not allowed" } )
		return
	}

	const account = req.query.account
	if ( typeof account !== 'string' || !account ) {
		res.status( 400 ).json( { message: "Account is required" } )
		return
	}

	let token = ""
	try {
		const strapiToken = process.env.ATORIZZATION_TOKEN as string
		const filters = `filters[cnpj][$eq]=${ account }`
		const strapiEndpoint = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/tokens/?${ filters }`

		const response = await fetch( strapiEndpoint, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${ strapiToken }`,
			},
		} )

		if ( !response.ok ) {
			throw new Error( 'Failed to fetch current token' )
		}

		const currentTokenData = await response.json()

		if ( !currentTokenData.data?.length ) {
			res.status( 404 ).json( { message: "No token found", currentTokenData, strapiEndpoint } )
			return
		}

		const {
			expires_in,
			updatedAt,
			access_token,
			refresh_token,
			client_id,
			client_secret,
		} = currentTokenData.data[ 0 ].attributes

		if ( isExpired( expires_in, updatedAt ) ) {
			const newToken = await refreshToken( client_id, client_secret, refresh_token )

			const { id } = currentTokenData.data[ 0 ]
			token = await updateToken( id, newToken.access_token, newToken.expires_in, newToken.refresh_token )
		} else {
			token = access_token
		}

		res.status( 200 ).json( token )
	} catch ( error ) {
		console.error( "Erro:", error )
		res.status( 500 ).json( { error, message: "Erro ao obter o token" } )
	}
}
