import axios from "axios"
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

export async function fetchCommissionData (
	vendedorId: string,
	mes: number,
	ano: number
): Promise<{ data: any; status: number }> {
	const token = process.env.ATORIZZATION_TOKEN
	const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL

	const userRes = await axios.get(
		`${ baseUrl }/users/${ vendedorId }?fields[0]=username`,
		{
			headers: {
				Authorization: `Bearer ${ token }`,
				"Content-Type": "application/json",
			},
		}
	)
	const vendedorUsername =
		userRes.data?.username ||
		userRes.data?.data?.attributes?.username ||
		""
	if ( !vendedorUsername ) {
		return { data: { message: "Vendedor not found" }, status: 404 }
	}

	const { start, end } = getMonthDateRange( mes, ano )
	const startISO = `${ start }T00:00:00.000Z`
	const endISO = `${ end }T23:59:59.999Z`

	const configRes = await axios.get(
		`${ baseUrl }/config-comissaos?filters[mes][$eq]=${ mes }&filters[ano][$eq]=${ ano }&filters[vendedor][$eq]=${ encodeURIComponent( vendedorUsername ) }`,
		{
			headers: {
				Authorization: `Bearer ${ token }`,
				"Content-Type": "application/json",
			},
		}
	)

	let config = configRes.data?.data?.[ 0 ]
	if ( !config ) {
		const configByUser = await axios.get(
			`${ baseUrl }/config-comissaos?filters[mes][$eq]=${ mes }&filters[ano][$eq]=${ ano }&filters[user][id][$eq]=${ vendedorId }`,
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
		return {
			data: { message: "No commission config found for this seller and period", hasConfig: false },
			status: 404,
		}
	}

	const meta = parseFloat( config.attributes?.meta ) || 0
	const salarioFixo = parseFloat( config.attributes?.salario_fixo ) || 0
	const baseRate = config.attributes?.base_rate != null
		? parseFloat( config.attributes.base_rate ) : undefined
	const milestones = config.attributes?.milestones ?? undefined
	const deductions = config.attributes?.deductions ?? undefined

	const vendedorFilter = `filters[vendedor][username][$eq]=${ encodeURIComponent( vendedorUsername ) }&`
	const businessesRes = await axios.get(
		`${ baseUrl }/businesses?${ vendedorFilter }filters[status][$eq]=true&filters[andamento][$eq]=5&filters[date_conclucao][$gte]=${ startISO }&filters[date_conclucao][$lte]=${ endISO }&fields[0]=Budget`,
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

	const result = calculateCommission(
		vendas,
		meta,
		salarioFixo,
		baseRate,
		milestones,
		deductions
	)
	return { data: result, status: 200 }
}
