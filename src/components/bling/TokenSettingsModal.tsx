import {
	Button,
	Flex,
	FormControl,
	FormLabel,
	Input,
	InputGroup,
	InputRightElement,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Stack,
	Switch,
	Text,
	useToast,
} from "@chakra-ui/react"
import { useEffect, useMemo, useState } from "react"
import {
	buildBlingRedirectUrl,
	formatCnpjDisplay,
	getEmitenteDisplayName,
} from "@/utils/blingOAuth"

export interface TokenFormData {
	id?: number
	cnpj: string
	client_id: string
	client_secret: string
	mainAccount: boolean
	expires_in: string
	updatedAt?: string
}

interface EmitenteAttributes {
	nome?: string
	razao?: string
	CNPJ?: string
	token?: Partial<TokenFormData> & { id?: number } | null
}

interface TokenSettingsModalProps {
	isOpen: boolean
	onClose: () => void
	emitente: { id: number; attributes: EmitenteAttributes } | null
	onSaved: () => void
}

const emptyForm = ( cnpj: string ): TokenFormData => ( {
	cnpj,
	client_id: "",
	client_secret: "",
	mainAccount: false,
	expires_in: "21600",
} )

const inputProps = {
	focusBorderColor: "#ffff",
	bg: "#ffffff12",
	size: "sm" as const,
	w: "full",
	rounded: "md",
}

export const TokenSettingsModal = ( {
	isOpen,
	onClose,
	emitente,
	onSaved,
}: TokenSettingsModalProps ) => {
	const toast = useToast()
	const [ form, setForm ] = useState<TokenFormData | null>( null )
	const [ saving, setSaving ] = useState( false )
	const [ deleting, setDeleting ] = useState( false )

	useEffect( () => {
		if ( !isOpen || !emitente ) {
			setForm( null )
			return
		}
		const attrs = emitente.attributes
		const cnpj = String( attrs.CNPJ ?? "" ).replace( /\D/g, "" )
		const token = attrs.token

		if ( token?.id ) {
			setForm( {
				id: token.id,
				cnpj,
				client_id: token.client_id ?? "",
				client_secret: token.client_secret ?? "",
				mainAccount: token.mainAccount ?? false,
				expires_in: String( token.expires_in ?? "21600" ),
				updatedAt: token.updatedAt,
			} )
			return
		}

		setForm( emptyForm( cnpj ) )
	}, [ isOpen, emitente ] )

	const displayName = emitente
		? getEmitenteDisplayName( emitente.attributes )
		: ""

	const redirectUrl = useMemo( () => {
		if ( !form?.cnpj || !form.client_id || !form.client_secret ) return ""
		const origin = typeof window !== "undefined"
			? window.location.origin
			: ( process.env.NEXT_PUBLIC_BASE_URL ?? "" )
		return buildBlingRedirectUrl(
			origin,
			form.cnpj,
			form.client_id,
			form.client_secret
		)
	}, [ form ] )

	const updateField = ( key: keyof TokenFormData, value: string | boolean ) => {
		setForm( ( prev ) => ( prev ? { ...prev, [ key ]: value } : prev ) )
	}

	const handleCopyRedirectUrl = async () => {
		if ( !redirectUrl ) return
		try {
			await navigator.clipboard.writeText( redirectUrl )
			toast( {
				title: "Link copiado",
				status: "success",
				duration: 2000,
				isClosable: true,
			} )
		} catch {
			toast( {
				title: "Não foi possível copiar",
				status: "error",
				duration: 3000,
				isClosable: true,
			} )
		}
	}

	const handleSave = async () => {
		if ( !form?.cnpj || !form.client_id || !form.client_secret ) {
			toast( {
				title: "Campos obrigatórios",
				description: "CNPJ, Client ID e Client Secret são obrigatórios.",
				status: "warning",
				duration: 4000,
				isClosable: true,
			} )
			return
		}

		setSaving( true )
		try {
			const payload = {
				data: {
					cnpj: form.cnpj,
					client_id: form.client_id,
					client_secret: form.client_secret,
					mainAccount: form.mainAccount,
					expires_in: form.expires_in || "21600",
				},
			}

			const url = form.id
				? `/api/db/tokens/${ form.id }`
				: "/api/db/tokens"
			const method = form.id ? "PUT" : "POST"

			const res = await fetch( url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify( payload ),
			} )

			if ( !res.ok ) {
				const err = await res.json().catch( () => ( {} ) )
				throw new Error( err.message || "Failed to save token" )
			}

			toast( {
				title: "Configurações salvas",
				status: "success",
				duration: 3000,
				isClosable: true,
			} )
			onSaved()
			onClose()
		} catch ( error: any ) {
			toast( {
				title: "Erro ao salvar",
				description: error?.message || "Tente novamente.",
				status: "error",
				duration: 5000,
				isClosable: true,
			} )
		} finally {
			setSaving( false )
		}
	}

	const handleDelete = async () => {
		if ( !form?.id ) return
		setDeleting( true )
		try {
			const res = await fetch( `/api/db/tokens/${ form.id }`, {
				method: "DELETE",
			} )
			if ( !res.ok ) throw new Error( "Failed to delete token" )

			toast( {
				title: "Token removido",
				status: "success",
				duration: 3000,
				isClosable: true,
			} )
			onSaved()
			onClose()
		} catch {
			toast( {
				title: "Erro ao excluir token",
				status: "error",
				duration: 5000,
				isClosable: true,
			} )
		} finally {
			setDeleting( false )
		}
	}

	if ( !form ) return null

	return (
		<Modal isOpen={ isOpen } onClose={ onClose } size="lg">
			<ModalOverlay backdropFilter="blur(4px)" />
			<ModalContent bg="gray.800" color="white">
				<ModalHeader>
					Configurações Bling — { displayName }
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<Stack spacing={ 4 }>
						<FormControl>
							<FormLabel fontSize="xs">CNPJ</FormLabel>
							<Input
								{...inputProps}
								value={ formatCnpjDisplay( form.cnpj ) }
								isReadOnly
							/>
						</FormControl>
						<FormControl isRequired>
							<FormLabel fontSize="xs">Client ID</FormLabel>
							<Input
								{...inputProps}
								value={ form.client_id }
								onChange={ ( e ) => updateField( "client_id", e.target.value ) }
							/>
						</FormControl>
						<FormControl isRequired>
							<FormLabel fontSize="xs">Client Secret</FormLabel>
							<Input
								{...inputProps}
								type="password"
								value={ form.client_secret }
								onChange={ ( e ) => updateField( "client_secret", e.target.value ) }
							/>
						</FormControl>
						<FormControl>
							<FormLabel fontSize="xs">Link de redirecionamento</FormLabel>
							<InputGroup size="sm">
								<Input
									{...inputProps}
									value={ redirectUrl }
									isReadOnly
									placeholder="Preencha Client ID e Client Secret"
									fontSize="xs"
									pr="4.5rem"
								/>
								<InputRightElement width="4.5rem">
									<Button
										h="1.75rem"
										size="xs"
										onClick={ handleCopyRedirectUrl }
										isDisabled={ !redirectUrl }
									>
										Copiar
									</Button>
								</InputRightElement>
							</InputGroup>
							<Text fontSize="xs" color="gray.400" mt={ 1 }>
								URL de callback OAuth para cadastrar no aplicativo Bling.
							</Text>
						</FormControl>
						<FormControl>
							<FormLabel fontSize="xs">Expires in (seconds)</FormLabel>
							<Input
								{...inputProps}
								value={ form.expires_in }
								onChange={ ( e ) => updateField( "expires_in", e.target.value ) }
							/>
						</FormControl>
						<Flex align="center" gap={ 3 }>
							<Switch
								colorScheme="green"
								isChecked={ form.mainAccount }
								onChange={ ( e ) => updateField( "mainAccount", e.target.checked ) }
							/>
							<FormLabel fontSize="xs" mb={ 0 }>Main account</FormLabel>
						</Flex>
						{ form.updatedAt && (
							<Text fontSize="xs" color="gray.400">
								Última atualização: { new Date( form.updatedAt ).toLocaleString( "pt-BR" ) }
							</Text>
						) }
					</Stack>
				</ModalBody>
				<ModalFooter gap={ 2 }>
					{ form.id && (
						<Button
							colorScheme="red"
							variant="outline"
							size="sm"
							isLoading={ deleting }
							onClick={ handleDelete }
						>
							Excluir
						</Button>
					) }
					<Button variant="ghost" size="sm" onClick={ onClose }>
						Cancelar
					</Button>
					<Button
						colorScheme="blue"
						size="sm"
						isLoading={ saving }
						onClick={ handleSave }
					>
						Salvar
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	)
}
