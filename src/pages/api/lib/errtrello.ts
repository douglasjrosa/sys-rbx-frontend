import axios from "axios"

export const ErroTrello = async ( ERROR: any ) => {
	const token = process.env.ATORIZZATION_TOKEN
	const STRAPI = axios.create( {
		baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
		headers: {
			Authorization: `Bearer ${ token }`,
			"Content-Type": "application/json",
		},
	} )

	const DodyData = {
		data: {
			...ERROR,
		},
	}

	await STRAPI.post( `/erro-trellos`, DodyData )
		.then( ( rest: any ) => {
			return rest.data.data
		} )
		.catch( ( err: any ) => {
			return err.response.data
		} )
}
