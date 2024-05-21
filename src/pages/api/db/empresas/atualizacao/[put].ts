/* eslint-disable no-undef */

import { NextApiRequest, NextApiResponse } from "next"
import { getEmpresa } from "./functions/getEmpresa"
import { LogEmpresa } from "@/pages/api/lib/logEmpresa"
import { PUT_Strapi } from "@/pages/api/lib/request_strapi/put"
import { PUT_PHP } from "@/pages/api/lib/request_php/put"
import { DELET_PHP } from "@/pages/api/lib/request_php/delete"

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

			const UrlStrapi = `/empresas/${ id }`
			const ResposeStrapi = await PUT_Strapi( data, UrlStrapi )

			const bodyData = data.data

			const DataRbx = {
				nome: bodyData.nome,
				email: bodyData.email,
				xNome: bodyData.fantasia,
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
			}

			let respostaPhp

			const UrlPHP = '/empresas'
			if ( bodyData.status === false ) {
				let dataExclud = {
					CNPJ: bodyData.CNPJ,
				}

				const ResposePhp = await DELET_PHP( dataExclud, UrlPHP, Email )
				respostaPhp = ResposePhp
			} else {
				const ResposePhp = await PUT_PHP( data, UrlPHP, Email )
				respostaPhp = ResposePhp
			}

			res.status( 200 ).json( DadosAtual )
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
