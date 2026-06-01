import {
	Box,
	Badge,
	Button,
	Flex,
	FormControl,
	FormLabel,
	Heading,
	Input,
	Link,
	Select,
	SimpleGrid,
	Stack,
	Text,
	useToast,
} from "@chakra-ui/react"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"
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

const optionStyle = { backgroundColor: "#1A202C" }

export default function Bling () {
	const { data: session } = useSession()
	const toast = useToast()
	const isAdmin = session?.user?.pemission === "Adm"

	const [ emitentes, setEmitentes ] = useState<EmitenteItem[]>( [] )
	const [ loading, setLoading ] = useState( true )
	const [ saving, setSaving ] = useState( false )
	const [ selectedEmpresaId, setSelectedEmpresaId ] = useState( "" )
	const [ clientId, setClientId ] = useState( "" )
	const [ clientSecret, setClientSecret ] = useState( "" )

	const fetchEmitentes = useCallback( async () => {
		setLoading( true )
		try {
			const res = await fetch( "/api/db/bling/emitentes" )
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

	const handleSaveCredentials = async () => {
		const empresa = emitentes.find( ( e ) => String( e.id ) === selectedEmpresaId )
		if ( !empresa?.attributes?.CNPJ || !clientId || !clientSecret ) {
			toast( {
				title: "Preencha todos os campos",
				status: "warning",
				duration: 4000,
				isClosable: true,
			} )
			return
		}

		setSaving( true )
		try {
			const account = getEmitenteDisplayName( empresa.attributes )
			const res = await fetch( "/api/db/tokens/bling/register", {
				method: "POST",
				body: JSON.stringify( {
					data: {
						cnpj: empresa.attributes.CNPJ,
						account,
						client_id: clientId,
						client_secret: clientSecret,
						mainAccount: false,
					},
				} ),
			} )
			if ( !res.ok ) throw new Error( "Failed to save credentials" )

			toast( {
				title: "Credenciais salvas",
				description: "Agora você pode autorizar no Bling.",
				status: "success",
				duration: 4000,
				isClosable: true,
			} )
			setSelectedEmpresaId( "" )
			setClientId( "" )
			setClientSecret( "" )
			await fetchEmitentes()
		} catch {
			toast( {
				title: "Erro ao salvar credenciais",
				status: "error",
				duration: 5000,
				isClosable: true,
			} )
		} finally {
			setSaving( false )
		}
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

	const emitentesWithoutCredentials = emitentes.filter(
		( e ) => !e.attributes.token?.client_id
	)

	return (
		<Box m={ { base: 4, md: 10 } } p={ { base: 5, md: 10 } } bg="gray.700" rounded="xl">
			<Heading mb={ 2 }>Autenticação — Bling API</Heading>
			<Text mb={ 8 } fontSize="sm" color="gray.300">
				Empresas marcadas como emitente no Strapi. Cada uma precisa de credenciais
				OAuth e autorização no Bling para integrar pedidos.
			</Text>

			{ loading && <Text color="gray.400">Carregando emitentes...</Text> }

			{ !loading && emitentes.length === 0 && (
				<Text color="gray.400">
					Nenhuma empresa emitente cadastrada. Marque isEmitente no cadastro da empresa.
				</Text>
			) }

			<SimpleGrid columns={ { base: 1, md: 2, lg: 3 } } spacing={ 4 } mb={ 10 }>
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
							{ token?.client_id ? (
								<Link
									href={ buildBlingOAuthUrl( token.client_id, cnpj ) }
									isExternal
									_display="block"
								>
									<Button
										w="full"
										colorScheme="green"
										size="sm"
									>
										{ token.hasAccessToken
											? "Reautorizar no Bling"
											: "Autorizar no Bling" }
									</Button>
								</Link>
							) : (
								<Text fontSize="xs" color="gray.500">
									Configure as credenciais OAuth abaixo (admin).
								</Text>
							) }
						</Box>
					)
				} ) }
			</SimpleGrid>

			{ isAdmin && emitentesWithoutCredentials.length > 0 && (
				<Box
					bg="gray.800"
					border="1px solid"
					borderColor="gray.600"
					rounded="lg"
					p={ 5 }
				>
					<Heading size="sm" mb={ 4 }>
						Configurar credenciais OAuth (Admin)
					</Heading>
					<Stack spacing={ 4 }>
						<FormControl>
							<FormLabel fontSize="xs">Empresa emitente</FormLabel>
							<Select
								bg="#ffffff12"
								size="sm"
								value={ selectedEmpresaId }
								onChange={ ( e ) => setSelectedEmpresaId( e.target.value ) }
							>
								<option style={ optionStyle } value="">
									Selecione
								</option>
								{ emitentesWithoutCredentials.map( ( item ) => (
									<option
										key={ item.id }
										style={ optionStyle }
										value={ String( item.id ) }
									>
										{ getEmitenteDisplayName( item.attributes ) }
									</option>
								) ) }
							</Select>
						</FormControl>
						<SimpleGrid columns={ { base: 1, md: 2 } } spacing={ 4 }>
							<FormControl>
								<FormLabel fontSize="xs">Client ID</FormLabel>
								<Input
									bg="#ffffff12"
									size="sm"
									value={ clientId }
									onChange={ ( e ) => setClientId( e.target.value ) }
								/>
							</FormControl>
							<FormControl>
								<FormLabel fontSize="xs">Client Secret</FormLabel>
								<Input
									bg="#ffffff12"
									size="sm"
									type="password"
									value={ clientSecret }
									onChange={ ( e ) => setClientSecret( e.target.value ) }
								/>
							</FormControl>
						</SimpleGrid>
						<Flex justify="flex-end">
							<Button
								colorScheme="blue"
								size="sm"
								isLoading={ saving }
								onClick={ handleSaveCredentials }
							>
								Salvar credenciais
							</Button>
						</Flex>
					</Stack>
				</Box>
			) }
		</Box>
	)
}
