import { Box, Button, Flex, FormControl, FormLabel, Heading, Input, Select, useToast } from "@chakra-ui/react"
import axios from "axios"
import { useEffect, useState } from "react"




export const DadosVendedor = ( props: { id: any } ) => {
	const IDVendedor = props.id
	const [ Nome, setNome ] = useState( '' )
	const [ Email, setEmail ] = useState( '' )
	const [ Telefone, setTelefone ] = useState( '' )
	const [ Recorde, setRecorde ] = useState( '' )
	const [ Status, setStatus ] = useState( '' )
	const toast = useToast()
	const [ Bloq, setBloq ] = useState( false )


	useEffect( () => {
		( async () => {
			try {
				const response = await axios.get( `/api/db/user/getId/${ IDVendedor }` )
				const repo = response.data

				setNome( repo.username )
				setEmail( repo.email )
				setTelefone( repo.tel )
				setRecorde( repo.record )
				setStatus( repo.confirmed )

			} catch ( error ) {
				console.error( error )
			}
		} )()
	}, [ IDVendedor ] )


	const salvar = async () => {
		setBloq( true )
		try {
			const Data = {
				username: Nome,
				nome: Nome,
				email: Email,
				setor: "Vendas",
				pemission: "User",
				tel: Telefone,
				record: Recorde,
				confirmed: Status == 'true' ? true : false
			}

			const request = await axios( `/api/db/user/put/${ IDVendedor }`, {
				method: 'PUT',
				data: Data
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



	return (
		<>
			{/* dados do vendedor */ }
			<Flex w={ '100%' } flexDir={ 'column' } justifyContent={ 'space-between' } p={ 5 }>
				<Box w={ '100%' }><Heading size={ 'md' } mb={ 3 }>Vendedor</Heading></Box>
				<Flex gap={ 4 } w={ '100%' } px={ 3 } flexWrap={ 'wrap' } >

					<Box w={ '20%' }>
						<FormControl>
							<FormLabel fontSize={ 'xs' }>Nome do vendedor</FormLabel>
							<Input
								focusBorderColor="#ffff"
								bg='#ffffff12'
								shadow="sm"
								size="xs"
								w="full"
								fontSize="xs"
								rounded="md"
								value={ Nome }
								onChange={ ( e ) => setNome( e.target.value ) }
							/>
						</FormControl>
					</Box>

					<Box w={ '20%' }>
						<FormControl>
							<FormLabel fontSize={ 'xs' }>E-mail do vendedor</FormLabel>
							<Input
								focusBorderColor="#ffff"
								bg='#ffffff12'
								shadow="sm"
								size="xs"
								w="full"
								fontSize="xs"
								rounded="md"
								value={ Email }
								onChange={ ( e ) => setEmail( e.target.value ) }
							/>
						</FormControl>
					</Box>

					<Box w={ '20%' }>
						<FormControl>
							<FormLabel fontSize={ 'xs' }>Telefone do vendedor</FormLabel>
							<Input
								focusBorderColor="#ffff"
								bg='#ffffff12'
								shadow="sm"
								size="xs"
								w="full"
								fontSize="xs"
								rounded="md"
								value={ Telefone }
								onChange={ ( e ) => setTelefone( e.target.value ) }
							/>
						</FormControl>
					</Box>

					<Box w={ '20%' }>
						<FormControl>
							<FormLabel fontSize={ 'xs' }>Recorde de venda</FormLabel>
							<Input
								focusBorderColor="#ffff"
								bg='#ffffff12'
								shadow="sm"
								size="xs"
								w="full"
								fontSize="xs"
								rounded="md"
								value={ Recorde }
								onChange={ ( e ) => setRecorde( e.target.value ) }
							/>
						</FormControl>
					</Box>

					<Box w={ '20%' }>
						<FormControl>
							<FormLabel fontSize={ 'xs' }>Status</FormLabel>
							<Select
								focusBorderColor="#ffff"
								bg='#ffffff12'
								shadow="sm"
								size="xs"
								w="full"
								rounded="md"
								value={ Status }
								onChange={ ( e ) => setStatus( e.target.value ) }
							>
								<option style={ { backgroundColor: "#1A202C" } }></option>
								<option style={ { backgroundColor: "#1A202C" } } value={ "true" }>Ativo</option>
								<option style={ { backgroundColor: "#1A202C" } } value={ "false" }>Inativo</option>
							</Select>
						</FormControl>
					</Box>

				</Flex>

				<Flex gap={ 4 } justifyContent={ 'end' }>
					<Button colorScheme="green" isDisabled={ Bloq } onClick={ salvar }>Salvar</Button>
				</Flex>

			</Flex>
		</>
	)
}
