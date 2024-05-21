import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"

export default async function getId ( req: NextApiRequest, res: NextApiResponse ) {
	if ( req.method !== "GET" ) {
		return res.status( 405 ).send( { message: "Only GET requests are allowed" } )
	}

	const token = process.env.ATORIZZATION_TOKEN
	const { id, vendedor, vendedorId, valor } = req.query

	try {
		const response = await axios.get(
			`${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/empresas/${ id }?populate=*`,
			{
				headers: {
					Authorization: `Bearer ${ token }`,
					"Content-Type": "application/json",
				},
			}
		)

		const empresa = response.data.data							// pega dados da empresa (inativStatus e ultima_compra)
		const inativStatus = empresa.attributes.inativStatus
		const ultima_compra = empresa.attributes.ultima_compra

		const update = {
			data: {
				vendedor,
				user: Number( vendedorId ),
				inativStatus,
				ultima_compra: new Date().toISOString(),
				valor_ultima_compra: valor,
				penultima_compra: ultima_compra,
			},
		}

		if ( !inativStatus || inativStatus == 3 ) {
			update.data.inativStatus = 3
		} else if ( inativStatus == 1 || inativStatus == 4 ) {
			update.data.inativStatus = 4
		} else if ( inativStatus === 2 || inativStatus === 5 ) {
			update.data.penultima_compra = ultima_compra
		}

		if ( inativStatus === 2 || inativStatus === 5 ) {
			await axios.put(
				`${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/empresas/${ id }`,
				{
					data: {
						ultima_compra: update.data.ultima_compra,
						valor_ultima_compra: update.data.valor_ultima_compra,
						penultima_compra: ultima_compra,
					},
				},
				{
					headers: {
						Authorization: `Bearer ${ token }`,
						"Content-Type": "application/json",
					},
				}
			)
		}

		await axios.put(
			`${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/empresas/${ id }`,
			update,
			{
				headers: {
					Authorization: `Bearer ${ token }`,
					"Content-Type": "application/json",
				},
			}
		)

		res.status( 200 ).json( update.data )

	} catch ( err: any ) {

		const errorData = err.response?.data
		const errorMessage = errorData?.error
		const errorDetails = errorData?.error?.details

		res.status( 400 ).json( {
			error: errorData,
			mensage: errorMessage,
			detalhe: errorDetails,
		} )
	}
}
