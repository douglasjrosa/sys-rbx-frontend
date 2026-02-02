/* eslint-disable no-undef */
import { GET_Strapi } from "@/pages/api/lib/request_strapi/get"
import { NextApiRequest, NextApiResponse } from "next"

/**
 * GetEmpresaVendedor function to fetch empresas with vendedor from the API.
 * Uses the custom backend route /empresas/vendedor which handles sorting internally.
 *
 * IMPORTANTE: O backend DEVE retornar os dados com `businesses` e `interacaos` populados.
 * O frontend precisa desses dados para exibir informações sobre negócios e interações.
 *
 * Campos necessários em businesses:
 * - etapa, andamento, date_conclucao, Budget, vendedor_name, pedidos (com totalGeral)
 *
 * Campos necessários em interacaos:
 * - proxima, vendedor_name, status_atendimento, descricao, tipo, objetivo, createdAt
 *
 * @param req - The NextApiRequest object.
 * @param res - The NextApiResponse object.
 * @returns Promise<void>
 */
export default async function GetEmpresaVendedor (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> {
	if ( req.method === "GET" ) {
		try {
			const userId = req.query.userId || ""
			const page = parseInt( req.query.page as string ) || 1
			const filtroTexto = req.query.filtro || ""
			const filtroCNAE = req.query.filtroCNAE as string || ""
			const filtroCidade = req.query.filtroCidade as string || ""
			const sortOrder = req.query.sort as string || "relevancia"
			const pageSize = 50

			// Build query string for the custom backend route
			const queryParams = new URLSearchParams()
			if ( userId ) queryParams.append( 'userId', userId as string )
			queryParams.append( 'page', page.toString() )
			queryParams.append( 'pageSize', pageSize.toString() )
			queryParams.append( 'sortOrder', sortOrder )
			if ( filtroTexto ) queryParams.append( 'filtroTexto', filtroTexto as string )
			if ( filtroCNAE ) queryParams.append( 'filtroCNAE', filtroCNAE )
			if ( filtroCidade ) queryParams.append( 'filtroCidade', filtroCidade )

			const url = `/empresas/vendedor?${ queryParams.toString() }`

			const response = await GET_Strapi( url )

			// Log simplificado para análise de ordenação
			if ( response?.data && Array.isArray( response.data ) && response.data.length > 0 && sortOrder === 'relevancia' ) {
				const logData = response.data.map( ( empresa: any ) => {
					// Última interação
					const interacoes = empresa.attributes?.interacaos?.data || []
					const ultimaInteracao = interacoes.length > 0 ? interacoes[ interacoes.length - 1 ] : null
					const dataProximaDaInteracao = ultimaInteracao
						? ( ultimaInteracao.attributes?.proxima || ultimaInteracao.proxima )
						: null

					// Negócios concluídos (etapa === 6)
					const negocios = empresa.attributes?.businesses?.data || []
					const negociosConcluidos = negocios.filter( ( n: any ) => {
						const etapa = n.attributes?.etapa || n.etapa
						return etapa === 6
					} )

					// Último negócio (ganho ou perdido)
					const ultimoNegocio = negociosConcluidos
						.sort( ( a: any, b: any ) => {
							const dataA = ( a.attributes?.date_conclucao || a.date_conclucao ) ? new Date( a.attributes?.date_conclucao || a.date_conclucao ).getTime() : 0
							const dataB = ( b.attributes?.date_conclucao || b.date_conclucao ) ? new Date( b.attributes?.date_conclucao || b.date_conclucao ).getTime() : 0
							return dataB - dataA
						} )[ 0 ]

					// Status e valor
					let status = null
					let valor = null
					if ( ultimoNegocio ) {
						const andamento = ultimoNegocio.attributes?.andamento || ultimoNegocio.andamento
						status = andamento === 5 ? 'Ganho' : 'Perdido'

						// Calcular valor
						const pedidos = ultimoNegocio.pedidos || ultimoNegocio.attributes?.pedidos || []
						const pedidosArray = Array.isArray( pedidos ) ? pedidos : pedidos?.data || []
						valor = ultimoNegocio.Budget || ultimoNegocio.attributes?.Budget ||
							( pedidosArray.length > 0 ? ( pedidosArray[ 0 ]?.totalGeral || pedidosArray[ 0 ]?.attributes?.totalGeral ) : null )
					}

					// Purchase Frequency
					const purchaseFrequency = empresa.attributes?.purchaseFrequency || null

					return {
						nome: empresa.attributes?.nome || null,
						dataProximaDaInteracao: dataProximaDaInteracao,
						purchaseFrequency: purchaseFrequency,
						status: status,
						valor: valor
					}
				} )
			}

			res.status( 200 ).json( response )
		} catch ( error ) {
			res.status( 400 ).json( error )
		}
	} else {
		return res.status( 405 ).send( { message: "Only GET requests are allowed" } )
	}
} 