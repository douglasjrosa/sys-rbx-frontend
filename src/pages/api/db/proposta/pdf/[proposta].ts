import fs from "fs"
import { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import PDFPrinter from "pdfmake"
import { TDocumentDefinitions } from "pdfmake/interfaces"
import { getData } from "./lib/getinf"

function formatarTelefone ( telefone: any ) {

	const números = telefone.replace( /\D/g, "" )

	if ( números.length === 11 ) {

		return `(${ números.slice( 0, 2 ) }) ${ números.slice( 2, 3 ) } ${ números.slice(
			3,
			7
		) }-${ números.slice( 7 ) }`
	} else if ( números.length === 10 ) {

		return `(${ números.slice( 0, 2 ) }) ${ números.slice( 2, 6 ) }-${ números.slice(
			6
		) }`
	} else {

		return ""
	}
}

function verificarString ( str: any ) {

	const wordRegex = /\b(?:Dias|dias|Dia|dia)\b/
	const hasWord = wordRegex.test( str )

	if ( hasWord ) {
		return str
	}

	return str + " dias"
}

export default async function GetEmpresa (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method === "GET" ) {
		const { proposta } = req.query

		const infos = await getData( proposta )

		const somarValores = ( valor1: any, valor2: any ) => {
			if ( infos.frete === "FOB" ) return valor1

			const numero1 = valor1
				? parseFloat(
					valor1.replace( "R$", "" ).replace( ".", "" ).replace( ",", "." )
				)
				: 0
			const numero2 = valor2
				? parseFloat(
					valor2.replace( "R$", "" ).replace( ".", "" ).replace( ",", "." )
				)
				: 0
			const soma = numero1 + numero2

			if ( !numero2 ) {
				return numero1.toLocaleString( "pt-br", {
					style: "currency",
					currency: "BRL",
				} )
			}

			return soma.toLocaleString( "pt-br", {
				style: "currency",
				currency: "BRL",
			} )
		}

		const imagePath2 = path.join(
			process.cwd(),
			"public",
			"img",
			"logomarca-efect.jpg"
		)
		const imageContent2 = fs.readFileSync( imagePath2 ).toString( "base64" )
		const dataUrl2 = `data:image/jpeg;base64,${ imageContent2 }`

		const imagePath = path.join(
			process.cwd(),
			"public",
			"img",
			"Bragheto - Logomarca com nome (Fundo transparente).png"
		)
		const imageContent = fs.readFileSync( imagePath ).toString( "base64" )
		const dataUrl = `data:image/jpeg;base64,${ imageContent }`

		const date = new Date().toLocaleDateString( "pt-BR" )
		const fonts = {
			Helvetica: {
				normal: "Helvetica",
				bold: "Helvetica-Bold",
				italics: "Helvetica-Oblique",
				bolditalics: "Helvetica-BoldOblique",
			},
		}
		const printer = new PDFPrinter( fonts )

		const Product = infos.itens
		const products = Product.map( ( i: any, x: number ) => {
			const preco = parseFloat(
				i.vFinal.replace( ".", "" ).replace( ",", "." )
			).toLocaleString( "pt-br", { style: "currency", currency: "BRL" } )

			const ValorOriginal = i.vFinal.replace( ".", "" ).replace( ",", "." )
			const acrec =
				i.mont === true && i.expo === true
					? 1.2
					: i.expo === true && i.mont === false
						? 1.1
						: i.expo === false && i.mont === true
							? 1.1
							: 0
			const somaAcrescimo =
				acrec === 0 ? ValorOriginal * i.Qtd : ValorOriginal * acrec * i.Qtd
			const TotalItem = somaAcrescimo
			const result = Math.round( parseFloat( TotalItem.toFixed( 2 ) ) * 100 ) / 100
			const total = result.toLocaleString( "pt-br", {
				style: "currency",
				currency: "BRL",
			} )

			let measures = i.comprimento || ""
			measures += i.largura ? " x " + i.largura : ""
			measures += i.altura ? " x " + i.altura + "cm(alt.)" : "cm(larg.)"
			measures = i.comprimento ? measures : ""

			return [
				{ text: x, margin: [ 0, 10, 0, 8 ], fontSize: 7 },
				{ text: i.nomeProd, margin: [ 0, 10, 0, 8 ], fontSize: 7 },
				{ text: i.codigo, margin: [ 0, 10, 0, 8 ], fontSize: 7 },
				{ text: i.Qtd, margin: [ 0, 10, 0, 8 ], fontSize: 7 },
				{ text: measures, margin: [ 0, 10, 0, 8 ], fontSize: 7 },
				{ text: !!i.mont ? "SIM" : "NÃO", margin: [ 0, 10, 0, 8 ], fontSize: 7 },
				{ text: !!i.expo ? "SIM" : "NÃO", margin: [ 0, 10, 0, 8 ], fontSize: 7 },
				{ text: preco, margin: [ 0, 10, 0, 8 ], fontSize: 7 },
				{ text: total, margin: [ 0, 10, 0, 8 ], fontSize: 7 },
			]
		} )

		const comAcrescimo = [
			{
				margin: [ 0, 10, 0, 0 ],
				border: [ false, false, false, false ],
				text: "Custos extras:",
				bold: "true",
				fontSize: 8
			},
			{
				margin: [ 0, 10, 0, 0 ],
				border: [ false, false, false, false ],
				text: `R$ ${ infos.custoAdicional }`,
				fontSize: 8
			},
		]

		const semAcrescimo = [
			{
				margin: [ 0, 5, 0, 0 ],
				border: [ false, false, false, false ],
				text: "",
			},
			{
				margin: [ 0, 5, 0, 0 ],
				border: [ false, false, false, false ],
				text: "",
			},
		]

		const custoAdicional = infos.custoAdicional !== '0,00' ? comAcrescimo : semAcrescimo

		const comDesc = [
			{
				margin: [ 0, 10, 0, 0 ],
				border: [ false, false, false, false ],
				text: "Desconto :",
				bold: "true",
				fontSize: 10
			},
			{
				margin: [ 0, 10, 0, 0 ],
				border: [ false, false, false, false ],
				text: `- R$ ${ infos.Desconto }`,
				bold: "true",
				fontSize: 10
			},
		]

		const semDesc = [
			{
				margin: [ 0, 5, 0, 0 ],
				border: [ false, false, false, false ],
				text: "",
			},
			{
				margin: [ 0, 5, 0, 0 ],
				border: [ false, false, false, false ],
				text: "",
			},
		]

		const FretValo = !infos.Valfrete ? 'R$ 0,00' : Number( infos.Valfrete.replace( '.', '' ).replace( ',', '.' ) ).toLocaleString( "pt-br", {
			style: "currency",
			currency: "BRL",
		} )

		const descontoNumber = Number( infos.Desconto.replace( 'R$', '' ).replace( '.', '' ).replace( ',', '.' ) )
		const desconto = descontoNumber === 0 ? semDesc : comDesc

		const observations = infos.obs ? [
			[
				{
					margin: [ 0, 5, 0, 0 ],
					border: [ false, false, false, false ],
					text: "OBS.:"

				},
			],
			[
				{
					margin: [ 5, 5, 5, 5 ],
					border: [ false, false, false, false ],
					text: infos.obs,
					fillColor: '#4dff00',
					style: "clienteFornecedor",
					fontSize: 10,
				},
			] ] : []


		const logo =
			infos.fornecedor.data.cnpj === "04.586.593/0001-70" ? dataUrl : dataUrl2

		const docDefinitions: TDocumentDefinitions = {
			defaultStyle: { font: "Helvetica" },
			content: [
				{
					table: {
						widths: [ "*" ],
						body: [
							[
								{
									border: [ false, false, false, false ],
									fillColor: "#1a562e",
									text: " ",
									margin: [ 0, 1, 0, 0 ],
								},
							],
						],
					},
				},
				{
					style: "header",
					table: {
						widths: [ 310, "*" ],
						body: [
							[
								{
									border: [ false, false, false, false ],
									image: logo,
									fit: [ 80, 80 ],
									margin: [ 30, 3, 30, 3 ],
								},
								{
									border: [ false, false, false, false ],
									margin: [ 0, 5, 0, 5 ],
									table: {
										widths: [ 55, "*" ],
										body: [
											[ "Data:", date ],
											[ "Proposta N°:", proposta ],
											[ "Vendedor:", infos.Vendedor ],
											[ "Pedido N°:", infos.cliente_pedido ],
										],
									},
								},
							],
						],
					},
				},
				{
					table: {
						widths: [ "*" ],
						body: [
							[
								{
									border: [ false, true, false, false ],
									table: {
										widths: [ "*", "*" ],
										body: [
											[
												{
													margin: [ 0, 10, 0, 0 ],
													border: [ false, false, false, false ],
													style: "clienteFornecedor",
													table: {
														widths: [ "24%", "*" ],
														body: [
															[
																{
																	text: "Fornecedor",
																	bold: "true",
																	fillColor: "#1a562e",
																	color: "#ffffff",
																	fontSize: 10,
																	border: [ false, false, false, false ],
																},
																{
																	text: "",
																	fillColor: "#1a992e",
																	border: [ false, false, false, false ],
																},
															],
															[
																{
																	text: "Nome/Razão :",
																	border: [ false, false, false, false ],
																},
																{
																	text: infos.fornecedor.data.razao,
																	border: [ false, false, false, false ],
																},
															],
															[
																{
																	text: "Cnpj :",
																	border: [ false, false, false, false ],
																},
																{
																	text: infos.fornecedor.data.cnpj,
																	border: [ false, false, false, false ],
																},
															],
															[
																{
																	text: "Endereço :",
																	border: [ false, false, false, false ],
																},
																{
																	text: infos.fornecedor.data.endereco,
																	border: [ false, false, false, false ],
																},
															],
															[
																{
																	text: "Cidade :",
																	border: [ false, false, false, false ],
																},
																{
																	text:
																		infos.fornecedor.data.cidade +
																		", " +
																		infos.fornecedor.data.uf.toUpperCase(),
																	border: [ false, false, false, false ],
																},
															],
															[
																{
																	text: "Telefone :",
																	border: [ false, false, false, false ],
																},
																{
																	text: infos.fornecedor.data.tel,
																	border: [ false, false, false, false ],
																},
															],
															[
																{
																	text: "Email :",
																	border: [ false, false, false, false ],
																},
																{
																	text: infos.fornecedor.data.email,
																	border: [ false, false, false, false ],
																},
															],
														],
													},
												},
												{
													margin: [ 0, 10, 0, 0 ],
													border: [ false, false, false, false ],
													style: "clienteFornecedor",
													table: {
														widths: [ "23%", "*" ],
														body: [
															[
																{
																	text: "Cliente",
																	bold: "true",
																	fontSize: 9,
																	fillColor: "#1a562e",
																	color: "#ffffff",
																	border: [ false, false, false, false ],
																},
																{
																	text: "",
																	fillColor: "#1a992e",
																	border: [ false, false, false, false ],
																},
															],
															[
																{
																	text: "Nome/Razão :",
																	border: [ false, false, false, false ],
																},
																{
																	text: infos.cliente.razao,
																	border: [ false, false, false, false ],
																},
															],
															[
																{
																	text: "Cnpj :",
																	border: [ false, false, false, false ],
																},
																{
																	text: infos.cliente.CNPJ.replace(
																		/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
																		"$1.$2.$3/$4-$5"
																	),
																	border: [ false, false, false, false ],
																},
															],
															[
																{
																	text: "Endereço :",
																	border: [ false, false, false, false ],
																},
																{
																	text: infos.cliente.endereco,
																	border: [ false, false, false, false ],
																},
															],
															[
																{
																	text: "Cidade :",
																	border: [ false, false, false, false ],
																},
																{
																	text:
																		infos.cliente.cidade +
																		", " +
																		infos.cliente.uf.toUpperCase(),
																	border: [ false, false, false, false ],
																},
															],
															[
																{
																	text: "Telefone :",
																	border: [ false, false, false, false ],
																},
																{
																	text: formatarTelefone( infos.cliente.fone ),
																	border: [ false, false, false, false ],
																},
															],
															[
																{
																	text: "Email :",
																	border: [ false, false, false, false ],
																},
																{
																	text: infos.cliente.email,
																	border: [ false, false, false, false ],
																},
															],
														],
													},
												},
											],
										],
									},
								},
							],
						],
					},
				},
				{
					table: {
						widths: [ "*" ],
						body: [
							[
								{
									border: [ false, true, false, false ],
									text: "",
								},
							],
						],
					},
				},
				{
					style: "tableConteudo",
					margin: [ 0, 10, 0, 0 ],
					table: {
						widths: [
							"2%",
							"25%",
							"8%",
							"4%",
							"18%",
							"8%",
							"8%",
							"12%",
							"15%",
						],
						headerRows: 1,
						heights: 4,
						body: [
							[
								{ text: "x", style: "tableTitle" },
								{ text: "Produto", style: "tableTitle" },
								{ text: "Cód.", style: "tableTitle" },
								{ text: "Qtd", style: "tableTitle" },
								{ text: "Medidas internas (CxLxA)", style: "tableTitle" },
								{ text: "MONT.       (+ 10%)", style: "tableTitle" },
								{ text: "EXP.        (+ 10%)", style: "tableTitle" },
								{ text: "Valor Un.", style: "tableTitle" },
								{ text: "Total", style: "tableTitle" },
							],
							...products,
						],
					},
					layout: "lightHorizontalLines",
				},

				{
					table: {
						widths: [ "*" ],
						body: [
							[
								{
									border: [ false, false, false, true ],
									text: "",
								},
							],
						],
					},
				},

				{
					table: {
						widths: [ "*", "30%" ],
						body: [
							[
								{
									table: {
										widths: [ "*" ],
										body: [
											[
												{
													border: [ false, false, false, false ],
													text: "Avisos",
												},
											],
											[
												{
													margin: [ 0, 5, 0, 0 ],
													border: [ false, false, false, false ],
													text: "As embalagens, por padrão, são enviadas desmontadas.",
													style: "clienteFornecedor",
												},
											],
											[
												{
													border: [ false, false, false, false ],
													text: "Para o envio das embalagens montadas, há um acréscimo de 10%.",
													style: "clienteFornecedor",
												},
											],
											[
												{
													margin: [ 0, 6, 0, 8 ],
													border: [ false, false, false, false ],
													text: "A montagem deve ser solicitada no momento da cotação.",
													style: "clienteFornecedor",
												},
											],
											...observations,
										],
									},
								},
								{
									table: {
										widths: [ "*" ],
										body: [
											[
												{
													border: [ false, false, false, false ],
													table: {
														widths: [ "49%", "*" ],
														body: [
															[
																{
																	border: [ false, false, false, false ],
																	text: "Condição de pagamento:",
																	bold: "true",
																	fontSize: 8,
																},
																{
																	margin: [ 0, 5, 0, 0 ],
																	border: [ false, false, false, false ],
																	text: infos.condi,
																	style: "clienteFornecedor",
																},
															],

															[
																{
																	margin: [ 0, 5, 0, 0 ],
																	border: [ false, false, false, false ],
																	text: "Prazo:",
																	bold: "true",
																	style: "clienteFornecedor",
																},
																{
																	margin: [ 0, 5, 0, 0 ],
																	border: [ false, false, false, false ],
																	text: infos.condi === 'Antecipado' || infos.condi === 'Antecipado' ? null : verificarString( infos.prazo ),
																	style: "clienteFornecedor",
																},
															],

															[
																{
																	margin: [ 0, 5, 0, 0 ],
																	border: [ false, false, false, false ],
																	text: "Tipo de frete:",
																	bold: "true",
																	fontSize: 8,
																},
																{
																	margin: [ 0, 5, 0, 0 ],
																	border: [ false, false, false, false ],
																	text: infos.frete,
																	style: "clienteFornecedor",
																},
															],
															[
																{
																	margin: [ 0, 5, 0, 0 ],
																	border: [ false, false, false, false ],
																	text: "Prazo de produção:",
																	bold: "true",
																	fontSize: 8,
																},
																{
																	margin: [ 0, 5, 0, 0 ],
																	border: [ false, false, false, false ],
																	text: infos.dataEntrega,
																	style: "clienteFornecedor",
																},
															],
															[
																{
																	margin: [ 0, 5, 0, 0 ],
																	border: [ false, false, false, false ],
																	text: "Valor do frete:",
																	bold: "true",
																	fontSize: 8,
																},
																{
																	margin: [ 0, 5, 0, 0 ],
																	border: [ false, false, false, false ],
																	text: FretValo,
																	style: "clienteFornecedor",
																},
															],
															custoAdicional,
															desconto,
															[
																{
																	margin: [ 0, 5, 0, 0 ],
																	border: [ false, false, false, false ],
																	text: "Total:",
																	bold: "true",
																},
																{
																	margin: [ 0, 5, 0, 0 ],
																	border: [ false, false, false, false ],
																	text: infos.totoalGeral
																},
															],
														],
													},
												},
											],
										],
									},
								},
							],
						],
					},
				},

				{
					table: {
						widths: [ "*" ],
						body: [
							[
								{
									border: [ false, false, false, false ],
									fillColor: "#ffffff",
									text: " ",
									margin: [ 0, 1, 0, 0 ],
								},
							],
						],
					},
				},

				{
					table: {
						widths: [ "*" ],
						body: [
							[
								{
									border: [ false, false, false, false ],
									fillColor: "#1a992e",
									text: " ",
									margin: [ 0, 1, 0, 0 ],
								},
							],
						],
					},
				},

			],
			pageSize: "A4",
			pageMargins: [ 25, 60, 25, 10 ],
			styles: {
				header: {
					fontSize: 9,
					alignment: "justify",
				},
				clienteFornecedor: {
					fontSize: 8,
					alignment: "justify",
				},
				tableTitle: {
					fontSize: 8,
					alignment: "center",
				},
				tableConteudo: {
					fontSize: 9,
					alignment: "center",
				},
			},
		}

		const pdfDoc = printer.createPdfKitDocument( docDefinitions )

		const chunks: any[] = []

		pdfDoc.on( "data", ( chunk: any ) => {
			chunks.push( chunk )
		} )

		pdfDoc.end()

		const name = infos.cliente.nome
			.replace( /[^\w\s]/g, "" )
			.replace( /\s+/g, " " )
			.replace( /[.,]/g, "" )
			.trim()
			.normalize( "NFD" )
			.replace( /[\u0300-\u036f]/g, "" )

		const filename =
			"Proposta comercial -" +
			proposta +
			" - " +
			name +
			"-" +
			new Date().toLocaleDateString( "pt-BR" ) +
			".pdf"
		pdfDoc.on( "end", () => {
			const pdf = Buffer.concat( chunks )
			res.setHeader( "Content-Disposition", `inline; filename="${ filename }"` )
			res.setHeader( "Content-Type", "application/pdf" )
			res.end( pdf )
		} )
	}
	else {
		return res.status( 405 ).send( { message: "Only GET requests are allowed" } )
	}
}
