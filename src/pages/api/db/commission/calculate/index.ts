import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { calculateCommission } from "@/utils/commissionCalculator"

function parseBudgetToNumber ( budget: string | null | undefined ): number {
	if ( budget == null ) return 0
	const cleaned = String( budget )
		.replace( /[^0-9,]/g, "" )
		.replace( ".", "" )
		.replace( ",", "." )
	return parseFloat( cleaned ) || 0
}

function getMonthDateRange ( mes: number, ano: number ): { start: string; end: string } {
	const start = new Date( ano, mes - 1, 1 )
	const end = new Date( ano, mes, 0 )
	return {
		start: start.toISOString().slice( 0, 10 ),
		end: end.toISOString().slice( 0, 10 ),
	}
}

export default async function handler (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method !== "GET" ) {
		return res.status( 405 ).json( { message: "Only GET requests are allowed" } )
	}

	try {
		const token = process.env.ATORIZZATION_TOKEN
		const { vendedorId, username, mes, ano } = req.query

		if ( !mes || !ano ) {
			return res.status( 400 ).json( { message: "mes and ano are required" } )
		}

		const mesNum = parseInt( String( mes ), 10 )
		const anoNum = parseInt( String( ano ), 10 )
		if ( isNaN( mesNum ) || isNaN( anoNum ) ) {
			return res.status( 400 ).json( { message: "mes and ano must be valid numbers" } )
		}

		let vendedorUsername = String( username || "" ).trim()
		let vendedorIdResolved = vendedorId ? String( vendedorId ) : null

		if ( !vendedorUsername && vendedorIdResolved ) {
			const userRes = await axios.get(
				`${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/users/${ vendedorIdResolved }?fields[0]=username`,
				{
					headers: {
						Authorization: `Bearer ${ token }`,
						"Content-Type": "application/json",
					},
				}
			)
			vendedorUsername = userRes.data?.username || ""
		}

		if ( !vendedorUsername ) {
			return res.status( 400 ).json( { message: "vendedorId or username is required" } )
		}

		const { start, end } = getMonthDateRange( mesNum, anoNum )
		const startISO = `${ start }T00:00:00.000Z`
		const endISO = `${ end }T23:59:59.999Z`

		const configRes = await axios.get(
			`${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/config-comissaos?filters[mes][$eq]=${ mesNum }&filters[ano][$eq]=${ anoNum }&filters[vendedor][$eq]=${ encodeURIComponent( vendedorUsername ) }`,
			{
				headers: {
					Authorization: `Bearer ${ token }`,
					"Content-Type": "application/json",
				},
			}
		)

		const configs = configRes.data?.data || []
		let config = configs[ 0 ]

		if ( !config && vendedorIdResolved ) {
			const configByUser = await axios.get(
				`${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/config-comissaos?filters[mes][$eq]=${ mesNum }&filters[ano][$eq]=${ anoNum }&filters[user][id][$eq]=${ vendedorIdResolved }`,
				{
					headers: {
						Authorization: `Bearer ${ token }`,
						"Content-Type": "application/json",
					},
				}
			)
			config = configByUser.data?.data?.[ 0 ]
		}

		if ( !config ) {
			return res.status( 404 ).json( {
				message: "No commission config found for this seller and period",
				hasConfig: false,
			} )
		}

		const meta = parseFloat( config.attributes?.meta ) || 0
		const salarioFixo = parseFloat( config.attributes?.salario_fixo ) || 0

		const vendedorFilter = `filters[vendedor][username][$eq]=${ encodeURIComponent( vendedorUsername ) }&`
		const businessesRes = await axios.get(
			`${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/businesses?${ vendedorFilter }filters[status][$eq]=true&filters[andamento][$eq]=5&filters[date_conclucao][$gte]=${ startISO }&filters[date_conclucao][$lte]=${ endISO }&fields[0]=Budget`,
			{
				headers: {
					Authorization: `Bearer ${ token }`,
					"Content-Type": "application/json",
				},
			}
		)

		const businesses = businessesRes.data?.data || []
		const vendas = businesses.reduce( ( acc: number, b: any ) => {
			return acc + parseBudgetToNumber( b.attributes?.Budget )
		}, 0 )

		const result = calculateCommission( vendas, meta, salarioFixo )

		return res.status( 200 ).json( result )
	} catch ( error: any ) {
		const status = error.response?.status || 500
		const data = error.response?.data || { message: "Internal Server Error" }
		return res.status( status ).json( data )
	}
}
