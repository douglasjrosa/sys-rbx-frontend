import axios from "axios"

export const DELETE_Strapi = async ( url: string ) => {
	try {
		const token = process.env.ATORIZZATION_TOKEN
		const STRAPI = axios.create( {
			baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
			headers: {
				Authorization: `Bearer ${ token }`,
				"Content-Type": "application/json",
			},
		} )

		const response = await STRAPI.delete( url )
		return response.data
	} catch ( err: any ) {
		console.error( err )
		throw err
	}
}
