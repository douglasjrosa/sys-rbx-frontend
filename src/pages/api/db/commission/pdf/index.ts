import fs from "fs"
import { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import axios from "axios"
import PDFPrinter from "pdfmake"
import { TDocumentDefinitions, Content } from "pdfmake/interfaces"
import { fetchCommissionData as fetchCommission } from "../lib/fetchCommissionData"
import type { CommissionMilestone, CommissionDeduction } from "@/utils/commissionCalculator"
import { emitentes } from "@/components/data/emitentes"

const formatCurrencyBRL = ( n: number ) =>
	new Intl.NumberFormat( "pt-BR", { style: "currency", currency: "BRL" } ).format( n )

const MONTH_NAMES = [
	"", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
	"Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

interface VendedorData {
	username: string
	nome: string
	sobrenome: string
	cpf: string
	empresaEmitente: EmitenteData | null
}

interface EmitenteData {
	razao?: string
	cnpj?: string
}

function formatCpf ( v: string ): string {
	const d = String( v ).replace( /\D/g, "" ).slice( 0, 11 )
	if ( d.length < 11 ) return d
	return d.replace( /^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4" )
}

async function fetchVendedorData ( vendedorId: string ): Promise<VendedorData> {
	const token = process.env.ATORIZZATION_TOKEN
	const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL
	const populate = "populate[0]=empresa_emitente"
	const fields = "fields[0]=username&fields[1]=nome&fields[2]=sobrenome&fields[3]=cpf&fields[4]=empresa_emitente"
	const url = `${ baseUrl }/users/${ vendedorId }?${ fields }&${ populate }`
	const res = await axios.get( url, {
		headers: {
			Authorization: `Bearer ${ token }`,
			"Content-Type": "application/json",
		},
	} )
	const u = res.data
	let empresaEmitente: EmitenteData | null = null
	const emitenteRel = u?.empresa_emitente
	const emitenteId = typeof emitenteRel === "number" ? emitenteRel : emitenteRel?.data?.id ?? emitenteRel?.id
	if ( emitenteRel ) {
		const emitenteData = emitenteRel?.data ?? emitenteRel
		const att = emitenteData?.attributes ?? ( typeof emitenteData === "object" && !Array.isArray( emitenteData ) && !emitenteId ? emitenteData : null )
		if ( att && ( att.razao || att.nome || att.CNPJ || att.cnpj ) ) {
			empresaEmitente = {
				razao: att.razao || att.nome || "",
				cnpj: att.CNPJ || att.cnpj || "",
			}
		} else if ( emitenteId ) {
			const empRes = await axios.get(
				`${ baseUrl }/empresas/${ emitenteId }?fields[0]=razao&fields[1]=nome&fields[2]=CNPJ`,
				{
					headers: {
						Authorization: `Bearer ${ token }`,
						"Content-Type": "application/json",
					},
				}
			)
			const emp = empRes.data?.data ?? empRes.data
			const empAtt = emp?.attributes ?? emp
			if ( empAtt ) {
				empresaEmitente = {
					razao: empAtt.razao || empAtt.nome || "",
					cnpj: empAtt.CNPJ || empAtt.cnpj || "",
				}
			}
		}
	}
	const nome = u?.nome || u?.username || "Vendedor"
	const sobrenome = u?.sobrenome || ""
	const cpf = u?.cpf ? formatCpf( u.cpf ) : ""
	const username = u?.username ?? u?.data?.attributes?.username ?? ""
	return { username, nome, sobrenome, cpf, empresaEmitente }
}

interface BusinessItem {
	id: number
	date: string
	valor: number
}

function getMonthDateRange ( mes: number, ano: number ): { start: string; end: string } {
	const start = new Date( ano, mes - 1, 1 )
	const end = new Date( ano, mes, 0 )
	return {
		start: start.toISOString().slice( 0, 10 ),
		end: end.toISOString().slice( 0, 10 ),
	}
}

function parseBudgetToNumber ( budget: string | null | undefined ): number {
	if ( budget == null ) return 0
	const cleaned = String( budget )
		.replace( /[^0-9,]/g, "" )
		.replace( ".", "" )
		.replace( ",", "." )
	return parseFloat( cleaned ) || 0
}

async function fetchBusinessesForMonth (
	vendedorUsername: string,
	mes: number,
	ano: number
): Promise<BusinessItem[]> {
	const token = process.env.ATORIZZATION_TOKEN
	const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL
	const { start, end } = getMonthDateRange( mes, ano )
	const startISO = `${ start }T00:00:00.000Z`
	const endISO = `${ end }T23:59:59.999Z`
	const vendedorFilter = `filters[vendedor][username][$eq]=${ encodeURIComponent( vendedorUsername ) }&`
	const url = `${ baseUrl }/businesses?${ vendedorFilter }filters[status][$eq]=true&filters[andamento][$eq]=5&filters[date_conclucao][$gte]=${ startISO }&filters[date_conclucao][$lte]=${ endISO }&fields[0]=Budget&fields[1]=date_conclucao&sort[0]=date_conclucao:asc`
	const res = await axios.get( url, {
		headers: {
			Authorization: `Bearer ${ token }`,
			"Content-Type": "application/json",
		},
	} )
	const items = res.data?.data || []
	return items.map( ( b: any ) => {
		const dc = b.attributes?.date_conclucao
		let dateStr = "-"
		if ( dc ) {
			const d = new Date( dc )
			dateStr = [
				String( d.getDate() ).padStart( 2, "0" ),
				String( d.getMonth() + 1 ).padStart( 2, "0" ),
				d.getFullYear(),
			].join( "-" )
		}
		return {
			id: b.id,
			date: dateStr,
			valor: parseBudgetToNumber( b.attributes?.Budget ),
		}
	} )
}

async function fetchDefaultEmitente (): Promise<EmitenteData | null> {
	try {
		const emitenteCnpj = emitentes.default.emitente
		const token = process.env.ATORIZZATION_TOKEN
		const url = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/empresas?filters[CNPJ][$eq]=${ emitenteCnpj }&fields[0]=nome&fields[1]=razao&fields[2]=CNPJ`
		const res = await axios.get( url, {
			headers: {
				Authorization: `Bearer ${ token }`,
				"Content-Type": "application/json",
			},
		} )
		const first = res.data?.data?.[ 0 ]
		if ( !first?.attributes ) return null
		const att = first.attributes
		return {
			razao: att.razao || att.nome || "",
			cnpj: att.CNPJ || att.cnpj || "",
		}
	} catch {
		return null
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
		const { vendedorId, mes, ano } = req.query
		if ( !vendedorId || !mes || !ano ) {
			return res.status( 400 ).json( { message: "vendedorId, mes and ano are required" } )
		}

		const mesNum = parseInt( String( mes ), 10 )
		const anoNum = parseInt( String( ano ), 10 )
		if ( isNaN( mesNum ) || isNaN( anoNum ) ) {
			return res.status( 400 ).json( { message: "mes and ano must be valid numbers" } )
		}

		const [ commissionRes, vendedorData, defaultEmitente ] = await Promise.all( [
			fetchCommission( String( vendedorId ), mesNum, anoNum ),
			fetchVendedorData( String( vendedorId ) ),
			fetchDefaultEmitente(),
		] )

		if ( commissionRes.status !== 200 || !commissionRes.data ) {
			return res.status( 404 ).json( {
				message: commissionRes.data?.message || "Commission data not found",
			} )
		}

		const businesses = await fetchBusinessesForMonth(
			vendedorData.username,
			mesNum,
			anoNum
		)

		const calc = commissionRes.data
		const emitente = vendedorData.empresaEmitente ?? defaultEmitente
		const companyRazao = emitente?.razao || ""
		const companyCnpj = emitente?.cnpj || ""
		const vendedorDisplayName = [ vendedorData.nome, vendedorData.sobrenome ]
			.filter( Boolean )
			.join( " " )
			.trim() || "Vendedor"

		let logo: string | null = null
		const imagePath = path.join( process.cwd(), "public", "img", "logomarca-efect.jpg" )
		if ( fs.existsSync( imagePath ) ) {
			const imageContent = fs.readFileSync( imagePath ).toString( "base64" )
			logo = `data:image/jpeg;base64,${ imageContent }`
		}

		const fonts = {
			Helvetica: {
				normal: "Helvetica",
				bold: "Helvetica-Bold",
				italics: "Helvetica-Oblique",
				bolditalics: "Helvetica-BoldOblique",
			},
		}
		const printer = new PDFPrinter( fonts )

		const monthName = MONTH_NAMES[ mesNum ] || String( mesNum )
		const BORDER_COLOR = "#006b0d"

		const headerSection = {
			margin: [ 0, 0, 0, 8 ] as [ number, number, number, number ],
			columns: [
				{
					width: logo ? "60%" : "100%",
					stack: [
						{
							text: "RELATÓRIO DE COMISSÃO",
							fontSize: 20,
							bold: true,
							color: "#009512",
						},
						{
							text: `Referência: ${ monthName } / ${ anoNum }`,
							fontSize: 10,
							color: "#666666",
							margin: [ 0, 2, 0, 0 ] as [ number, number, number, number ],
						},
					],
				},
				...( logo ? [ {
					width: "40%",
					image: logo,
					fit: [ 90, 90 ],
					alignment: "right",
					margin: [ 0, -5, 0, 0 ] as [ number, number, number, number ],
				} ] : [] ),
			],
		}

		const truncateToFit = ( text: string, maxLen = 38 ): string =>
			text.length <= maxLen ? text : `${ text.slice( 0, maxLen - 3 ) }...`

		const labelCell = ( label: string ) => ( {
			text: label,
			bold: true,
			fontSize: 7,
			fillColor: "#009512",
			color: "#ffffff",
			margin: [ 2, 1, 2, 1 ] as [ number, number, number, number ],
		} )
		const valueCell = ( value: string ) => ( {
			text: value,
			fontSize: 7,
			alignment: "right" as const,
			margin: [ 2, 1, 2, 1 ] as [ number, number, number, number ],
		} )
		const labelCellWarning = ( label: string ) => ( {
			text: label,
			bold: true,
			fontSize: 7,
			fillColor: "#d97706",
			color: "#ffffff",
			margin: [ 2, 1, 2, 1 ] as [ number, number, number, number ],
		} )
		const valueCellWarning = ( value: string ) => ( {
			text: value,
			fontSize: 7,
			alignment: "right" as const,
			fillColor: "#fef3c7",
			margin: [ 2, 1, 2, 1 ] as [ number, number, number, number ],
		} )

		const tableLayout = {
			hLineWidth: () => 0.3,
			vLineWidth: () => 0.3,
			hLineColor: () => BORDER_COLOR,
			vLineColor: () => BORDER_COLOR,
		}
		const companyTable = {
			table: {
				widths: [ "30%", "70%" ],
				body: [
					[ labelCell( "Empresa:" ), valueCell( truncateToFit( companyRazao || "-" ) ) ],
					[ labelCell( "CNPJ:" ), valueCell(
						companyCnpj
							? String( companyCnpj ).replace( /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5" )
							: "-"
					) ],
				],
			},
			layout: tableLayout,
		}
		const sellerTable = {
			table: {
				widths: [ "30%", "70%" ],
				body: [
					[ labelCell( "Vendedor:" ), valueCell( truncateToFit( vendedorDisplayName.toUpperCase() ) ) ],
					[ labelCell( "CPF:" ), valueCell( vendedorData.cpf || "-" ) ],
				],
			},
			layout: tableLayout,
		}
		const companySellerSection = {
			margin: [ 0, 0, 0, 8 ] as [ number, number, number, number ],
			columns: [
				{ width: "49%", ...companyTable },
				{ width: "2%", text: "" },
				{ width: "49%", ...sellerTable },
			],
		}

		const formatValorBRL = ( n: number ) =>
			new Intl.NumberFormat( "pt-BR", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			} ).format( n )

		const buildDataRows = ( items: BusinessItem[] ): any[] => {
			const rows: any[] = []
			let idx = 0
			while ( idx < items.length ) {
				const b = items[ idx ]
				let sameDateCount = 1
				while ( idx + sameDateCount < items.length && items[ idx + sameDateCount ].date === b.date ) {
					sameDateCount++
				}
				const ROW_HEIGHT_PT = 10
				const verticalOffset = sameDateCount > 1
					? Math.round( ( sameDateCount - 1 ) * ROW_HEIGHT_PT / 2 )
					: 0
				const dataCell = {
					text: b.date,
					style: "salesTableCell",
					alignment: "center" as const,
					rowSpan: sameDateCount,
					...( verticalOffset > 0 && { margin: [ 2, verticalOffset, 2, 1 ] as [ number, number, number, number ] } ),
				}
				for ( let j = 0; j < sameDateCount; j++ ) {
					const item = items[ idx + j ]
					const row = j === 0
						? [
							dataCell,
							{ text: String( item.id ), style: "salesTableCell", alignment: "center" as const },
							{ text: formatValorBRL( item.valor ), style: "salesTableCell", alignment: "center" as const },
						]
						: [
							{},
							{ text: String( item.id ), style: "salesTableCell", alignment: "center" as const },
							{ text: formatValorBRL( item.valor ), style: "salesTableCell", alignment: "center" as const },
						]
					rows.push( row )
				}
				idx += sameDateCount
			}
			return rows
		}
		const mid = Math.ceil( businesses.length / 2 )
		const leftBusinesses = businesses.slice( 0, mid )
		const rightBusinesses = businesses.slice( mid )
		const dataRowsLeft = buildDataRows( leftBusinesses )
		const dataRowsRight = buildDataRows( rightBusinesses )

		const baseRatePctNum = calc.vendas
			? ( calc.comissaoBase / calc.vendas ) * 100
			: 1
		const baseRatePctStr = baseRatePctNum.toFixed( 1 )
		const multiplicador = calc.multiplicador ?? 0
		const multiplicadorPct = Math.round( multiplicador * 100 )
		const effectivePct = ( baseRatePctNum * multiplicador ).toFixed( 2 ).replace( ".", "," )
		const commissionamentoStr = `${ multiplicadorPct }% de ${ baseRatePctStr }% = ${ effectivePct }%`

		const commissionTable = {
			table: {
				widths: [ "30%", "70%" ],
				body: [
					[ labelCell( "Meta:" ), valueCell( formatCurrencyBRL( calc.meta ) ) ],
					[ labelCell( "Vendas:" ), valueCell( formatCurrencyBRL( calc.vendas ) ) ],
					[ labelCell( "Atingido:" ), valueCell( `${ calc.atingimentoPercent?.toFixed( 1 ) ?? 0 }%` ) ],
				],
			},
			layout: tableLayout,
		}
		const totalsTableBody: any[] = [
			[ labelCell( "Fixo:" ), valueCell( formatCurrencyBRL( calc.salarioFixo ) ) ],
			[ labelCell( "Comissão:" ), valueCell( formatCurrencyBRL( calc.comissaoFinal ) ) ],
		]
		if ( calc.deductionsTotal != null && calc.deductionsTotal > 0 ) {
			totalsTableBody.push( [
				labelCellWarning( "Deduções:" ),
				valueCellWarning( formatCurrencyBRL( calc.deductionsTotal ) ),
			] )
		}
		totalsTableBody.push( [
			labelCell( "Total a Receber:" ),
			{ ...valueCell( formatCurrencyBRL( calc.salarioTotal ) ), bold: true },
		] )
		const totalsTable = {
			table: {
				widths: [ "30%", "70%" ],
				body: totalsTableBody,
			},
			layout: tableLayout,
		}
		const commissionTotalsSection = {
			margin: [ 0, 0, 0, 8 ] as [ number, number, number, number ],
			columns: [
				{ width: "49%", ...commissionTable },
				{ width: "2%", text: "" },
				{ width: "49%", ...totalsTable },
			],
		}

		const details: CommissionMilestone[] = calc.milestoneDetails ?? []
		const bullets = details.map(
			( m: CommissionMilestone, i: number ) => {
				const next = details[ i + 1 ]
				const range = next
					? `de ${ Math.round( m.targetPercent * 100 ) }% a ${ Math.round( next.targetPercent * 100 ) - 1 }%`
					: `de ${ Math.round( m.targetPercent * 100 ) }% ou mais`
				const mult = Math.round( m.comissionPercent * 100 )
				return `   • Atingimento ${ range } da meta: Recebe ${ mult }% da Comissão base`
			}
		)
		const rulesLines = [
			`1. Comissão base = ${ baseRatePctStr }% das vendas (pedidos aprovados) dentro do mês.`,
			"",
			"2. O valor da comissão depende do atingimento da meta (%), por faixa:",
			...bullets,
			"",
			"3. Total = Salário fixo + Comissão - Deduções (quando houver).",
			"",
			`4. Comissionamento deste mês com ${ calc.atingimentoPercent?.toFixed( 1 ) ?? 0 }% da meta atingida:`,
			`   • ${ commissionamentoStr }`,
			`   • ${ effectivePct }% x ${ formatCurrencyBRL( calc.vendas ) } = ${ formatCurrencyBRL( calc.comissaoFinal ) }`,
		]
		const termoText = "Declaro para todos os fins de direito que os valores aqui dispostos correspondem à comissão devida referente ao período indicado, estando de acordo com as regras de cálculo descritas e aceitando os valores como liquidação integral, sem qualquer oposição."

		const rulesTable = {
			table: {
				widths: [ "*" ],
				body: [
					[
						{
							text: "REGRAS DE CÁLCULO",
							fontSize: 9,
							bold: true,
							fillColor: "#009512",
							color: "#ffffff",
							margin: [ 4, 4, 4, 4 ] as [ number, number, number, number ],
						},
					],
					[
						{
							text: rulesLines.join( "\n" ),
							margin: [ 4, 6, 4, 6 ] as [ number, number, number, number ],
							fontSize: 7,
							lineHeight: 1.6,
						},
					],
				],
			},
			layout: {
				hLineWidth: () => 1,
				vLineWidth: () => 1,
				hLineColor: () => BORDER_COLOR,
				vLineColor: () => BORDER_COLOR,
			},
		}
		const termoTable = {
			table: {
				widths: [ "*" ],
				body: [
					[
						{
							text: "RECONHECIMENTO E ACORDO COMERCIAL",
							fontSize: 9,
							bold: true,
							fillColor: "#009512",
							color: "#ffffff",
							margin: [ 4, 4, 4, 4 ] as [ number, number, number, number ],
						},
					],
					[
						{
							stack: [
								{ text: termoText, fontSize: 8, lineHeight: 1.5, margin: [ 4, 6, 4, 4 ] as [ number, number, number, number ] },
								{ text: "_____/____/_________", fontSize: 9, color: "#333333", alignment: "center", margin: [ 0, 25, 0, 4 ] as [ number, number, number, number ] },
								{ text: "Data", fontSize: 8, color: "#666666", alignment: "center" },
								{ text: "________________________", fontSize: 9, color: "#333333", alignment: "center", margin: [ 0, 25, 0, 4 ] as [ number, number, number, number ] },
								{ text: "Assinatura", fontSize: 8, color: "#666666", alignment: "center" },
							],
							margin: [ 4, 6, 4, 6 ] as [ number, number, number, number ],
						},
					],
				],
			},
			layout: {
				hLineWidth: () => 1,
				vLineWidth: () => 1,
				hLineColor: () => BORDER_COLOR,
				vLineColor: () => BORDER_COLOR,
			},
		}
		const rulesTermoSection = {
			margin: [ 0, 0, 0, 8 ] as [ number, number, number, number ],
			columns: [
				{ width: "49%", ...rulesTable },
				{ width: "2%", text: "" },
				{ width: "49%", ...termoTable },
			],
		}

		const salesHeaderTable = {
			margin: [ 0, 0, 0, 8 ] as [ number, number, number, number ],
			table: {
				widths: [ "*" ],
				body: [
					[
						{
							text: "DETALHAMENTO DE VENDAS COM PEDIDO APROVADO NESTE MÊS",
							style: "salesSectionHeader",
						},
					],
				],
			},
			layout: {
				hLineWidth: () => 0.8,
				vLineWidth: () => 0.8,
				hLineColor: () => BORDER_COLOR,
				vLineColor: () => BORDER_COLOR,
				fillColor: () => "#009512",
			},
		}

		const salesTableLayout = {
			hLineWidth: () => 0.8,
			vLineWidth: () => 0.8,
			hLineColor: () => BORDER_COLOR,
			vLineColor: () => BORDER_COLOR,
			fillColor: ( rowIndex: number ) => ( rowIndex === 0 ? "#009512" : null ),
		}
		const leftSalesTable = {
			table: {
				headerRows: 1,
				widths: [ "33%", "33%", "34%" ],
				body: [
					[
						{ text: "DATA", style: "salesTableHeader" },
						{ text: "NEGÓCIO", style: "salesTableHeader" },
						{ text: "VALOR", style: "salesTableHeader" },
					],
					...dataRowsLeft,
				],
			},
			layout: salesTableLayout,
		}
		const rightSalesTable = {
			table: {
				headerRows: 1,
				widths: [ "33%", "33%", "34%" ],
				body: [
					[
						{ text: "DATA", style: "salesTableHeader" },
						{ text: "NEGÓCIO", style: "salesTableHeader" },
						{ text: "VALOR", style: "salesTableHeader" },
					],
					...dataRowsRight,
				],
			},
			layout: salesTableLayout,
		}
		const salesTablesSection = {
			margin: [ 0, 0, 0, 0 ] as [ number, number, number, number ],
			columns: [
				{ width: "49%", ...leftSalesTable },
				{ width: "2%", text: "" },
				{ width: "49%", ...rightSalesTable },
			],
		}

		const deductionsList: CommissionDeduction[] = calc.deductions ?? []
		const deductionsDetailSection =
			deductionsList.length > 0
				? {
					margin: [ 0, 12, 0, 0 ] as [ number, number, number, number ],
					stack: [
						{
							table: {
								widths: [ "*" ],
								body: [
									[
										{
											text: "DETALHAMENTO DE DEDUÇÕES",
											fontSize: 9,
											bold: true,
											fillColor: "#d97706",
											color: "#ffffff",
											margin: [ 4, 4, 4, 4 ] as [ number, number, number, number ],
										},
									],
								],
							},
							layout: {
								hLineWidth: () => 0.8,
								vLineWidth: () => 0.8,
								hLineColor: () => "#d97706",
								vLineColor: () => "#d97706",
							},
						},
						{ text: "", margin: [ 0, 8, 0, 0 ] as [ number, number, number, number ] },
						{
							table: {
								headerRows: 1,
								widths: [ "70%", "30%" ],
								body: [
									[
										{
											text: "Descrição",
											fontSize: 7,
											bold: true,
											fillColor: "#d97706",
											color: "#ffffff",
											margin: [ 2, 2, 2, 2 ] as [ number, number, number, number ],
										},
										{
											text: "Valor",
											fontSize: 7,
											bold: true,
											fillColor: "#d97706",
											color: "#ffffff",
											alignment: "right" as const,
											margin: [ 2, 2, 2, 2 ] as [ number, number, number, number ],
										},
									],
									...deductionsList.map( ( d ) => [
								{
									text: d.description || "-",
									fontSize: 7,
									fillColor: "#fef3c7",
									margin: [ 2, 2, 2, 2 ] as [ number, number, number, number ],
								},
								{
									text: formatCurrencyBRL( d.value ),
									fontSize: 7,
									fillColor: "#fef3c7",
									alignment: "right" as const,
									margin: [ 2, 2, 2, 2 ] as [ number, number, number, number ],
								},
							] ),
								],
							},
							layout: {
								hLineWidth: () => 0.8,
								vLineWidth: () => 0.8,
								hLineColor: () => "#d97706",
								vLineColor: () => "#d97706",
							},
						},
					],
				}
				: null

		const content: Content[] = [
			headerSection as Content,
			companySellerSection as Content,
			commissionTotalsSection as Content,
			rulesTermoSection as Content,
			salesHeaderTable as Content,
			salesTablesSection as Content,
			...( deductionsDetailSection ? [ deductionsDetailSection as Content ] : [] ),
		]

		const docDefinitions: TDocumentDefinitions = {
			defaultStyle: { font: "Helvetica" },
			content,
			pageSize: "A4",
			pageOrientation: "portrait",
			pageMargins: [ 40, 25, 40, 40 ],
			styles: {
				tableHeader: {
					fontSize: 7,
					bold: true,
					alignment: "center",
					fillColor: "#009512",
					color: "#ffffff",
					margin: [ 2, 2, 2, 2 ],
				},
				tableCell: {
					fontSize: 7,
					margin: [ 2, 1, 2, 1 ],
					alignment: "center",
				},
				salesTableHeader: {
					fontSize: 7,
					bold: true,
					alignment: "center",
					fillColor: "#009512",
					color: "#ffffff",
					margin: [ 2, 2, 2, 2 ],
				},
				salesTableCell: {
					fontSize: 7,
					margin: [ 2, 1, 2, 1 ],
					alignment: "center",
				},
				sectionHeader: {
					fontSize: 7,
					bold: true,
					alignment: "center",
					fillColor: "#009512",
					color: "#ffffff",
					margin: [ 2, 2, 2, 2 ],
				},
				sectionHeaderLeft: {
					fontSize: 7,
					bold: true,
					alignment: "left",
					fillColor: "#009512",
					color: "#ffffff",
					margin: [ 2, 2, 2, 2 ],
				},
				salesSectionHeader: {
					fontSize: 9,
					bold: true,
					alignment: "center",
					fillColor: "#009512",
					color: "#ffffff",
					margin: [ 4, 4, 4, 4 ],
				},
			},
		}

		const pdfDoc = printer.createPdfKitDocument( docDefinitions )
		const chunks: Buffer[] = []

		pdfDoc.on( "data", ( chunk: Buffer ) => chunks.push( chunk ) )

		await new Promise<void>( ( resolve, reject ) => {
			pdfDoc.on( "end", () => resolve() )
			pdfDoc.on( "error", reject )
			pdfDoc.end()
		} )

		const safeName = vendedorDisplayName
			.replace( /[^\w\s]/g, "" )
			.replace( /\s+/g, "_" )
			.trim()
			.normalize( "NFD" )
			.replace( /[\u0300-\u036f]/g, "" ) || "vendedor"

		const filename = `Relatorio_Comissao_${ safeName }_${ mesNum }_${ anoNum }.pdf`

		const pdf = Buffer.concat( chunks as unknown as readonly Uint8Array[] )
		res.setHeader( "Content-Disposition", `inline; filename="${ filename }"` )
		res.setHeader( "Content-Type", "application/pdf" )
		res.end( pdf )
	} catch ( error: any ) {
		console.error( "[commission/pdf]", error?.message || error )
		const status = error.response?.status || 500
		const data = error.response?.data || {
			message: error?.message || "Internal Server Error",
		}
		return res.status( status ).json( data )
	}
}
