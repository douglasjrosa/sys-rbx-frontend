import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method !== "POST" ) {
		return res.status( 405 ).json( { message: "Only POST requests are allowed" } )
	}

	try {
		const token = process.env.ATORIZZATION_TOKEN
		const { ano, mes, meta, salario_fixo, vendedor, user } = req.body

		if ( !ano || !mes || meta == null || salario_fixo == null || !user ) {
			return res.status( 400 ).json( {
				message: "ano, mes, meta, salario_fixo and user are required",
			} )
		}

		const payload = {
			data: {
				ano: String( ano ),
				mes: String( mes ),
				meta: parseFloat( String( meta ) ) || 0,
				salario_fixo: parseFloat( String( salario_fixo ) ) || 0,
				vendedor: vendedor || "",
				user: Number( user ),
			},
		}

		const response = await axios.post(
			`${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/config-comissaos`,
			payload,
			{
				headers: {
					Authorization: `Bearer ${ token }`,
					"Content-Type": "application/json",
				},
			}
		)

		return res.status( 200 ).json( response.data )
	} catch ( error: any ) {
		const status = error.response?.status || 500
		const data = error.response?.data || { message: "Internal Server Error" }
		return res.status( status ).json( data )
	}
}
