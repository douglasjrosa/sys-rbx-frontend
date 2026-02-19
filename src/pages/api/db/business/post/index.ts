/* eslint-disable no-undef */
import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { Historico } from "../../lib/historico"
import { RegCompra } from "../../lib/empresa_reg_compra"

export default async function GetEmpresa (
	req: NextApiRequest,
	res: NextApiResponse
) {
	if ( req.method === "POST" ) {
		const token = process.env.ATORIZZATION_TOKEN
		const data = req.body

		const axiosRequet = axios.create( {
			baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${ token }`,
			},
		} )

		const consulta = await axiosRequet.get(
			"/businesses?fields[0]=id&fields[1]=nBusiness&sort=id%3Adesc"
		)
		const consultaData = consulta.data?.data || []
		const respostaConsulta = consultaData.length > 0 ? consultaData[ 0 ] : null

		const resposta =
			respostaConsulta === null
				? "001"
				: respostaConsulta.attributes.nBusiness
		const dateNow = new Date()
		const anoVigente = dateNow.getFullYear()
		const resto = resposta.toString().replace( anoVigente, "" )
		const restoInt = parseInt( resto ) + 1
		const newResto =
			restoInt < 10
				? "000" + restoInt
				: restoInt > 99
					? "00" + restoInt
					: restoInt > 999
						? "0" + restoInt
						: restoInt
		const newNuber = anoVigente.toString() + newResto
		const newBusinesses = Number( newNuber )

		const nBusiness = !respostaConsulta
			? Number( anoVigente + "000" + 1 )
			: newBusinesses

		let respVendedor = ""
		let respCliente = ""

		try {
			const getVendedor = await axiosRequet.get( "/users/" + data.vendedor )
			respVendedor = getVendedor.data.username

			const getCliente = await axiosRequet.get( "/empresas/" + data.empresa )
			respCliente = getCliente.data.data.attributes.nome
		} catch ( error: any ) {
			console.error( "Erro ao buscar vendedor ou cliente:", error.response?.data || error.message )
			return res.status( 400 ).json( {
				message: "Erro ao buscar vendedor ou cliente. Verifique se os IDs estão corretos.",
				error: error.response?.data || error.message
			} )
		}

		const dataAtualizado = {
			data: {
				status: true,
				statusAnd: "Ativo",
				DataRetorno: data.DataRetorno,
				nBusiness: nBusiness.toString(),
				Budget: String( data.Budget ),
				Approach: data.Approach,
				history: [ data.history ],
				incidentRecord: data.incidentRecord,
				empresa: Number( data.empresa ),
				vendedor: data.vendedor,
				vendedor_name: data.vendedor_name,
				andamento: 3,
				etapa: 2,
			},
		}

		await axiosRequet
			.post( `/businesses`, dataAtualizado )
			.then( async ( response ) => {
				const isoDateTime = new Date().toISOString()
				const VisibliDateTime = new Date().toISOString()
				await RegCompra( Number( data.empresa ), data.Budget )

				const txt = {
					date: isoDateTime,
					vendedor: data.vendedor,
					msg: `Business numero: ${ nBusiness }, foi criado pelo vendedor ${ respVendedor } para o cliente ${ respCliente } no dia ${ VisibliDateTime }`,
				}
				const url = `empresas/${ data.empresa }`
				const Register = await Historico( txt, url )

				res.status( 200 ).json( {
					status: 200,
					nBusiness: response.data.data.id,
					message: `Business numero: ${ nBusiness }, foi criado pelo vendedor ${ respVendedor } para o cliente ${ respCliente } no dia ${ VisibliDateTime }`,
					historico: Register,
				} )
			} )
			.catch( async ( error ) => {
				console.error( "Erro ao criar business no Strapi:", error.response?.data || error.message )

				const isoDateTime = new Date().toISOString()

				const txt = {
					date: isoDateTime,
					vendedor: data.vendedor,
					msg: "Proposta não foi criada devido a erro",
					error: error.response?.data || error.message,
				}
				const url = `empresas/${ data.empresa }`
				const Register = await Historico( txt, url )

				res.status( 500 ).json( {
					historico: Register,
					error: error.response?.data || error.message,
					message: error.response?.data || error.message,
				} )
			} )
	} else {
		return res.status( 405 ).send( { message: "Only POST requests are allowed" } )
	}
}
