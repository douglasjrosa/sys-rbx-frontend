import axios from "axios"

/**
 * Sends a PUT request to a PHP API endpoint.
 *
 * @param {any} dados - The data to be sent in the request.
 * @param {string} url - The URL of the API endpoint.
 * @param {string} Email - The email address to be included in the request headers.
 * @return {Promise<any>} - A Promise that resolves to the response data from the API.
 */
export const DELET_PHP = async ( dados: any, url: string, Email: string ): Promise<any> => {
	try {
		const response = await axios.put( `${ process.env.RIBERMAX_API_URL }${ url }`, new URLSearchParams( dados ).toString(), {
			headers: {
				Email: Email,
				Token: process.env.ATORIZZATION_TOKEN_RIBERMAX,
				"Content-Type": "application/x-www-form-urlencoded",
			},
		} )
		return response.data
	} catch ( error: any ) {
		return error.response.data
	}
}
