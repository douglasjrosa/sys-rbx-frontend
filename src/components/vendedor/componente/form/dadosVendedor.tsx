import {
	Button,
	Flex,
	FormControl,
	FormLabel,
	Grid,
	Input,
	Select,
	useToast,
} from "@chakra-ui/react"
import axios from "axios"
import { useEffect, useState } from "react"

const CPF_REGEX = /^\d{0,11}$/
const formatCpfForDisplay = ( v: string ) => {
	const d = String( v ).replace( /\D/g, "" ).slice( 0, 11 )
	if ( d.length <= 3 ) return d
	if ( d.length <= 6 ) return `${ d.slice( 0, 3 ) }.${ d.slice( 3 ) }`
	if ( d.length <= 9 ) return `${ d.slice( 0, 3 ) }.${ d.slice( 3, 6 ) }.${ d.slice( 6 ) }`
	return `${ d.slice( 0, 3 ) }.${ d.slice( 3, 6 ) }.${ d.slice( 6, 9 ) }-${ d.slice( 9 ) }`
}

export const DadosVendedor = ( props: { id: any } ) => {
	const IDVendedor = props.id
	const [ Nome, setNome ] = useState( "" )
	const [ Sobrenome, setSobrenome ] = useState( "" )
	const [ Cpf, setCpf ] = useState( "" )
	const [ Email, setEmail ] = useState( "" )
	const [ Telefone, setTelefone ] = useState( "" )
	const [ Status, setStatus ] = useState( "" )
	const [ EmpresaEmitente, setEmpresaEmitente ] = useState<string>( "" )
	const [ EmpresasList, setEmpresasList ] = useState<{ id: number; razao?: string; nome?: string }[]>( [] )
	const toast = useToast()
	const [ Bloq, setBloq ] = useState( false )

	useEffect( () => {
		if ( !IDVendedor ) return
		( async () => {
			try {
				const response = await axios.get( `/api/db/user/getId/${ IDVendedor }` )
				const repo = response.data
				const emitente = repo.empresa_emitente?.data
				setNome( repo.nome || repo.username || "" )
				setSobrenome( repo.sobrenome || "" )
				setCpf( repo.cpf ? formatCpfForDisplay( repo.cpf ) : "" )
				setEmail( repo.email || "" )
				setTelefone( repo.tel || "" )
				setStatus( String( repo.confirmed ?? "" ) )
				setEmpresaEmitente( emitente?.id ? String( emitente.id ) : "" )
			} catch ( error ) {
				console.error( error )
			}
		} )()
	}, [ IDVendedor ] )

	useEffect( () => {
		( async () => {
			try {
				const res = await axios.get( "/api/db/empresas/emitentes" )
				const items = res.data?.data ?? []
				setEmpresasList(
					items.map( ( e: any ) => ( {
						id: e.id,
						razao: e.attributes?.razao,
						nome: e.attributes?.nome,
					} ) )
				)
			} catch {
				setEmpresasList( [] )
			}
		} )()
	}, [] )


	const salvar = async () => {
		setBloq( true )
		try {
			const cpfDigits = Cpf.replace( /\D/g, "" )
			const Data: Record<string, unknown> = {
				username: Nome || undefined,
				nome: Nome,
				sobrenome: Sobrenome || undefined,
				cpf: cpfDigits || undefined,
				email: Email,
				setor: "Vendas",
				pemission: "User",
				tel: Telefone,
				confirmed: Status === "true",
				empresa_emitente: EmpresaEmitente ? parseInt( EmpresaEmitente, 10 ) : null,
			}

			const request = await axios( `/api/db/user/put/${ IDVendedor }`, {
				method: "PUT",
				data: Data,
			} )

			const resposta = request.data
			toast( {
				title: 'Salvo com sucesso',
				status: 'success',
				duration: 3000,
				isClosable: true
			} )
			setBloq( false )
		} catch ( error: any ) {
			toast( {
				title: 'Erro',
				description: `Erro ao cadastrar usuario, ${ error.response.data.message }`,
				status: 'error',
				duration: 9000,
				isClosable: true
			} )
			setBloq( false )
		}
	}



	const inputProps = {
		focusBorderColor: "#ffff",
		bg: "#ffffff12",
		shadow: "sm",
		size: "xs",
		w: "full",
		fontSize: "xs",
		rounded: "md",
	}
	const selectProps = {
		focusBorderColor: "#ffff",
		bg: "#ffffff12",
		shadow: "sm",
		size: "xs",
		w: "full",
		rounded: "md",
	}
	const optionStyle = { backgroundColor: "#1A202C" }

	return (
		<Flex w="100%" flexDir="column" gap={ 4 } p={ 3 }>
			<Grid
				templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }}
				gap={ 4 }
			>
				<FormControl>
					<FormLabel fontSize="xs">Nome do vendedor</FormLabel>
					<Input {...inputProps} value={ Nome } onChange={ ( e ) => setNome( e.target.value ) } />
				</FormControl>
				<FormControl>
					<FormLabel fontSize="xs">Sobrenome</FormLabel>
					<Input {...inputProps} value={ Sobrenome } onChange={ ( e ) => setSobrenome( e.target.value ) } />
				</FormControl>
				<FormControl>
					<FormLabel fontSize="xs">CPF</FormLabel>
					<Input
						{...inputProps}
						value={ Cpf }
						placeholder="000.000.000-00"
						onChange={ ( e ) => {
							const v = e.target.value.replace( /\D/g, "" )
							if ( CPF_REGEX.test( v ) ) setCpf( formatCpfForDisplay( v ) )
						} }
					/>
				</FormControl>
				<FormControl>
					<FormLabel fontSize="xs">Empresa emitente</FormLabel>
					<Select {...selectProps} value={ EmpresaEmitente } onChange={ ( e ) => setEmpresaEmitente( e.target.value ) }>
						<option style={ optionStyle } value="">Nenhuma</option>
						{ EmpresasList.map( ( emp ) => (
							<option key={ emp.id } style={ optionStyle } value={ String( emp.id ) }>
								{ emp.razao || emp.nome || `Empresa ${ emp.id }` }
							</option>
						) ) }
					</Select>
				</FormControl>
				<FormControl>
					<FormLabel fontSize="xs">E-mail do vendedor</FormLabel>
					<Input {...inputProps} value={ Email } onChange={ ( e ) => setEmail( e.target.value ) } />
				</FormControl>
				<FormControl>
					<FormLabel fontSize="xs">Telefone do vendedor</FormLabel>
					<Input {...inputProps} value={ Telefone } onChange={ ( e ) => setTelefone( e.target.value ) } />
				</FormControl>
				<FormControl>
					<FormLabel fontSize="xs">Status</FormLabel>
					<Select {...selectProps} value={ Status } onChange={ ( e ) => setStatus( e.target.value ) }>
						<option style={ optionStyle }></option>
						<option style={ optionStyle } value="true">Ativo</option>
						<option style={ optionStyle } value="false">Inativo</option>
					</Select>
				</FormControl>
			</Grid>
			<Flex justifyContent="flex-end">
				<Button colorScheme="green" isDisabled={ Bloq } onClick={ salvar }>Salvar</Button>
			</Flex>
		</Flex>
	)
}
