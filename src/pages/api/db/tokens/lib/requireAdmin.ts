import { getServerSession } from "next-auth/next"
import type { NextApiRequest, NextApiResponse } from "next"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

export async function requireAdminSession (
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await getServerSession( req, res, authOptions as any )
	if ( !session?.user ) {
		res.status( 401 ).json( { message: "Unauthorized" } )
		return null
	}
	if ( ( session.user as { pemission?: string } ).pemission !== "Adm" ) {
		res.status( 403 ).json( { message: "Forbidden" } )
		return null
	}
	return session
}
