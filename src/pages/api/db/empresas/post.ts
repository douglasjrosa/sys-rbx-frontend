import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { LogEmpresa } from "../../lib/logEmpresa"
import { calculateExpiresInFromFrequency } from "../../lib/update-empresa-purchase"

export default async function PostEmpresa (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method === "POST" ) {
		try {
			const data = req.body
			const token = process.env.ATORIZZATION_TOKEN
			const bodyData = data.data
			const { Email, Vendedor }: any = req.query




			const response = await axios.post(
				`${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/empresas`,
				data,
				{
					headers: {
						Authorization: `Bearer ${ token }`,
						"Content-Type": "application/json",
					},
				}
			)

			// If empresa has vendedor assigned, set purchaseFrequency and expiresIn
			const empresaId = response.data?.data?.id
			const temVendedor = bodyData.vendedor || bodyData.user || bodyData.vendedorId

			if ( empresaId && temVendedor ) {
				try {
					// For new empresas: purchaseFrequency = "Raramente" and expiresIn = 12 months from now
					const expiresIn = calculateExpiresInFromFrequency( "Raramente" )

					await axios.put(
						`${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/empresas/${ empresaId }`,
						{
							data: {
								purchaseFrequency: "Raramente",
								expiresIn: expiresIn,
							},
						},
						{
							headers: {
								Authorization: `Bearer ${ token }`,
								"Content-Type": "application/json",
							},
						}
					)
				} catch ( error: any ) {
					console.error( `Error setting purchaseFrequency and expiresIn for new empresa ${ empresaId }:`, error.response?.data || error.message )
					// Don't fail the request if this update fails
				}
			}

			await LogEmpresa( data, "POST", Vendedor )


			const DataRbx = {
				nome: bodyData.nome,
				email: bodyData.email || bodyData.emailNfe,
				xNome: bodyData.razao,
				CNPJ: bodyData.CNPJ,
				IE: bodyData.Ie,
				IM: "",
				fone: bodyData.cidade,
				indIEDest: "",
				CNAE: bodyData.CNAE,
				xLgr: bodyData.endereco,
				nro: bodyData.numero,
				xCpl: bodyData.complemento,
				cMun: "",
				cPais: bodyData.codpais,
				xPais: bodyData.pais,
				xBairro: bodyData.bairro,
				CEP: bodyData.cep,
				xMun: bodyData.cidade,
				UF: bodyData.uf,
				ativo: bodyData.status !== true ? "" : "1",
				tabela: bodyData.tablecalc,
				ultima_compra: "",
				LatAdFrSN: bodyData.adFrailLat === true ? "on" : "off",
				CabAdFrSN: bodyData.adFrailCab === true ? "on" : "off",
				LatAdExSN: bodyData.adEspecialLat === true ? "on" : "off",
				CabAdExSN: bodyData.adEspecialCab === true ? "on" : "off",
				LatForaSN: bodyData.latFCab === true ? "on" : "off",
				CabChaoSN: bodyData.cabChao === true ? "on" : "off",
				CabTopoSN: bodyData.cabTop === true ? "on" : "off",
				caixa_economica: bodyData.cxEco === true ? "on" : "off",
				caixa_estruturada: bodyData.cxEst === true ? "on" : "off",
				caixa_leve: bodyData.cxLev === true ? "on" : "off",
				caixa_reforcada: bodyData.cxRef === true ? "on" : "off",
				caixa_resistente: bodyData.cxResi === true ? "on" : "off",
				caixa_super_reforcada: bodyData.cxSupRef === true ? "on" : "off",
				engradado_economico: bodyData.engEco === true ? "on" : "off",
				engradado_leve: bodyData.engLev === true ? "on" : "off",
				engradado_reforcado: bodyData.engRef === true ? "on" : "off",
				engradado_resistente: bodyData.engResi === true ? "on" : "off",
				palete_sob_medida: bodyData.platSMed === true ? "on" : "off",
				modelo_especial: bodyData.modEsp === true ? "on" : "off",
				formaPagto: bodyData.forpg,
				prefPagto: bodyData.maxPg,
				frete: bodyData.frete === "" ? "fob" : bodyData.frete,
				indIEDest: bodyData.contribuinte || "9",
				tipoPessoa: bodyData.tipoPessoa === "cpf" ? "F" : "J"
			}


			await axios
				.post(
					`${ process.env.RIBERMAX_API_URL }/empresas`,
					new URLSearchParams( DataRbx ).toString(),
					{
						headers: {
							Email,
							Token: process.env.ATORIZZATION_TOKEN_RIBERMAX,
							"Content-Type": "application/x-www-form-urlencoded",
						},
					}
				)
				.then( function ( Response ) {
				} )
				.catch( function ( error ) {
				} )

			res.status( 200 ).json( response.data )
		} catch ( error: any ) {
			console.error( "cadastro erro", error )

			if ( error.response ) {
				const { data, error: errorMessage, details } = error.response.data
				res.status( 400 ).json( {
					error: data,
					mensage: errorMessage,
					detalhe: details,
				} )
			} else {
				res.status( 500 ).json( { error: "Internal server error" } )
			}
		}
	} else {
		res.status( 405 ).send( { message: "Only POST requests are allowed" } )
	}
}
