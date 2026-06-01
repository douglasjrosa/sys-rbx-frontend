import { useEffect, useRef, useState } from "react"
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import Link from "next/link"
import { useRouter } from "next/router"
import { normalizeCnpj } from "@/utils/blingOAuth"

interface AccountToken {
	client_id: string
	client_secret: string
	access_token: string
	expires_in: number
	refresh_token: string
	cnpj: string
	mainAccount: boolean
}

type RegisterStatus = "loading" | "success" | "error"

export const getServerSideProps: GetServerSideProps = async ( context ) => {
	const session = await getServerSession(
		context.req,
		context.res,
		authOptions as any
	)
	const intendedUrl = context.resolvedUrl || "/bling"

	if ( !session?.user ) {
		return {
			redirect: {
				destination: `/auth/signin?callbackUrl=${ encodeURIComponent( intendedUrl ) }`,
				permanent: false,
			},
		}
	}

	if ( ( session.user as { pemission?: string } ).pemission !== "Adm" ) {
		return { redirect: { destination: "/", permanent: false } }
	}

	return { props: {} }
}

const registerBlingApiToken = async (
	accountToken: AccountToken
): Promise<boolean> => {
	const register = await fetch( "/api/db/tokens/bling/register", {
		method: "POST",
		body: JSON.stringify( { data: accountToken } ),
	} ).then( ( r ) => r.json() )
	return Boolean( register?.data?.attributes?.access_token )
}

const BlingOAuthCallback: React.FC = () => {
	const router = useRouter()
	const { code, cnpj, client_id, client_secret } = router.query
	const hasStartedRef = useRef( false )

	const [ status, setStatus ] = useState<RegisterStatus>( "loading" )
	const [ failMessage, setFailMessage ] = useState( "" )

	useEffect( () => {
		if ( !router.isReady || hasStartedRef.current ) return
		hasStartedRef.current = true

		const codeStr = typeof code === "string" ? code : ""
		const clientId = typeof client_id === "string" ? client_id : ""
		const clientSecret = typeof client_secret === "string" ? client_secret : ""
		const cnpjStr = typeof cnpj === "string" ? normalizeCnpj( cnpj ) : ""

		if ( !codeStr || !clientId || !clientSecret || !cnpjStr ) {
			setFailMessage(
				"Dados incompletos na URL. Verifique o link de redirecionamento no Bling."
			)
			setStatus( "error" )
			return
		}

		const payload = {
			code: codeStr,
			client_id: clientId,
			client_secret: clientSecret,
			cnpj: cnpjStr,
		}

		const registerToken = async () => {
			try {
				const response = await fetch( "/api/bling/auth/register", {
					method: "POST",
					body: JSON.stringify( payload ),
				} )
				const responseData = await response.json()

				if ( responseData?.error ) {
					setFailMessage(
						responseData.error.description
						|| "Não foi possível obter o token na API do Bling."
					)
					setStatus( "error" )
					return
				}

				const { scope, token_type, ...restResponseData } = responseData
				const accountToken = {
					mainAccount: false,
					cnpj: cnpjStr,
					client_id: clientId,
					client_secret: clientSecret,
					...restResponseData,
				}

				const success = await registerBlingApiToken( accountToken )
				if ( success ) {
					setStatus( "success" )
				} else {
					setFailMessage( "Não foi possível salvar o token no banco de dados." )
					setStatus( "error" )
				}
			} catch {
				setFailMessage( "Algo deu errado. Não foi possível registrar o token." )
				setStatus( "error" )
			}
		}

		void registerToken()
	}, [ router.isReady, code, cnpj, client_id, client_secret ] )

	return (
		<Box m={ { base: 4, md: 10 } } p={ { base: 5, md: 10 } } bg="gray.700" rounded="xl">
			<Heading mb={ 8 }>Autenticação — Bling API</Heading>

			{ status === "loading" && (
				<Box p={ 8 } bg="gray.800" rounded="lg" textAlign="center">
					<Text>Registrando token...</Text>
				</Box>
			) }

			{ status === "success" && (
				<Box p={ 8 } bg="green.600" rounded="xl">
					<Heading size="md" mb={ 3 }>
						Deu certo! Token registrado com sucesso na API do Bling.
					</Heading>
					<Text mb={ 6 }>Você já pode retornar à página de autenticação.</Text>
					<Flex justify="center">
						<Link href="/bling" passHref legacyBehavior>
							<Button as="a" colorScheme="green" variant="solid" size="md">
								Retornar à página de Autenticação com o Bling
							</Button>
						</Link>
					</Flex>
				</Box>
			) }

			{ status === "error" && (
				<Box p={ 8 } bg="red.600" rounded="xl">
					<Heading size="md" mb={ 3 }>
						Algo deu errado! O token não foi registrado na API do Bling.
					</Heading>
					{ failMessage && (
						<Text mb={ 6 } fontSize="sm">{ failMessage }</Text>
					) }
					<Flex justify="center">
						<Link href="/bling" passHref legacyBehavior>
							<Button as="a" colorScheme="red" variant="outline" size="md">
								Retornar à página de Autenticação com o Bling
							</Button>
						</Link>
					</Flex>
				</Box>
			) }
		</Box>
	)
}

export default BlingOAuthCallback
