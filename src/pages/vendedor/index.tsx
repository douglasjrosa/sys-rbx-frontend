import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

export const getServerSideProps: GetServerSideProps = async ( context ) => {
	const session = await getServerSession(
		context.req,
		context.res,
		authOptions as any
	)
	if ( !session?.user ) {
		return { redirect: { destination: "/auth/signin", permanent: false } }
	}
	const userId = ( session.user as any )?.id
	if ( !userId ) {
		return { redirect: { destination: "/", permanent: false } }
	}
	return { redirect: { destination: `/vendedor/${ userId }`, permanent: false } }
}

export default function VendedorRedirect () {
	return null
}
