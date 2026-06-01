import {
	Box,
	Badge,
	Button,
	Flex,
	Heading,
	Link,
	SimpleGrid,
	Stack,
	Text,
} from "@chakra-ui/react"
import { GetServerSideProps } from "next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { useCallback, useEffect, useState } from "react"
import { TokenSettingsModal } from "@/components/bling/TokenSettingsModal"
import {
	buildBlingOAuthUrl,
	formatCnpjDisplay,
	getEmitenteDisplayName,
	isTokenExpired,
} from "@/utils/blingOAuth"

interface EmitenteToken {
	id: number
	account?: string
	client_id?: string
	client_secret?: string
	access_token?: string
	refresh_token?: string
	mainAccount?: boolean
	hasAccessToken: boolean
	updatedAt?: string
	expires_in?: string
}

interface EmitenteItem {
	id: number
	attributes: {
		nome?: string
		razao?: string
		CNPJ?: string
		token?: EmitenteToken | null
	}
}

export const getServerSideProps: GetServerSideProps = async ( context ) => {
	const session = await getServerSession(
		context.req,
		context.res,
		authOptions as any
	)
	const intendedUrl = "/bling"

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

export default function Bling () {
	const [ emitentes, setEmitentes ] = useState<EmitenteItem[]>( [] )
	const [ loading, setLoading ] = useState( true )
	const [ settingsEmitente, setSettingsEmitente ] = useState<EmitenteItem | null>(
		null
	)
	const [ settingsOpen, setSettingsOpen ] = useState( false )

	const fetchEmitentes = useCallback( async () => {
		setLoading( true )
		try {
			const res = await fetch( "/api/db/bling/emitentes" )
			if ( !res.ok ) throw new Error( "Failed to load emitentes" )
			const { data } = await res.json()
			setEmitentes( data ?? [] )
		} catch {
			setEmitentes( [] )
		} finally {
			setLoading( false )
		}
	}, [] )

	useEffect( () => {
		fetchEmitentes()
	}, [ fetchEmitentes ] )

	const openSettings = ( item: EmitenteItem ) => {
		setSettingsEmitente( item )
		setSettingsOpen( true )
	}

	const getTokenStatus = ( item: EmitenteItem ) => {
		const token = item.attributes.token
		if ( !token?.client_id ) {
			return { label: "Sem credenciais", color: "gray" as const }
		}
		if ( !token.hasAccessToken ) {
			return { label: "Aguardando autorização", color: "yellow" as const }
		}
		if ( isTokenExpired( token.expires_in, token.updatedAt ) ) {
			return { label: "Token expirado", color: "orange" as const }
		}
		return { label: "Conectado", color: "green" as const }
	}

	return (
		<Box m={ { base: 4, md: 10 } } p={ { base: 5, md: 10 } } bg="gray.700" rounded="xl">
			<Heading mb={ 2 }>Autenticação — Bling API</Heading>
			<Text mb={ 8 } fontSize="sm" color="gray.300">
				Gerencie as credenciais OAuth de cada empresa emitente. Após salvar
				Client ID e Secret, autorize no Bling para obter os tokens de acesso.
			</Text>

			{ loading && <Text color="gray.400">Carregando emitentes...</Text> }

			{ !loading && emitentes.length === 0 && (
				<Text color="gray.400">
					Nenhuma empresa emitente cadastrada. Marque isEmitente no cadastro da
					empresa.
				</Text>
			) }

			<SimpleGrid columns={ { base: 1, md: 2, lg: 3 } } spacing={ 4 }>
				{ emitentes.map( ( item ) => {
					const status = getTokenStatus( item )
					const token = item.attributes.token
					const displayName = getEmitenteDisplayName( item.attributes )
					const cnpj = item.attributes.CNPJ ?? ""

					return (
						<Box
							key={ item.id }
							bg="gray.800"
							border="1px solid"
							borderColor="gray.600"
							rounded="lg"
							p={ 5 }
						>
							<Flex justify="space-between" align="flex-start" mb={ 3 }>
								<Heading size="sm">{ displayName }</Heading>
								<Badge colorScheme={ status.color }>{ status.label }</Badge>
							</Flex>
							<Text fontSize="xs" color="gray.400" mb={ 4 }>
								CNPJ: { formatCnpjDisplay( cnpj ) }
							</Text>
							<Stack spacing={ 2 }>
								<Button
									w="full"
									size="sm"
									variant="outline"
									colorScheme="blue"
									onClick={ () => openSettings( item ) }
								>
									Configurações
								</Button>
								{ token?.client_id && (
									<Link
										href={ buildBlingOAuthUrl( token.client_id, cnpj ) }
										isExternal
										_display="block"
									>
										<Button w="full" colorScheme="green" size="sm">
											{ token.hasAccessToken
												? "Reautorizar no Bling"
												: "Autorizar no Bling" }
										</Button>
									</Link>
								) }
							</Stack>
						</Box>
					)
				} ) }
			</SimpleGrid>

			<TokenSettingsModal
				isOpen={ settingsOpen }
				onClose={ () => setSettingsOpen( false ) }
				emitente={ settingsEmitente }
				onSaved={ fetchEmitentes }
			/>
		</Box>
	)
}
