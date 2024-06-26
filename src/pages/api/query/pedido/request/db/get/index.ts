/* eslint-disable no-undef */

import axios from "axios"
import { ApiErrorResponse } from "../../../../../../../types/axiosErrosPedido"

export const GetPedido = async ( nPedido: any ) => {
	await axios( {
		url: `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/pedidos/${ nPedido }?populate=*`,
		headers: {
			Authorization: `Bearer ${ process.env.ATORIZZATION_TOKEN }`,
			"Content-Type": "application/json",
		},
	} )
		.then( ( response: any ) => {
			return response.data
		} )
		.catch( ( error: ApiErrorResponse ) => {

			throw new Error( error.message )
		} )
}
