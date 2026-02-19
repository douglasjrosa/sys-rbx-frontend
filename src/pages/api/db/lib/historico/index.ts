/* eslint-disable no-undef */
import axios from 'axios'

export const Historico = async ( txt: any, url: string ) => {
	const token = process.env.ATORIZZATION_TOKEN
	const axiosRequet = axios.create( {
		baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${ token }`,
		},
	} )
	try {
		const verifique = await axiosRequet.get( url )
		const respVerifique = verifique.data.data
		if ( !respVerifique ) {
			return verifique.data.error
		}
		const { history } = respVerifique.attributes

		const data = {
			data: {
				history: [ ...history, txt ],
			},
		}
		const response = await axiosRequet.put( url, data )
		const resp = `Aleteração do cliente id: ${ response.data.data.id }, nome: ${ response.data.data.attributes.nome }, foi registrada!`
		return resp
	} catch ( error: any ) {
		console.error( "Erro ao atualizar histórico:", error.response?.data || error.message )
		return error.response?.data?.error || error.message
	}
}
