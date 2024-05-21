/* eslint-disable react/display-name */
import { Box, Button, ButtonGroup, Flex, FormControl, FormLabel, Input, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverTrigger, Select, useDisclosure } from "@chakra-ui/react"
import axios from "axios"
import { useState, useEffect, useRef } from "react"


export const FormaPg = ( props: { id: any; retorno: any; envio: any } ) => {
	const [ maxPg, setMaxpg ] = useState( "Antecipado" )

	const [ Titulo, setTitulo ] = useState( "" )
	const [ Valor, setValor ] = useState( "" )
	const [ Id, setId ] = useState( "" )
	const [ Data, setData ] = useState<any>( [] )
	const { onOpen, onClose, isOpen } = useDisclosure()
	const [ Block, setBlock ] = useState( false )
	const firstFieldRef = useRef( null )

	useEffect( () => {
		if ( props.retorno ) {
			setMaxpg( props.retorno )
		}
		if ( props.id ) {
			( async () => {
				setId( props.id )
				await axios( {
					method: "GET",
					url: `/api/db/empresas/getFormaPg?Empresa=${ props.id }`,
				} )
					.then( ( res ) => setData( res.data ) )
					.catch( ( err ) => console.error( err ) )
			} )()
		}
	}, [ props.id, props.retorno ] )

	const salvar = async () => {
		setBlock( true )
		const Dados = {
			data: {
				title: Titulo,
				value: Valor,
				empresas: Id
			}
		}

		await axios( {
			method: "POST",
			url: `/api/db/empresas/setFormaPg`,
			data: Dados
		} )
			.then( async () => {
				try {
					const resposta = await axios( {
						method: "GET",
						url: `/api/db/empresas/getFormaPg?Empresa=${ props.id }`,
					} )
					setData( resposta.data )
					setValor( '' )
					setTitulo( '' )
					onClose()
					setBlock( false )
				} catch ( error ) {
					console.error( error )
					setBlock( false )
				}
			} )
			.catch( ( err ) => {
				console.error( err )
				setBlock( false )
			} )
	}


	return (
		<>
			<Flex gap={ 3 } alignItems={ 'self-end' }>
				<Box>
					<FormLabel
						fontSize="xs"
						fontWeight="md"
					>
						Condição de pagamento
					</FormLabel>
					<Select
						focusBorderColor="#ffff"
						bg='#ffffff12'
						shadow="sm"
						size="xs"
						w="full"
						fontSize="xs"
						rounded="md"
						onChange={ ( e ) => props.envio( e.target.value ) }
						value={ maxPg }
					>
						<option style={ { backgroundColor: "#1A202C" } }>
							Selecione uma condição de pagamento
						</option>
						{ Data.map( ( i: any ) => {

							return (
								<option style={ { backgroundColor: "#1A202C" } } key={ i.id } value={ i.attributes.value }>
									{ i.attributes.title }
								</option>
							)
						} ) }
					</Select>
				</Box>
				<Popover
					isOpen={ isOpen }
					initialFocusRef={ firstFieldRef }
					onOpen={ onOpen }
					onClose={ onClose }
					placement='right'
					closeOnBlur={ false }
				>
					<PopoverTrigger>
						<Button colorScheme="whatsapp">Adicionar Pagamento</Button>
					</PopoverTrigger>
					<PopoverContent p={ 5 }>
						<PopoverArrow />
						<PopoverCloseButton color={ 'black' } />
						<PopoverBody>

							<FormControl>
								<FormLabel
									color={ "black" }
								>
									Condição
								</FormLabel>
								<Input
									type="text"
									color={ "black" }
									onChange={ ( e ) => {
										setTitulo( e.target.value )
										setValor( e.target.value )
									} }
									value={ Titulo }
								/>
							</FormControl>

							<ButtonGroup display='flex' justifyContent='flex-end' mt={ 3 }>
								<Button variant='outline' onClick={ onClose }>
									Cancel
								</Button>
								<Button isDisabled={ Block } colorScheme='teal' onClick={ salvar }>
									Salvar
								</Button>
							</ButtonGroup>

						</PopoverBody>
					</PopoverContent>
				</Popover>
			</Flex>

		</>
	)
}
