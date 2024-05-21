import axios from "axios"

export const RegCompraFim = async ( id: number, valor: string, data: any ) => {

	const DateNow = new Date()
	const bodyData = {
		data: {
			ultima_compra_comcluida: DateNow.toISOString().slice( 0, 10 ),
			valor_ultima_compra: valor,
		},
	}

	await axios( {
		url: `${ process.env.NEXT_PUBLIC_STRAPI_API_URL }/empresas/${ id }`,
		method: "PUT",
		data: bodyData,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${ process.env.ATORIZZATION_TOKEN }`,
		},
	} )
		.catch( ( err ) => {
			console.error( err.response.data )
		} )
}
