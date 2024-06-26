/* eslint-disable no-undef */
/* eslint-disable no-redeclare */
import { NextApiRequest, NextApiResponse } from 'next'

export default async function PUT ( req: NextApiRequest, res: NextApiResponse ) {
	const token = process.env.ATORIZZATION_TOKEN_BLING
	const CNPJ_CPF = req.query.cpf
	if ( req.method === 'PUT' ) {
		const url = `https://bling.com.br/Api/v2/contato/${ CNPJ_CPF }/json?apikey=${ token }`
		const ClienteIdetfic = await fetch( url )
		const RespCliente = await ClienteIdetfic.json()
		const ClienteId = RespCliente.retorno.contatos[ 0 ].contato.id
		const Cliente = RespCliente.retorno.contatos[ 0 ].contato

		if ( ClienteId !== '' ) {
			const getClinet = req.body

			var formdata = new FormData()
			formdata.append( 'apikey', `${ token }` )
			formdata.append(
				'xml',
				`<?xml version="1.0" encoding="UTF-8"?>\n<contato>\n   <nome>${ getClinet.data.nome
				}</nome>\n   <fantasia>${ getClinet.data.fantasia
				}</fantasia>\n   <tipoPessoa>F</tipoPessoa>\n   <contribuinte>9</contribuinte>\n   <cpf_cnpj>${ CNPJ_CPF }</cpf_cnpj>\n   <ie_rg></ie_rg>\n   <endereco>${ getClinet.data.endereco
				}</endereco>\n   <numero>${ getClinet.data.numero
				}</numero>\n   <complemento>${ getClinet.data.complemento
				}</complemento>\n   <bairro>${ getClinet.data.bairro
				}</bairro>\n   <cep>${ getClinet.data.cep }</cep>\n   <cidade>${ getClinet.data.cidade
				}</cidade>\n   <uf>${ getClinet.data.uf }</uf>\n   <fone>${ getClinet.data.fone
				}</fone>\n   <celular>${ getClinet.data.celular }</celular>\n   <email>${ getClinet.data.email
				}</email>\n   <situacao>${ getClinet.data.status === true ? 'A' : 'E'
				}</situacao>\n   <emailNfe>${ getClinet.data.emailNfe
				}</emailNfe>\n   <informacaoContato>Informações adicionais do contato</informacaoContato>\n   <limiteCredito></limiteCredito>\n   <paisOrigem>${ getClinet.data.pais
				}</paisOrigem>\n   <obs>${ getClinet.data.obs }</obs>\n</contato>`,
			)


			var requestOptions: any = {
				method: 'PUT',
				body: formdata,
				redirect: 'follow',
			}

			fetch(
				`https://bling.com.br/Api/v2/contato/${ ClienteId }/json`,
				requestOptions,
			)
				.then( ( response ) => response.json() )
				.then( ( result ) => {
					res.status( 201 ).json( result )
				} )
				.catch( ( error ) => {
					console.error( error )
					res.status( 400 ).send( { error: error } )
				} )
		} else {
			const getClinet = req.body

			var formdata = new FormData()
			formdata.append( 'apikey', `${ token }` )
			formdata.append(
				'xml',
				`<?xml version="1.0" encoding="UTF-8"?>\n<contato>\n   <nome>${ getClinet.data.nome
				}</nome>\n   <fantasia>${ getClinet.data.fantasia
				}</fantasia>\n   <tipoPessoa>F</tipoPessoa>\n   <contribuinte>9</contribuinte>\n   <cpf_cnpj>${ CNPJ_CPF }</cpf_cnpj>\n   <ie_rg></ie_rg>\n   <endereco>${ getClinet.data.endereco
				}</endereco>\n   <numero>${ getClinet.data.numero
				}</numero>\n   <complemento>${ getClinet.data.complemento
				}</complemento>\n   <bairro>${ getClinet.data.bairro
				}</bairro>\n   <cep>${ getClinet.data.cep }</cep>\n   <cidade>${ getClinet.data.cidade
				}</cidade>\n   <uf>${ getClinet.data.uf }</uf>\n   <fone>${ getClinet.data.fone
				}</fone>\n   <celular>${ getClinet.data.celular }</celular>\n   <email>${ getClinet.data.email
				}</email>\n   <situacao>${ getClinet.data.status === true ? 'A' : 'E'
				}</situacao>\n   <emailNfe>${ getClinet.data.emailNfe
				}</emailNfe>\n   <informacaoContato>Informações adicionais do contato</informacaoContato>\n   <limiteCredito></limiteCredito>\n   <paisOrigem>${ getClinet.data.pais
				}</paisOrigem>\n   <obs>${ getClinet.data.obs }</obs>\n</contato>`,
			)


			var requestOptions: any = {
				method: 'POST',
				body: formdata,
				redirect: 'follow',
			}

			fetch( 'https://bling.com.br/Api/v2/contato/json', requestOptions )
				.then( ( response ) => response.json() )
				.then( ( result ) => {
					res.status( 201 ).json( result )
				} )
				.catch( ( error ) => {
					console.error( error )
					res.status( 400 ).send( { error: error } )
				} )
		}
	} else {
		return res.status( 405 ).send( { message: 'Only PUT requests are allowed' } )
	}
}
