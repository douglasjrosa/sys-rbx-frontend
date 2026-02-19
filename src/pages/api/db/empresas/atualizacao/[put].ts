/* eslint-disable no-undef */

import { NextApiRequest, NextApiResponse } from "next"
import { getEmpresa } from "./functions/getEmpresa"
import { LogEmpresa } from "@/pages/api/lib/logEmpresa"
import { PUT_Strapi } from "@/pages/api/lib/request_strapi/put"
import { PUT_PHP } from "@/pages/api/lib/request_php/put"
import { DELET_PHP } from "@/pages/api/lib/request_php/delete"
import { calculateExpiresInFromFrequency } from "@/pages/api/lib/update-empresa-purchase"
import axios from "axios"

export default async function GetEmpresa (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method === "PUT" ) {
		const id: any = req.query.put
		const data = req.body
		const { Email, Vendedor }: any = req.query



		try {
			const DadosAtual: any = await getEmpresa( id )
			const SaveLog = await LogEmpresa( DadosAtual, "PUT", Vendedor )

			// Check if vendedor was assigned (user or vendedor was updated with a valid value)
			const bodyData = data.data
			const vendedorAssigned = (
				( bodyData?.user !== undefined && bodyData?.user !== null ) ||
				( bodyData?.vendedor !== undefined && bodyData?.vendedor !== null && bodyData?.vendedor !== "" ) ||
				( bodyData?.vendedorId !== undefined && bodyData?.vendedorId !== null && bodyData?.vendedorId !== "" )
			)

			if ( vendedorAssigned ) {
				try {
					const token = process.env.ATORIZZATION_TOKEN
					// Fetch current empresa data to get purchaseFrequency
					const empresaResponse = await axios.get(
						`${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/empresas/${ id }?fields[0]=purchaseFrequency`,
						{
							headers: {
								Authorization: `Bearer ${ token }`,
								"Content-Type": "application/json",
							},
						}
					)

					const purchaseFrequency = empresaResponse.data?.data?.attributes?.purchaseFrequency || null

					// Calculate expiresIn based on purchaseFrequency from current date
					if ( purchaseFrequency ) {
						const expiresIn = calculateExpiresInFromFrequency( purchaseFrequency )
						if ( expiresIn ) {
							data.data.expiresIn = expiresIn
						}
					} else {
						// If no purchaseFrequency, set to Raramente with 12 months
						data.data.purchaseFrequency = "Raramente"
						const expiresIn = calculateExpiresInFromFrequency( "Raramente" )
						if ( expiresIn ) {
							data.data.expiresIn = expiresIn
						}
					}
				} catch ( error: any ) {
					console.error( `Error fetching empresa data to calculate expiresIn:`, error.response?.data || error.message )
					// Don't fail the request if this fails
				}
			}

			const UrlStrapi = `/empresas/${ id }`
			const ResposeStrapi = await PUT_Strapi( data, UrlStrapi )

			const DataRbx = {
				nome: bodyData.nome,
				email: bodyData.email || bodyData.emailNfe,
				xNome: bodyData.razao,
				CNPJ: bodyData.CNPJ,
				IE: bodyData.Ie,
				IM: "",
				fone: bodyData.cidade,
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

			let respostaPhp

			const UrlPHP = '/empresas'
			if ( bodyData.status === false ) {
				let dataExclud = {
					CNPJ: bodyData.CNPJ,
				}

				respostaPhp = await DELET_PHP( dataExclud, UrlPHP, Email )
			} else {
				respostaPhp = await PUT_PHP( DataRbx, UrlPHP, Email )
			}

			res.status( 200 ).json( {
				ResposeStrapi,
				respostaPhp,
			} )
		} catch ( error: any ) {
			console.error( error.response.data.error )
			res.status( 400 ).json( {
				error: error.response.data,
			} )
		}

	} else {
		return res.status( 405 ).send( {
			message: `Only PUT requests are allowed, currently your request is ${ req.method }, correct your request`,
		} )
	}
}
