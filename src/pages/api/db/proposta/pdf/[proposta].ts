import fs from "fs"
import { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import PDFPrinter from "pdfmake"
import { TDocumentDefinitions, Content } from "pdfmake/interfaces"
import { getData } from "./lib/getinf"

function normalizarValorMonetario ( valor: string | number | null | undefined ): number {
	const str = String( valor ?? "" ).trim()
	let valorNorm = str

	// Se contém ponto e vírgula (ex: 1.234,56)
	if ( valorNorm.includes( '.' ) && valorNorm.includes( ',' ) ) {
		valorNorm = valorNorm.replace( /\./g, '' ) // remove pontos de milhar
		valorNorm = valorNorm.replace( ',', '.' ) // vírgula vira decimal
	}
	// Se contém só vírgula (ex: 1234,56)
	else if ( valorNorm.includes( ',' ) ) {
		valorNorm = valorNorm.replace( ',', '.' ) // vírgula vira decimal
	}
	// Se contém só ponto (ex: 1.234 ou 1234.56)
	else if ( valorNorm.includes( '.' ) ) {
		const partes = valorNorm.split( '.' )
		// Se o ponto está separando milhar (ex: 1.234)
		if ( partes[ partes.length - 1 ].length !== 2 ) {
			valorNorm = valorNorm.replace( /\./g, '' ) // remove pontos de milhar
		}
		// senão, assume-se que já é decimal corretamente formatado
	}

	return parseFloat( valorNorm ) || 0
}

function formatarTelefone ( telefone: string ) {
	const numeros = telefone.replace( /\D/g, "" )

	if ( numeros.length === 11 ) {
		return `(${ numeros.slice( 0, 2 ) }) ${ numeros.slice( 2, 3 ) } ${ numeros.slice(
			3,
			7
		) }-${ numeros.slice( 7 ) }`
	} else if ( numeros.length === 10 ) {
		return `(${ numeros.slice( 0, 2 ) }) ${ numeros.slice( 2, 6 ) }-${ numeros.slice(
			6
		) }`
	} else {
		return ""
	}
}

export default async function GetEmpresa (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method === "GET" ) {
		const { proposta, montFree, expoFree, cleanDefaultObs, latam, obsFree } = req.query

		const latamActive = latam !== undefined
		const montFreeActive = montFree !== undefined || latamActive
		const expoFreeActive = expoFree !== undefined || latamActive
		const obsFreeActive = obsFree !== undefined || latamActive

		const infos = await getData( proposta )

		if ( latamActive ) {
			infos.fornecedor.data.cnpj = infos.fornecedor.data.cnpj.replace( /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "00.000.000/0000-00" )
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


		const paymentTerms = infos.prazo === "1" || infos.prazo === 1 ? "À vista" : infos.prazo
		const valorFrete = normalizarValorMonetario( infos.Valfrete )
		let valorSubTotal = 0
		const valorDesconto = normalizarValorMonetario( infos.Desconto )
		const valorCustoAdicional = normalizarValorMonetario( infos.custoAdicional )

		const logo = infos.fornecedor.data.cnpj === "04.586.593/0001-70" ? dataUrl : dataUrl2

		const Product = infos.itens
		const products = Product.map( ( i: any ) => {

			const ValorOriginal = normalizarValorMonetario( i.vFinal )
			const valorMontagem = i.mont && !montFreeActive ? ValorOriginal * 0.1 : 0
			const valorExportacao = i.expo && !expoFreeActive ? ValorOriginal * 0.1 : 0
			const valorUnitario = ValorOriginal + valorMontagem + valorExportacao
			const valorTotal = valorUnitario * i.Qtd

			valorSubTotal += valorTotal

			let measures = i.comprimento || ""
			measures += i.largura ? " x " + i.largura : ""
			measures += i.altura ? " x " + i.altura + "cm(alt.)" : "cm(largura)"
			measures = i.comprimento ? measures : ""

			const stackNomeProd: any[] = [ {
				text: i.nomeProd,
				alignment: "left",
				fontSize: 10,
				bold: true,
				lineHeight: 1.3
			} ]
			if ( !!measures ) {
				stackNomeProd.push( {
					table: {
						body: [
							[
								{
									text: `Med. internas: ${ measures }`,
									alignment: "center",
									color: "#000000",
									fontSize: 10,
								} ] ]
					},
					layout: {
						fillColor: function () { return "#fbff04" },
						paddingLeft: function () { return 3 },
						paddingRight: function () { return 3 },
						paddingTop: function () { return 3 },
						paddingBottom: function () { return 3 },
						hLineWidth: function () { return 0 },
						vLineWidth: function () { return 0 }
					},
					margin: [ 0, 4, 0, 0 ]
				} )
			}
			if ( !!i.codigo ) {
				stackNomeProd.push( {
					text: `Código: ${ i.codigo }`,
					alignment: "left",
					fontSize: 9,
					color: '#666666',
					bold: true,
					margin: [ 0, 4, 0, 0 ]
				} )
			}

			let stackMontagem: any[] = []
			if ( i.mont || montFreeActive ) {
				stackMontagem.push( {
					table: {
						body: [
							[ {
								text: "SIM",
								alignment: "center",
								color: "#ffffff",
								bold: true,
								fontSize: 8,
							} ]
						],
					},
					layout: {
						fillColor: function () { return "#009512" },
						paddingLeft: function () { return 5 },
						paddingRight: function () { return 5 },
						paddingTop: function () { return 3 },
						paddingBottom: function () { return 3 },
						hLineWidth: function () { return 0 },
						vLineWidth: function () { return 0 }
					},
					margin: [ 17, 0, 0, 5 ]
				} )
				stackMontagem.push( {
					text: "+ " + valorMontagem.toLocaleString( "pt-br", { minimumFractionDigits: 2, maximumFractionDigits: 2 } ),
					alignment: "center"
				} )
			}
			else {
				stackMontagem.push( {
					table: {
						body: [
							[ {
								text: "NÃO",
								alignment: "center",
								color: "#ffffff",
								bold: true,
								fontSize: 8,
							} ]
						],
					},
					layout: {
						fillColor: function () { return "#666666" },
						paddingLeft: function () { return 3 },
						paddingRight: function () { return 3 },
						paddingTop: function () { return 3 },
						paddingBottom: function () { return 3 },
						hLineWidth: function () { return 0 },
						vLineWidth: function () { return 0 }
					},
					margin: [ 17, 0, 0, 0 ]
				} )
			}

			let stackExportacao: any[] = []
			if ( i.expo || expoFreeActive ) {
				stackExportacao.push( {
					table: {
						body: [
							[ {
								text: "SIM",
								alignment: "center",
								color: "#ffffff",
								bold: true,
								fontSize: 8,
							} ]
						],
					},
					layout: {
						fillColor: function () { return "#009512" },
						paddingLeft: function () { return 5 },
						paddingRight: function () { return 5 },
						paddingTop: function () { return 3 },
						paddingBottom: function () { return 3 },
						hLineWidth: function () { return 0 },
						vLineWidth: function () { return 0 }
					},
					margin: [ 17, 0, 0, 5 ]
				} )
				stackExportacao.push( {
					text: "+ " + valorExportacao.toLocaleString( "pt-br", { minimumFractionDigits: 2, maximumFractionDigits: 2 } ),
					alignment: "center"
				} )
			}
			else {
				stackExportacao.push( {
					table: {
						body: [
							[ {
								text: "NÃO",
								alignment: "center",
								color: "#ffffff",
								bold: true,
								fontSize: 8,
							} ]
						],
					},
					layout: {
						fillColor: function () { return "#666666" },
						paddingLeft: function () { return 3 },
						paddingRight: function () { return 3 },
						paddingTop: function () { return 3 },
						paddingBottom: function () { return 3 },
						hLineWidth: function () { return 0 },
						vLineWidth: function () { return 0 }
					},
					margin: [ 17, 0, 0, 0 ]
				} )
			}

			return [
				{
					stack: [
						...stackNomeProd
					],
					style: "prodCells",
					alignment: "left"
				},
				{
					text: ValorOriginal.toLocaleString( "pt-br", { minimumFractionDigits: 2, maximumFractionDigits: 2 } ),
					style: "prodCells",
					alignment: "center"
				},
				{
					stack: [
						...stackMontagem
					],
					style: "prodCells",
					alignment: "center"
				},
				{
					stack: [
						...stackExportacao
					],
					style: "prodCells",
					alignment: "center"
				},
				{
					text: valorUnitario.toLocaleString( "pt-br", { minimumFractionDigits: 2, maximumFractionDigits: 2 } ),
					style: "prodCells",
					alignment: "center"
				},
				{
					text: i.Qtd,
					style: "prodCells",
					alignment: "center"
				},

				{ text: valorTotal.toLocaleString( "pt-br", { minimumFractionDigits: 2, maximumFractionDigits: 2 } ), style: "prodCells", alignment: "center", bold: true }
			]
		} )

		// Cabeçalho principal compacto
		const headerSection = {
			margin: [ 0, 0, 0, 15 ],
			columns: [
				{
					width: '60%',
					alignment: 'left',
					stack: [
						{
							text: 'PROPOSTA COMERCIAL',
							fontSize: 20,
							bold: true,
							color: '#009512',
						},
						{
							text: `Data: ${ date }`,
							fontSize: 12,
							color: '#666666',
							margin: [ 0, 5, 0, 0 ]
						},
						{
							text: `Validade da proposta: 10 dias`,
							fontSize: 12,
							color: '#666666',
							margin: [ 0, 5, 0, 0 ]
						}
					],
					margin: [ 0, 15, 0, 0 ]
				},
				{
					width: '40%',
					image: logo,
					fit: [ 100, 100 ],
					alignment: 'right'
				}
			]
		}

		let enderecoCliente = infos.cliente.endereco + ', ' + infos.cliente.numero
		enderecoCliente += !!infos.cliente.complemento ? ' - ' + infos.cliente.complemento : ''
		enderecoCliente += !!infos.cliente.bairro ? ' - ' + infos.cliente.bairro : ''
		enderecoCliente += !!infos.cliente.cidade ? ' - ' + infos.cliente.cidade : ''
		enderecoCliente += !!infos.cliente.uf ? ' ' + infos.cliente.uf : ''

		const enderecoFornecedor = infos.fornecedor.data.endereco + ' - ' + infos.fornecedor.data.cidade + ' ' + infos.fornecedor.data.uf

		// Informações de cliente e fornecedor compactas
		const clienteFornecedorCompact = {
			margin: [ 0, 0, 0, 10 ],
			columns: [
				{
					width: '50%',
					margin: [ 0, 0, 5, 0 ],
					table: {
						widths: [ '25%', '75%' ],
						body: [
							[
								{ text: 'CLIENTE', style: 'sectionHeader', colSpan: 2 }, {}
							],
							[
								{ text: 'Razão Social:', bold: true, fontSize: 8, alignment: 'left', lineHeight: 1.3, margin: [ 0, 2, 0, 0 ] },
								{ text: infos.cliente.razao, fontSize: 9, lineHeight: 1.3, margin: [ 0, 2, 0, 0 ] }
							],
							[
								{ text: 'CNPJ:', bold: true, fontSize: 8, alignment: 'left', lineHeight: 1.3, margin: [ 0, 2, 0, 0 ] },
								{ text: infos.cliente.CNPJ.replace( /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5" ), fontSize: 9, lineHeight: 1.3, margin: [ 0, 2, 0, 0 ] }
							],
							[
								{ text: 'Contato:', bold: true, fontSize: 8, alignment: 'left', lineHeight: 1.3, margin: [ 0, 2, 0, 0 ] },
								{
									stack: [
										{ text: formatarTelefone( infos.cliente.fone ), fontSize: 9, lineHeight: 1.3, margin: [ 0, 2, 0, 0 ] },
										{ text: infos.cliente.email, fontSize: 9, lineHeight: 1.3, margin: [ 0, 2, 0, 0 ] }
									]
								}
							],
							[
								{ text: 'Endereço:', bold: true, fontSize: 8, alignment: 'left', lineHeight: 1.3, margin: [ 0, 2, 0, 0 ] },
								{
									stack: [
										{ text: enderecoCliente, fontSize: 9, lineHeight: 1.3, margin: [ 0, 2, 0, 0 ] }
									]
								}
							]
						]
					},
					layout: {
						hLineWidth: function () { return 0.5 },
						vLineWidth: function () { return 0.5 },
						hLineColor: function () { return '#AACCAA' },
						vLineColor: function () { return '#AACCAA' },
						fillColor: function ( rowIndex: number ) {
							if ( rowIndex === 0 ) return '#009512'
							return ( rowIndex % 2 === 0 ) ? '#eeffee' : null
						}
					}
				},
				{
					width: '50%',
					margin: [ 5, 0, 5, 0 ],
					table: {
						widths: [ '25%', '75%' ],
						body: [
							[
								{ text: 'FORNECEDOR', style: 'sectionHeader', colSpan: 2, alignment: 'left' }, {}
							],
							[
								{ text: 'Razão Social:', bold: true, fontSize: 8, alignment: 'left', lineHeight: 1.3, margin: [ 0, 2, 0, 0 ] },
								{ text: infos.fornecedor.data.razao, fontSize: 9, lineHeight: 1.3, margin: [ 0, 2, 0, 0 ] }
							],
							[
								{ text: 'CNPJ:', bold: true, fontSize: 8, alignment: 'left', lineHeight: 1.3, margin: [ 0, 2, 0, 0 ] },
								{ text: infos.fornecedor.data.cnpj.replace( /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5" ), fontSize: 9, lineHeight: 1.3, margin: [ 0, 2, 0, 0 ] }
							],
							[
								{ text: 'Contato:', bold: true, fontSize: 8, alignment: 'left', lineHeight: 1.3, margin: [ 0, 2, 0, 0 ] },
								{
									stack: [
										{ text: formatarTelefone( String( infos.fornecedor.data.tel ) ), fontSize: 9, lineHeight: 1.3, margin: [ 0, 2, 0, 0 ] },
										{ text: infos.fornecedor.data.email, fontSize: 9, lineHeight: 1.3, margin: [ 0, 2, 0, 0 ] }
									]
								}
							],
							[
								{ text: 'Endereço:', bold: true, fontSize: 8, alignment: 'left', lineHeight: 1.3, margin: [ 0, 2, 0, 0 ] },
								{
									stack: [
										{ text: enderecoFornecedor, fontSize: 9, lineHeight: 1.3, margin: [ 0, 2, 0, 0 ] }
									]
								}
							]
						]
					},
					layout: {
						hLineWidth: function () { return 0.5 },
						vLineWidth: function () { return 0.5 },
						hLineColor: function () { return '#AACCAA' },
						vLineColor: function () { return '#AACCAA' },
						fillColor: function ( rowIndex: number ) {
							if ( rowIndex === 0 ) return '#009512'
							return ( rowIndex % 2 === 0 ) ? '#eeffee' : null
						}
					}
				}
			]
		}

		const condicoesComerciais = {
			margin: [ 0, 0, 0, 10 ],
			columns: [
				{
					width: '50%',
					margin: [ 0, 0, 5, 0 ],
					table: {
						widths: [ '35%', '65%' ],
						body: [
							[
								{ text: 'DADOS DA PROPOSTA', style: 'sectionHeader', colSpan: 2, alignment: 'left' }, {}
							],
							[
								{ text: 'Nº da Proposta:', bold: true, fontSize: 8, alignment: 'left', margin: [ 0, 2, 0, 0 ] },
								{ text: proposta, fontSize: 11, lineHeight: 1.5, margin: [ 0, 2, 0, 0 ] }
							],
							[
								{ text: 'Nº do Pedido:', bold: true, fontSize: 8, alignment: 'left', margin: [ 0, 2, 0, 0 ] },
								{ text: infos.cliente_pedido || "", fontSize: 11, lineHeight: 1.5, margin: [ 0, 2, 0, 0 ] }
							],
							[
								{ text: 'Vendedor:', bold: true, fontSize: 8, alignment: 'left', margin: [ 0, 2, 0, 0 ] },
								{ text: infos.Vendedor, fontSize: 11, lineHeight: 1.5, margin: [ 0, 2, 0, 0 ] }
							]
						]
					},
					layout: {
						hLineWidth: function () { return 0.5 },
						vLineWidth: function () { return 0.5 },
						hLineColor: function () { return '#AACCAA' },
						vLineColor: function () { return '#AACCAA' },
						fillColor: function ( rowIndex: number ) {
							if ( rowIndex === 0 ) return '#009512'
							return ( rowIndex % 2 === 0 ) ? '#eeffee' : null
						}
					}
				},
				{
					width: '50%',
					margin: [ 5, 0, 5, 0 ],
					table: {
						widths: [ '35%', '65%' ],
						body: [
							[
								{ text: 'CONDIÇÕES DE FORNECIMENTO', style: 'sectionHeader', colSpan: 2, alignment: 'left' }, {}
							],
							[
								{ text: 'Prazo de Pagamento:', bold: true, fontSize: 8, alignment: 'left', lineHeight: 1.5, margin: [ 0, 2, 0, 0 ] },
								{ text: paymentTerms, fontSize: 11, lineHeight: 1.5, margin: [ 0, 2, 0, 0 ] }
							],
							[
								{ text: 'Tipo de Frete:', bold: true, fontSize: 8, alignment: 'left', lineHeight: 1.5, margin: [ 0, 2, 0, 0 ] },
								{ text: infos.frete, fontSize: 11, lineHeight: 1.5, margin: [ 0, 2, 0, 0 ] }
							],
							[
								{ text: 'Prazo de Entrega:', bold: true, fontSize: 8, alignment: 'left', lineHeight: 1.5, margin: [ 0, 2, 0, 0 ] },
								{ text: infos.dataEntrega, fontSize: 11, lineHeight: 1.5, margin: [ 0, 2, 0, 0 ] }
							]
						]
					},
					layout: {
						hLineWidth: function () { return 0.5 },
						vLineWidth: function () { return 0.5 },
						hLineColor: function () { return '#AACCAA' },
						vLineColor: function () { return '#AACCAA' },
						fillColor: function ( rowIndex: number ) {
							if ( rowIndex === 0 ) return '#009512'
							return ( rowIndex % 2 === 0 ) ? '#eeffee' : null
						}
					}
				}
			]
		}


		// Tabela de produtos - FOCO PRINCIPAL
		const tabelaProdutos = {
			margin: [ 0, 0, 0, 10 ],
			table: {
				headerRows: 1,
				widths: [
					"38%",   // Produto 
					"10%",   // Preço
					"12%",   // Montagem
					"12%",   // Exportação
					"10%",   // Valor Unitário
					"6%",    // Qtde.
					"12%",   // Total
				],
				body: [
					[
						{ text: "Produto", style: "tableHeader" },
						{ text: "Preço", style: "tableHeader" },
						{
							stack: [
								{ text: "Montagem", alignment: "center" },
								...( !montFreeActive ? [ { text: "(+10%)", alignment: "center", margin: [ 0, 2, 0, 0 ] } ] : [] ),
							],
							style: "tableHeader"
						},
						{
							stack: [
								{ text: "Exportação", alignment: "center" },
								...( !expoFreeActive ? [ { text: "(+10%)", alignment: "center", margin: [ 0, 2, 0, 0 ] } ] : [] )
							],
							style: "tableHeader"
						},
						{ text: "Valor Unitário", style: "tableHeader" },
						{ text: "Qtde.", style: "tableHeader" },
						{ text: "Subtotal", style: "tableHeader" },
					],
					...products,
				],
				// Evita quebra de linhas entre páginas
				dontBreakRows: true,
				keepWithHeaderRows: 1
			},
			layout: {
				hLineWidth: function ( i: number, node: { table: { body: any[] } } ) {
					return ( i === 0 || i === 1 || i === node.table.body.length ) ? 1.5 : 0.8
				},
				vLineWidth: function () {
					return 0.8
				},
				hLineColor: function ( i: number ) {
					return ( i === 0 || i === 1 ) ? '#009512' : '#AACCAA'
				},
				vLineColor: function () {
					return '#AACCAA'
				},
				fillColor: function ( rowIndex: number ) {
					return ( rowIndex === 0 ) ? '#009512' : ( rowIndex % 2 === 0 ) ? '#eeffee' : null
				}
			}
		}

		// Blocos finais: Informações importantes e Resumo financeiro lado a lado
		const blocosFinais = {
			margin: [ 0, 0, 0, 10 ],
			// Evita quebra do bloco entre páginas
			unbreakable: true,
			columns: [
				// Informações importantes (incluindo observações se houver)
				{
					width: '65%',
					margin: [ 0, 0, 5, 0 ],
					table: {
						widths: [ '*' ],
						body: [
							[
								{
									text: "INFORMAÇÕES IMPORTANTES",
									style: 'sectionHeader'
								}
							],
							[
								{
									margin: [ 8, 5, 8, 5 ],
									stack: [
										...( !obsFreeActive ? [ {
											text: "• Por padrão, todas as ambalagens são enviadas desmontadas;\n• Serviço de Montagem (+10%) deve ser solicitado na cotação;\n• Tratamento para Exportação (+10%) deve ser solicitado na cotação.",
											fontSize: 10,
											lineHeight: 2
										} ] : [] ),
										// Adiciona observações se existirem
										infos.obs ? {
											text: [
												{ text: "\nOBSERVAÇÕES: ", bold: true },
												{ text: infos.obs }
											],
											fontSize: 10,
											lineHeight: 2,
											margin: [ 0, 5, 0, 0 ]
										} : {}
									]
								}
							]
						]
					},
					layout: {
						hLineWidth: function () { return 1 },
						vLineWidth: function () { return 1 },
						hLineColor: function () { return '#AACCAA' },
						vLineColor: function () { return '#AACCAA' }
					}
				},

				// Resumo financeiro
				{
					width: '35%',
					margin: [ 5, 0, 0, 0 ],
					table: {
						widths: [ '45%', '55%' ],
						body: [
							[
								{ text: "RESUMO FINANCEIRO", style: 'sectionHeader', colSpan: 2 }, {}
							],
							[
								{ text: "Subtotal:", fontSize: 10, alignment: 'right', margin: [ 5, 5, 5, 2 ] },
								{ text: valorSubTotal.toLocaleString( "pt-br", { minimumFractionDigits: 2, maximumFractionDigits: 2 } ), fontSize: 10, alignment: 'right', margin: [ 5, 5, 5, 2 ] }
							],
							[
								{ text: "Desconto:", fontSize: 10, alignment: 'right', margin: [ 5, 2, 5, 2 ] },
								{
									text: !!valorDesconto
										? "- " + valorDesconto.toLocaleString( "pt-br", { minimumFractionDigits: 2, maximumFractionDigits: 2 } )
										: "0,00",
									fontSize: 10,
									alignment: 'right',
									margin: [ 5, 2, 5, 2 ],
									color: !!valorDesconto ? '#ff0000' : '#000000'
								}
							],
							[
								{ text: "Custos extras:", fontSize: 10, alignment: 'right', margin: [ 5, 2, 5, 2 ] },
								{ text: valorCustoAdicional.toLocaleString( "pt-br", { minimumFractionDigits: 2, maximumFractionDigits: 2 } ), fontSize: 10, alignment: 'right', margin: [ 5, 2, 5, 2 ] }
							],
							[
								{ text: "Frete:", fontSize: 10, alignment: 'right', margin: [ 5, 2, 5, 2 ] },
								{ text: valorFrete.toLocaleString( "pt-br", { minimumFractionDigits: 2, maximumFractionDigits: 2 } ), fontSize: 10, alignment: 'right', margin: [ 5, 2, 5, 2 ] }
							],
							[
								{ text: "TOTAL:", fontSize: 12, bold: true, alignment: 'right', margin: [ 5, 5, 5, 5 ], fillColor: '#009512', color: '#ffffff' },
								{ text: "R$ " + ( valorSubTotal - valorDesconto + valorCustoAdicional + valorFrete ).toLocaleString( "pt-br", { minimumFractionDigits: 2, maximumFractionDigits: 2 } ), fontSize: 12, bold: true, alignment: 'right', margin: [ 5, 5, 5, 5 ], fillColor: '#009512', color: '#ffffff' }
							]
						]
					},
					layout: {
						hLineWidth: function () { return 1 },
						vLineWidth: function () { return 1 },
						hLineColor: function () { return '#AACCAA' },
						vLineColor: function () { return '#AACCAA' }
					}
				}
			]
		}

		const docDefinitions: TDocumentDefinitions = {
			defaultStyle: { font: "Helvetica" },
			content: [
				headerSection,
				condicoesComerciais,
				clienteFornecedorCompact,
				{
					text: "PRODUTOS & SERVIÇOS",
					fontSize: 13,
					bold: true,
					color: "#009512",
					margin: [ 0, 5, 0, 8 ],
					alignment: 'center'
				},
				tabelaProdutos,
				blocosFinais
			].filter( Boolean ) as Content[],
			pageSize: "A4",
			pageOrientation: "portrait",
			pageMargins: [ 20, 20, 20, 30 ],
			styles: {
				tableHeader: {
					fontSize: 10,
					bold: true,
					alignment: "center",
					fillColor: "#009512",
					color: "#ffffff",
					margin: [ 1, 4, 1, 4 ]
				},
				prodCells: {
					margin: [ 1, 4, 1, 4 ],
					fontSize: 9
				},
				sectionHeader: {
					fontSize: 10,
					bold: true,
					alignment: "left",
					fillColor: "#009512",
					color: "#ffffff",
					margin: [ 1, 2, 1, 2 ]
				}
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