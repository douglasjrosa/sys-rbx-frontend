const token = process.env.ATORIZZATION_TOKEN
const baseURL = process.env.NEXT_PUBLIC_STRAPI_API_URL

export const updatePedidoInStrapi = async ( nPedido: string, blingPedidoId: string ) => await fetch(
	`${ baseURL }/pedidos/${ nPedido }`,
	{
	method: 'PUT',
	headers: {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${ token }`
	},
	body: JSON.stringify({
		Bpedido: blingPedidoId.toString(),
		stausPedido: true
	})
} )
	.catch( ( error ) => console.error( error ) )

export const updateNegocioInStrapi = async ( idNegocio: string, blingPedidoId: string ) => await fetch(
	`${ baseURL }/businesses/${ idNegocio }`,
	{
	method: 'PUT',
	headers: {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${ token }`
	},
	body: JSON.stringify({
		Bpedido: blingPedidoId.toString(),
		stausPedido: true
	})
} )
	.catch( ( error ) => console.error( error ) )

