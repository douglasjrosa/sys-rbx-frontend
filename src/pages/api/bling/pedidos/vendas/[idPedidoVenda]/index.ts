import { NextApiRequest, NextApiResponse } from "next"
import { blingApiUrl } from "@/pages/api/bling"
import { getBlingToken } from "@/pages/api/bling/auth/update-bling-token"

const CRUD = async (
	req: NextApiRequest,
	res: NextApiResponse
) => {

	if ( req.method === "GET" ) {

		const { idPedidoVenda, account } = req.query

		const blingToken = await getBlingToken( account as string )

		try {
			const queryStringUrl = `${ blingApiUrl }/pedidos/vendas/${ idPedidoVenda }`

			const blingOrder = await fetch( queryStringUrl, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${ blingToken }`
				}
			} ).then( r => r.json() )

			res.status( 200 ).send( blingOrder )
		}
		catch ( error ) {
			console.error( error )
			res.status( 500 ).send( "Erro ao carregar pedido do Bling." )
		}
	}
}
export default CRUD