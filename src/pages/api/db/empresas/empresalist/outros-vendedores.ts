/* eslint-disable no-undef */
import { GET_Strapi } from "@/pages/api/lib/request_strapi/get"
import { getServerSession } from "next-auth/next"
import { NextApiRequest, NextApiResponse } from "next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

/**
 * GetEmpresaOutrosVendedores: companies assigned to other vendors.
 * For vendors only - returns minimal read-only data (nome, CNAE, expiresIn, cidade).
 */
export default async function GetEmpresaOutrosVendedores (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> {
	if ( req.method !== "GET" ) {
		return res.status( 405 ).send( { message: "Only GET requests are allowed" } )
	}
	try {
		const session = await getServerSession( req, res, authOptions )
		if ( !session?.user?.id ) {
			return res.status( 401 ).json( { error: "Unauthorized" } )
		}
		if ( session.user.pemission === "Adm" ) {
			return res.status( 403 ).json( { error: "Admins use the main tab" } )
		}

		const page = parseInt( req.query.page as string ) || 1
		const filtroTexto = ( req.query.filtro as string ) || ""
		const filtroCNAE = ( req.query.filtroCNAE as string ) || ""
		const filtroCidade = ( req.query.filtroCidade as string ) || ""
		const pageSize = 50

		const queryParams = new URLSearchParams()
		queryParams.append( "userId", String( session.user.id ) )
		queryParams.append( "page", page.toString() )
		queryParams.append( "pageSize", pageSize.toString() )
		if ( filtroTexto ) queryParams.append( "filtroTexto", filtroTexto )
		if ( filtroCNAE ) queryParams.append( "filtroCNAE", filtroCNAE )
		if ( filtroCidade ) queryParams.append( "filtroCidade", filtroCidade )

		const url = `/empresas/outros-vendedores?${ queryParams.toString() }`
		const response = await GET_Strapi( url )

		if ( response?.error ) {
			return res.status( response.error?.status ?? 400 ).json( response )
		}

		res.status( 200 ).json( response )
	} catch ( error ) {
		res.status( 400 ).json( error )
	}
}
