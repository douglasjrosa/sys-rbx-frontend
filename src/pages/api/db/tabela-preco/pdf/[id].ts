import fs from "fs"
import { NextApiRequest, NextApiResponse } from "next"
import path from "path"
import PDFPrinter from "pdfmake"
import { TDocumentDefinitions, Content } from "pdfmake/interfaces"
import axios from "axios"

function normalizarValorMonetario ( valor: string | number | null | undefined ): number {
	const str = String( valor ?? "" ).trim()
	let valorNorm = str

	if ( valorNorm.includes( '.' ) && valorNorm.includes( ',' ) ) {
		valorNorm = valorNorm.replace( /\./g, '' )
		valorNorm = valorNorm.replace( ',', '.' )
	} else if ( valorNorm.includes( ',' ) ) {
		valorNorm = valorNorm.replace( ',', '.' )
	} else if ( valorNorm.includes( '.' ) ) {
		const partes = valorNorm.split( '.' )
		if ( partes[partes.length - 1].length !== 2 ) {
			valorNorm = valorNorm.replace( /\./g, '' )
		}
	}

	return parseFloat( valorNorm ) || 0
}

function formatarTelefone ( telefone: string ) {
	const numeros = telefone.replace( /\D/g, "" )

	if ( numeros.length === 11 ) {
		return `(${ numeros.slice( 0, 2 ) }) ${ numeros.slice( 2, 3 ) } ${ numeros.slice(
			3, 7
		) }-${ numeros.slice( 7 ) }`
	} else if ( numeros.length === 10 ) {
		return `(${ numeros.slice( 0, 2 ) }) ${ numeros.slice( 2, 6 ) }-${ numeros.slice( 6 ) }`
	}
	return ""
}

export default async function GetTabelaPrecoPdf (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method !== "GET" ) {
		return res.status( 405 ).send( { message: "Only GET requests are allowed" } )
	}

	const { id } = req.query
	const token = process.env.ATORIZZATION_TOKEN
	const url = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/tabela-precos/${ id }?populate=*`

	let record: any
	try {
		const response = await axios.get( url, {
			headers: { Authorization: `Bearer ${ token }` },
		} )
		record = response.data?.data
	} catch ( error: any ) {
		console.error( "Error fetching tabela-preco:", error?.response?.data || error )
		return res.status( 500 ).json( { error: "Failed to fetch price table data" } )
	}

	const attrs = record.attributes
	const cliente = attrs.empresa?.data?.attributes
	if ( !cliente ) {
		return res.status( 400 ).json( { error: "Client data not found for this price table" } )
	}

	const itens: any[] = Array.isArray( attrs.itens ) ? attrs.itens : []

	const imagePath = path.join(
		process.cwd(), "public", "img", "logomarca-efect.jpg"
	)
	const imageContent = fs.readFileSync( imagePath ).toString( "base64" )
	const logoDataUrl = `data:image/jpeg;base64,${ imageContent }`

	const date = new Date( attrs.createdAt ).toLocaleDateString( "pt-BR" )

	const fonts = {
		Helvetica: {
			normal: "Helvetica",
			bold: "Helvetica-Bold",
			italics: "Helvetica-Oblique",
			bolditalics: "Helvetica-BoldOblique",
		},
	}
	const printer = new PDFPrinter( fonts )

	const headerSection = {
		margin: [0, 0, 0, 15] as [number, number, number, number],
		columns: [
			{
				width: '60%',
				alignment: 'left' as const,
				stack: [
					{
						text: 'TABELA DE PREÇOS',
						fontSize: 20,
						bold: true,
						color: '#009512',
					},
					{
						text: `Data: ${ date }`,
						fontSize: 12,
						color: '#666666',
						margin: [0, 5, 0, 0] as [number, number, number, number],
					},
				],
				margin: [0, 15, 0, 0] as [number, number, number, number],
			},
			{
				width: '40%',
				image: logoDataUrl,
				fit: [100, 100] as [number, number],
				alignment: 'right' as const,
			},
		],
	}

	let enderecoCliente = cliente.endereco + ', ' + cliente.numero
	enderecoCliente += cliente.complemento ? ' - ' + cliente.complemento : ''
	enderecoCliente += cliente.bairro ? ' - ' + cliente.bairro : ''
	enderecoCliente += cliente.cidade ? ' - ' + cliente.cidade : ''
	enderecoCliente += cliente.uf ? ' ' + cliente.uf : ''

	const greenTableLayout = {
		hLineWidth: function () { return 0.5 },
		vLineWidth: function () { return 0.5 },
		hLineColor: function () { return '#AACCAA' },
		vLineColor: function () { return '#AACCAA' },
		fillColor: function ( rowIndex: number ) {
			if ( rowIndex === 0 ) return '#009512'
			return ( rowIndex % 2 === 0 ) ? '#eeffee' : null
		},
	}

	const clienteSection = {
		margin: [0, 0, 0, 10] as [number, number, number, number],
		table: {
			widths: ['15%', '85%'],
			body: [
				[
					{ text: 'CLIENTE', style: 'sectionHeader', colSpan: 2 }, {}
				],
				[
					{
						text: 'Razão Social:',
						bold: true, fontSize: 8, alignment: 'left' as const,
						lineHeight: 1.3, margin: [0, 2, 0, 0] as [number, number, number, number],
					},
					{
						text: cliente.razao || cliente.nome,
						fontSize: 9, lineHeight: 1.3,
						margin: [0, 2, 0, 0] as [number, number, number, number],
					},
				],
				[
					{
						text: 'CNPJ:',
						bold: true, fontSize: 8, alignment: 'left' as const,
						lineHeight: 1.3, margin: [0, 2, 0, 0] as [number, number, number, number],
					},
					{
						text: ( cliente.CNPJ || "" ).replace(
							/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
							"$1.$2.$3/$4-$5"
						),
						fontSize: 9, lineHeight: 1.3,
						margin: [0, 2, 0, 0] as [number, number, number, number],
					},
				],
				[
					{
						text: 'Contato:',
						bold: true, fontSize: 8, alignment: 'left' as const,
						lineHeight: 1.3, margin: [0, 2, 0, 0] as [number, number, number, number],
					},
					{
						stack: [
							{
								text: formatarTelefone( cliente.fone || "" ),
								fontSize: 9, lineHeight: 1.3,
								margin: [0, 2, 0, 0] as [number, number, number, number],
							},
							{
								text: cliente.email || "",
								fontSize: 9, lineHeight: 1.3,
								margin: [0, 2, 0, 0] as [number, number, number, number],
							},
						],
					},
				],
				[
					{
						text: 'Endereço:',
						bold: true, fontSize: 8, alignment: 'left' as const,
						lineHeight: 1.3, margin: [0, 2, 0, 0] as [number, number, number, number],
					},
					{
						text: enderecoCliente,
						fontSize: 9, lineHeight: 1.3,
						margin: [0, 2, 0, 0] as [number, number, number, number],
					},
				],
			],
		},
		layout: greenTableLayout,
	}

	const products = itens.map( ( i: any ) => {
		const valorUnitario = normalizarValorMonetario( i.vFinal )

		let measures = i.comprimento || ""
		measures += i.largura ? " x " + i.largura : ""
		measures += i.altura ? " x " + i.altura + "cm(alt.)" : "cm(largura)"
		measures = i.comprimento ? measures : ""

		const stackNomeProd: any[] = [{
			text: i.nomeProd,
			alignment: "left",
			fontSize: 10,
			bold: true,
			lineHeight: 1.3,
		}]

		if ( i.codigo ) {
			stackNomeProd.push( {
				text: `Código: ${ i.codigo }`,
				alignment: "left",
				fontSize: 9,
				color: '#666666',
				bold: true,
				margin: [0, 4, 0, 0],
			} )
		}

		return [
			{
				stack: [...stackNomeProd],
				style: "prodCells",
				alignment: "left",
			},
			{
				text: measures || "",
				style: "prodCells",
				alignment: "center",
			},
			{
				text: "R$ " + valorUnitario.toLocaleString(
					"pt-br",
					{ minimumFractionDigits: 2, maximumFractionDigits: 2 }
				),
				style: "prodCells",
				fontSize: 11,
				bold: true,
				alignment: "center",
				noWrap: true,
			},
		]
	} )

	const tabelaProdutos = {
		margin: [0, 0, 0, 10] as [number, number, number, number],
		table: {
			headerRows: 1,
			widths: ["50%", "25%", "25%"],
			body: [
				[
					{ text: "PRODUTO", style: "tableHeader" },
					{ text: "MEDIDAS INTERNAS", style: "tableHeader" },
					{ text: "VALOR UNITÁRIO", style: "tableHeader" },
				],
				...products,
			],
			dontBreakRows: true,
			keepWithHeaderRows: 1,
		},
		layout: {
			hLineWidth: function ( i: number, node: { table: { body: any[] } } ) {
				return ( i === 0 || i === 1 || i === node.table.body.length ) ? 1.5 : 0.8
			},
			vLineWidth: function () { return 0.8 },
			hLineColor: function ( i: number ) {
				return ( i === 0 || i === 1 ) ? '#009512' : '#AACCAA'
			},
			vLineColor: function () { return '#AACCAA' },
			fillColor: function ( rowIndex: number ) {
				return ( rowIndex === 0 ) ? '#009512' : ( rowIndex % 2 === 0 ) ? '#eeffee' : null
			},
		},
	}

	const docDefinitions: TDocumentDefinitions = {
		defaultStyle: { font: "Helvetica" },
		content: [
			headerSection,
			clienteSection,
			{
				text: "PRODUTOS",
				fontSize: 13,
				bold: true,
				color: "#009512",
				margin: [0, 5, 0, 8],
				alignment: 'center',
			},
			tabelaProdutos,
		].filter( Boolean ) as Content[],
		pageSize: "A4",
		pageOrientation: "portrait",
		pageMargins: [20, 20, 20, 30],
		styles: {
			tableHeader: {
				fontSize: 10,
				bold: true,
				alignment: "center",
				fillColor: "#009512",
				color: "#ffffff",
				margin: [1, 4, 1, 4],
			},
			prodCells: {
				margin: [1, 4, 1, 4],
				fontSize: 9,
			},
			sectionHeader: {
				fontSize: 10,
				bold: true,
				alignment: "left",
				fillColor: "#009512",
				color: "#ffffff",
				margin: [1, 2, 1, 2],
			},
		},
	}

	const pdfDoc = printer.createPdfKitDocument( docDefinitions )
	const chunks: any[] = []

	pdfDoc.on( "data", ( chunk: any ) => {
		chunks.push( chunk )
	} )

	pdfDoc.end()

	const name = ( cliente.nome || "" )
		.replace( /[^\w\s]/g, "" )
		.replace( /\s+/g, " " )
		.replace( /[.,]/g, "" )
		.trim()
		.normalize( "NFD" )
		.replace( /[\u0300-\u036f]/g, "" )

	const filename = `Tabela de precos - ${ name } - ${ date }.pdf`

	pdfDoc.on( "end", () => {
		const pdf = Buffer.concat( chunks )
		res.setHeader( "Content-Disposition", `inline; filename="${ filename }"` )
		res.setHeader( "Content-Type", "application/pdf" )
		res.end( pdf )
	} )
}
