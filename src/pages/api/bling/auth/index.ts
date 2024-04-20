import { refreshToken, updateToken } from "@/function/update-bling-token"
import { NextApiRequest, NextApiResponse } from "next"

function isExpired ( expires_in: string, createdAt: string ) {

	const dateCreated = new Date( createdAt )
	const timeCreated = dateCreated.getTime()

	const timeExpires = timeCreated + (parseInt( expires_in ) * 1000) - 1200 // 20 minutos antes de expirar

	const now = new Date()
	const timeNow = now.getTime()

	return timeNow > timeExpires
}

export default async function getToken (
	req: NextApiRequest,
	res: NextApiResponse
) {
	const account = typeof req.query.account === 'string' ? req.query.account : ''
	if ( req.method === "GET" && account ) {
		try {
			const strapiToken = process.env.ATORIZZATION_TOKEN

			const filters = `filters[account][$eq]=${ account }`
			const strapiEndpoint = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/tokens/?${ filters }`

			const current_token = await fetch( strapiEndpoint, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${ strapiToken }`,
				}
			} )
				.then( r => {
					if ( !r.ok ) {
						throw new Error( `Erro ao fazer requisição: ${ r.status }` )
					}
					return r.json()
				} )

			const {
				expires_in,
				createdAt,
				access_token,
			} = current_token.data[ 0 ].attributes

			if ( isExpired( expires_in, createdAt ) ) {
				const {
					refresh_token,
					client_id,
					client_secret
				} = current_token.data[ 0 ].attributes

				const newToken = await refreshToken( client_id, client_secret, refresh_token )

				const { id } = current_token.data[ 0 ]
				const validToken = await updateToken(
					id,
					newToken.access_token,
					newToken.expires_in,
					newToken.refresh_token
				)
				console.log({validToken})
				res.status( 200 ).json( validToken )
			}
			else
				res.status( 200 ).json( access_token )
		} catch ( error ) {
			console.error( "Erro:", error )
			res.status( 500 ).json( { error, message: "Erro ao obter o token" } )
		}
	}
}
