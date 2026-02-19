/* eslint-disable no-undef */
import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'
import { updateEmpresaPurchase } from '../../../../lib/update-empresa-purchase'

export default async function GetEmpresa (
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if ( req.method === 'PUT' ) {
		const token = process.env.ATORIZZATION_TOKEN
		const { id } = req.query
		const data = req.body
		const etapa = data?.data?.etapa
		const andamento = data?.data?.andamento
		const date_conclucao = data?.data?.date_conclucao

		await axios( {
			method: 'PUT',
			url: process.env.NEXT_PUBLIC_STRAPI_API_URL + '/businesses/' + id,
			headers: {
				Authorization: `Bearer ${ token }`,
				'Content-Type': 'application/json',
			},
			data: data,
		} )
			.then( async ( Response ) => {
				// If business was won (etapa=6 and andamento=5), update empresa purchase data
				if ( etapa === 6 && andamento === 5 ) {
					try {
						// Fetch business data to get empresa and pedidos
						const businessResponse = await axios.get(
							`${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/businesses/${ id }?fields[0]=date_conclucao&populate[empresa][fields][0]=id&populate[pedidos][fields][0]=totalGeral`,
							{
								headers: {
									Authorization: `Bearer ${ token }`,
									'Content-Type': 'application/json',
								},
							}
						)

						const businessData = businessResponse.data.data
						const empresaId = businessData?.attributes?.empresa?.data?.id
						const pedidos = businessData?.attributes?.pedidos?.data || []
						const dataCompra = date_conclucao || businessData?.attributes?.date_conclucao || new Date().toISOString().slice( 0, 10 )

						// Get totalGeral from the first pedido (or sum all pedidos if needed)
						const valorCompra = pedidos.length > 0
							? pedidos[ 0 ]?.attributes?.totalGeral || null
							: null

						if ( empresaId ) {
							// Update empresa purchase data asynchronously (fire-and-forget)
							// This doesn't block the response to the client
							updateEmpresaPurchase( {
								empresaId: String( empresaId ),
								dataCompra,
								valorCompra,
								token: token || "",
							} ).catch( ( error: any ) => {
								console.error( `Failed to update empresa purchase data for empresa ${ empresaId }:`, error )
							} )
						}
					} catch ( error: any ) {
						console.error( `Error fetching business data to update empresa purchase:`, error.response?.data || error.message )
						// Don't fail the request if empresa update fails
					}
				}

				res.status( 200 ).json( Response.data.data )

			} )
			.catch( ( err ) => {
				console.error( 'Error updating business:', err )

				const statusCode = err.response?.status || 500
				const errorData = err.response?.data || {}
				const errorMessage = errorData.error?.message || err.message || 'Erro desconhecido ao atualizar o negócio'

				res.status( statusCode ).json( {
					error: errorData.error || errorData,
					mensage: errorMessage,
					detalhe: errorData.error?.details || errorData.detalhe,
				} )
			} )
	} else {
		return res.status( 405 ).send( { message: 'Only PUT requests are allowed' } )
	}
}
