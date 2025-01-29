import { FormEvent, useEffect, useState } from "react"
import {
	Box,
	Button,
	chakra,
	Flex,
	FormControl,
	FormLabel,
	Heading,
	Input,
	Stack,
	StackDirection,
	useBreakpointValue
} from '@chakra-ui/react'
import { useRouter } from "next/router"

interface AccountToken {
	account: string
	client_id: string
	client_secret: string
	access_token: string
	expires_in: number
	refresh_token: string
}

const Bling: React.FC = () => {

	const { query: { code, cnpj, client_id, client_secret, emitente } } = useRouter()

	const [ formData, setFormData ] = useState<any>( {} )
	const [ registered, setRegistered ] = useState( false )
	const [ disabled, setDisabled ] = useState( false )
	const [ fail, setFail ] = useState( "" )


	const registerBlingApiToken = async ( accountToken: AccountToken ): Promise<boolean> => {
		try {

			const register = await fetch( "/api/db/tokens/bling/register", {
				method: "POST",
				body: JSON.stringify( { data: accountToken } )
			} ).then( ( r ) => r.json() )
			return register.data.attributes.hasOwnProperty( "access_token" )

		} catch ( error ) {
			console.error( error )
			return false
		}
	}

	useEffect( () => {
		try {
			if ( !formData.hasOwnProperty( "code" ) ) return
			fetch( "/api/bling/auth/register", {
				method: "POST",
				body: JSON.stringify( formData )
			} ).then( ( r ) => r.json() ).then( async ( responseData ) => {

				if ( responseData.hasOwnProperty( "error" ) ) {
					setFail( `Error description: ${ responseData.error.description }` )
					setDisabled( false )
				}
				else {
					const { code, ...restFormData } = formData
					const { scope, token_type, ...restResponseData } = responseData
					const accountToken = {
						mainAccount: false,
						...restFormData,
						...restResponseData
					}
					const success = await registerBlingApiToken( accountToken )
					setRegistered( success )
					setDisabled( success )
					if ( !success ) setFail( "Não foi possível salvar o token no banco de dados." )
				}
			} )
		} catch ( error ) {
			console.error( error )
			setDisabled( false )
			setFail( "Algo deu errado. Não foi possível registrar o token." )
		}
	}, [ formData ] )

	const handleSubmit = ( e: FormEvent<HTMLFormElement> ) => {
		e.preventDefault()
		setDisabled( true )
		const formData = new FormData( e.currentTarget )
		const formDataObject = Object.fromEntries( formData.entries() )

		setFormData( formDataObject )
	}

	const stackDirection = useBreakpointValue( { base: 'column', xl: 'row' } ) as StackDirection

	return (
		<Box m={ 100 } p={ 20 } bg={ 'gray.700' } rounded="xl">
			<Heading mb={ 10 }>Autenticação - Bling API</Heading>
			<chakra.form method="POST" onSubmit={ handleSubmit }>
				<Stack direction={ stackDirection } spacing={ 5 } mb={ 5 }>
					<FormControl>
						<FormLabel>Bling account:</FormLabel>
						<Input
							type="text"
							name="account"
							focusBorderColor="#ffff"
							bg='#ffffff12'
							size="md"
							w="full"
							rounded="md"
							isDisabled={ disabled }
							value={ emitente }
							required
						/>
					</FormControl>
					<FormControl>
						<FormLabel>Client id:</FormLabel>
						<Input
							type="text"
							name="client_id"
							focusBorderColor="#ffff"
							bg='#ffffff12'
							size="md"
							w="full"
							rounded="md"
							readOnly
							value={ client_id }
						/>
					</FormControl>
					<FormControl>
						<FormLabel>Client secret:</FormLabel>
						<Input
							type="text"
							name="client_secret"
							focusBorderColor="#ffff"
							bg='#ffffff12'
							size="md"
							w="full"
							rounded="md"
							readOnly
							value={ client_secret }
						/>
					</FormControl>
					<FormControl>
						<FormLabel>Code:</FormLabel>
						<Input
							type="text"
							name="code"
							focusBorderColor="#ffff"
							bg='#ffffff12'
							size="md"
							w="full"
							rounded="md"
							readOnly
							value={ code }
						/>
					</FormControl>
					<FormControl>
						<FormLabel>CNPJ:</FormLabel>
						<Input
							type="text"
							name="cnpj"
							focusBorderColor="#ffff"
							bg='#ffffff12'
							size="md"
							w="full"
							rounded="md"
							readOnly
							value={ cnpj }
						/>
					</FormControl>
				</Stack>
				<Flex justify="center" my={ 14 } >
					<Button
						type="submit"
						size="lg"
						px={ 20 }
						colorScheme="messenger"
						rounded="md"
						isDisabled={ disabled }
					>
						Registrar Token
					</Button>
				</Flex>
			</chakra.form>
			{ registered &&
				<Box my={ 50 } p={ 20 } bg={ 'green.600' } rounded="xl">
					<Heading mb={ 10 }>Deu certo! Token registrado com sucesso na API do Bling.</Heading>
					<Heading>Você já pode sair desta página.</Heading>
				</Box>
			}
			{ fail &&
				<Box my={ 50 } p={ 20 } bg={ 'red.600' } rounded="xl">
					<Heading mb={ 10 }>Algo deu errado! O Token não foi registrado na API do Bling.</Heading>
					<Heading mb={ 10 }>{ fail }</Heading>
				</Box>
			}
		</Box>
	)
}
export default Bling