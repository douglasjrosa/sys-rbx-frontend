import axios from "axios"

export const getData = async ( proposta: any ) => {
	const token = process.env.ATORIZZATION_TOKEN
	const url = `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/pedidos/${ proposta }?populate=*`

	const config = {
		method: "GET",
		url,
		headers: {
			Authorization: `Bearer ${ token }`,
		},
	}

	const converterData = ( data: string ) => {
		if ( !data ) return ""

		const dataObjeto = new Date( data )

		const fusoHorario = -3
		const dataBrasilia = new Date(
			dataObjeto.getTime() + fusoHorario * 3600000
		)
		dataBrasilia.setDate( dataBrasilia.getDate() + 1 )
		const hoje = new Date()
		const diferenca = Math.ceil(
			( dataBrasilia.getTime() - hoje.getTime() ) / ( 1000 * 60 * 60 * 24 )
		)
		const resultado = diferenca + " Dias"

		return resultado
	}

	try {
		const response = await axios( config )
		const result = response.data?.data
		const inf = result.attributes
		const Vendedor = inf.user.data.attributes.username
		const empresaFornec = inf.fornecedorId.data.attributes
		const dataEntrega1 = !inf.dataEntrega ? '' : inf.dataEntrega
		const dataEntrega = converterData( dataEntrega1 )

		const dadosFornecedor = {
			data: {
				razao: empresaFornec?.nome,
				fantasia: empresaFornec?.fantasia,
				cnpj: empresaFornec?.CNPJ.replace(
					/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
					"$1.$2.$3/$4-$5"
				),
				endereco: empresaFornec?.endereco + ', ' + empresaFornec?.numero,
				cidade: "Riberão Preto",
				uf: "Sp",
				tel: "(16) 9 9765-5543",
				email: empresaFornec?.email,
			},
		}
		const custoAdicional = inf.custoAdicional
		const frete = inf.frete
		const Valfrete = inf.valorFrete
		const datePop = inf.dataPedido
		const fornecedor = dadosFornecedor
		const cliente = inf.empresa.data.attributes
		const condi = inf.condi
		const Desconto_Converte = !inf.desconto ? null : inf.desconto
		const Desconto = !Desconto_Converte ? 0 : Desconto_Converte
		const DescontoAdd_Converte = !inf.descontoAdd ? null : parseFloat( inf.descontoAdd )
		const DescontoAdd = !DescontoAdd_Converte ? 0 : DescontoAdd_Converte
		const itens = inf.itens
		const prazo = inf.prazo === null ? "" : inf.prazo
		const venc = inf.vencPrint
		const totoalGeral = inf.totalGeral
		const obs = inf.obs === null ? "" : inf.obs
		const business = !inf.business.data
			? ""
			: inf.business.data.id === null
				? ""
				: inf.business.data.id


		const cliente_pedido = inf.cliente_pedido

		console.log(inf)

		const data = {
			custoAdicional,
			frete,
			Valfrete,
			datePop,
			fornecedor,
			cliente,
			itens,
			condi,
			prazo,
			venc,
			totoalGeral,
			obs,
			business,
			Vendedor,
			cliente_pedido,
			Desconto,
			DescontoAdd,
			dataEntrega
		}
		return data
	} catch ( error ) {
		console.error( "🚀 ~ file: /api/db/proposta/pdf/lib/getinf.ts:23 ~ getData ~ error:", error )
		throw error
	}
}
