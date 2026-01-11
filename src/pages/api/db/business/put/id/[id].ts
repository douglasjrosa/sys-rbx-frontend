/* eslint-disable no-undef */
import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function GetEmpresa (
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if ( req.method === 'PUT' ) {
		const token = process.env.ATORIZZATION_TOKEN
		const { id } = req.query
		const data = req.body
		// #region agent log
		fetch('http://127.0.0.1:7244/ingest/9b56e505-01d3-49e7-afde-e83171883b39',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'[id].ts:12',message:'API PUT request received',data:{id,dataKeys:Object.keys(data?.data||{}),etapa:data?.data?.etapa,andamento:data?.data?.andamento},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
		// #endregion


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
				// #region agent log
				fetch('http://127.0.0.1:7244/ingest/9b56e505-01d3-49e7-afde-e83171883b39',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'[id].ts:24',message:'Strapi PUT successful',data:{status:Response.status,responseId:Response.data?.data?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
				// #endregion
				res.status( 200 ).json( Response.data.data )

			} )
			.catch( ( err ) => {
				// #region agent log
				fetch('http://127.0.0.1:7244/ingest/9b56e505-01d3-49e7-afde-e83171883b39',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'[id].ts:28',message:'Strapi PUT failed',data:{status:err.response?.status,errorMessage:err.message,errorDetails:err.response?.data?.error,strapiError:JSON.stringify(err.response?.data)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,C'})}).catch(()=>{});
				// #endregion
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
