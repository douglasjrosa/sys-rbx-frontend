import axios from "axios"

export const ErroPHP = async ( ERROR: any ) => {
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

	await STRAPI.post( `/erro-phps`, DodyData )
		.then( () => {

			const msg = ERROR.log.error.message + " lote " + ERROR.log.nLote
			return msg
		} )
		.catch( ( err: any ) => {

			return err.response.data
		} )
}
