import axios from "axios"

export const RegCompra = async ( id: number, valor: string ) => {
	const bodyData = {
		data: {
			ultima_compra: new Date().toISOString().slice( 0, 10 ),
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
			console.error( "Erro ao registrar compra:", err.response?.data || err.message )
		} )
}
