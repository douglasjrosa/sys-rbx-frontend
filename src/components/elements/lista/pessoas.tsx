import { capitalizeWords } from '@/function/captalize'
import { Box, Button, Flex, FormControl, FormLabel, GridItem, Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Select, SimpleGrid, Textarea, useDisclosure, useToast } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { PessoasData } from './pessoasdata'
import { useSession } from 'next-auth/react'
import axios from 'axios'


interface pessoalResp {
	id: number
	nome: string
	email: string
	telefone: string
	whatsapp: string
	departamento: string
	Cargo: string
	obs: string
}

export const CompPessoa = ( props: { Resp: any; onAddResp: any; cnpj: any } ) => {
	const [ dados, setDados ] = useState<any>( [] )
	const [ Vendedores, setVendedores ] = useState<any>( [] )
	const [ VendedorId, setVendedorId ] = useState<any>( '' )
	const [ ID, setID ] = useState( '' )
	const [ Nome, setNome ] = useState( '' )
	const [ Email, setEmail ] = useState( '' )
	const [ Telefone, setTelefone ] = useState( '' )
	const [ WhatApp, setWhatApp ] = useState( '' )
	const [ Departamento, setDepartamento ] = useState( '' )
	const [ Cargo, setCargo ] = useState( '' )
	const [ Obs, setObs ] = useState( '' )
	const [ Id, setId ] = useState<number>()
	const [ UPdate, setUPdate ] = useState( false )
	const { data: session } = useSession()
	const [ Bloq, setBloq ] = useState( false )
	const toast = useToast()


	const { isOpen, onOpen, onClose } = useDisclosure()

	useEffect( () => {
		( async () => {
			try {
				const Response = await axios.get( '/api/db/user/getGeral' )
				const dataVendedor = Response.data
				setVendedores( dataVendedor )
			} catch ( error ) {
				console.error( "Erro ao buscar dados:", error )
			}
		} )()
		if ( session?.user.pemission === 'Adm' ) {
			( async () => {
				try {
					const request = await axios( `/api/db/representantes/get?Vendedor=${ session?.user.name }&Empresa=${ props.Resp }&Adm=true` )
					const dados = request.data

					setDados( dados )
				} catch ( error ) {
					console.error( "Erro ao buscar dados:", error )
				}
			} )()
		} else {
			( async () => {
				try {
					const request = await axios( `/api/db/representantes/get?Vendedor=${ session?.user.name }&Empresa=${ props.Resp }&Adm=false` )
					const dados = request.data

					setDados( dados )
				} catch ( error ) {
					console.error( "Erro ao buscar dados:", error )
				}
			} )()
		}
	}, [ props.Resp, session?.user.name, session?.user.pemission ] )


	const reset = () => {
		setNome( '' )
		setEmail( '' )
		setTelefone( '' )
		setWhatApp( '' )
		setDepartamento( '' )
		setCargo( '' )
		setObs( '' )

	}

	const SaveAdd = async () => {
		setBloq( true )
		const Data = {
			data: {
				nome: Nome,
				email: Email,
				telefone: Telefone,
				whatsapp: WhatApp,
				departamento: Departamento,
				cargo: Cargo,
				obs: Obs,
				user: session?.user?.id,
				permissao: session?.user?.pemission,
				empresa: props.Resp
			}
		}

		await axios( `/api/db/representantes/port?USER=${ session?.user.name }&cnpj=${ props.cnpj }`, { method: 'POST', data: Data } )
			.then( async () => {
				if ( session?.user.pemission === 'Adm' ) {
					( async () => {
						try {
							const request = await axios( `/api/db/representantes/get?Vendedor=${ session?.user.name }&Empresa=${ props.Resp }&Adm=true` )
							const dados = request.data

							setDados( dados )
							onClose()
							reset()
							setBloq( false )
						} catch ( error ) {
							console.error( "Erro ao buscar dados:", error )
							setBloq( false )
						}
					} )()
				} else {
					( async () => {
						try {
							const request = await axios( `/api/db/representantes/get?Vendedor=${ session?.user.name }&Empresa=${ props.Resp }&Adm=false` )
							const dados = request.data

							setDados( dados )
							onClose()
							reset()
							setBloq( false )
						} catch ( error ) {
							console.error( "Erro ao buscar dados:", error )
							setBloq( false )
						}
					} )()
				}
			} )
			.catch( ( err ) => {
				console.error( err )
				setBloq( false )
			} )
	}


	function Remover ( idExcluir: any ) {
		const idPessoa = idExcluir;
		( async () => {
			setBloq( true )
			try {
				const excluir = await axios.put( `/api/db/representantes/delet/${ idPessoa }?USER=${ session?.user.name }&cnpj=${ props.cnpj }` )
				const darespostados = excluir.data

				toast( {
					title: 'Pessoa removida com sucesso',
					status: 'success',
					duration: 9000,
					isClosable: true,
					position: 'top-right',
				} )

				if ( session?.user.pemission === 'Adm' ) {
					const request = await axios( `/api/db/representantes/get?Vendedor=${ session?.user.name }&Empresa=${ props.Resp }&Adm=true` )
					const dados = request.data

					setDados( dados )

					onClose()
					reset()
					setBloq( false )


				} else {

					const request = await axios( `/api/db/representantes/get?Vendedor=${ session?.user.name }&Empresa=${ props.Resp }&Adm=false` )
					const dados = request.data

					setDados( dados )
					onClose()
					reset()
					setBloq( false )

				}
			} catch ( error ) {
				console.error( "Erro ao buscar dados:", error )
				setBloq( false )
			}
		} )()
	}

	function Atualizar ( Respdata: any ) {
		setVendedorId( Respdata.attributes.user?.data?.id )
		setId( Respdata.id )
		setNome( Respdata.attributes.nome )
		setEmail( Respdata.attributes.email )
		setTelefone( Respdata.attributes.telefone )
		setWhatApp( Respdata.attributes.whatsapp )
		setDepartamento( Respdata.attributes.departamento )
		setCargo( Respdata.attributes.Cargo )
		setObs( Respdata.attributes.obs )
		setUPdate( true )
		onOpen()
	}


	function Update () {
		( async () => {
			setBloq( true )
			const objetoAtualizado = {
				data: {
					nome: Nome,
					email: Email,
					telefone: Telefone,
					whatsapp: WhatApp,
					departamento: Departamento,
					cargo: Cargo,
					obs: Obs,
					user: VendedorId,
					permissao: VendedorId == session?.user?.id ? 'User' : 'Adm',
				}
			}
			await axios.put( `/api/db/representantes/put/${ Id }?USER=${ session?.user.name }&cnpj=${ props.cnpj }`, objetoAtualizado )
				.then( async () => {
					if ( session?.user.pemission === 'Adm' ) {
						( async () => {
							try {
								const request = await axios( `/api/db/representantes/get?Vendedor=${ session?.user.name }&Empresa=${ props.Resp }&Adm=true` )
								const dados = request.data

								setDados( dados )
								onClose()
								reset()
								setBloq( false )
							} catch ( error ) {
								console.error( "Erro ao buscar dados:", error )
								setBloq( false )
							}
						} )()
					} else {
						( async () => {
							try {
								const request = await axios( `/api/db/representantes/get?Vendedor=${ session?.user.name }&Empresa=${ props.Resp }&Adm=false` )
								const dados = request.data

								setDados( dados )
								onClose()
								reset()
								setBloq( false )
							} catch ( error ) {
								console.error( "Erro ao buscar dados:", error )
								setBloq( false )
							}
						} )()
					}
				} )
				.catch( ( err ) => {
					console.error( err )
					setBloq( false )
				} )
		} )()

	}

	async function handlereload () {
		if ( session?.user.pemission === 'Adm' ) {
			( async () => {
				try {
					const request = await axios( `/api/db/representantes/get?Vendedor=${ session?.user.name }&Empresa=${ props.Resp }&Adm=true` )
					const dados = request.data

					setDados( dados )
					onClose()
					reset()
					setBloq( false )
				} catch ( error ) {
					console.error( "Erro ao buscar dados:", error )
					setBloq( false )
				}
			} )()
		} else {
			try {
				const request = await axios( `/api/db/representantes/get?Vendedor=${ session?.user.name }&Empresa=${ props.Resp }&Adm=false` )
				const dados = request.data

				setDados( dados )
				onClose()
				reset()
				setBloq( false )
			} catch ( error ) {
				console.error( "Erro ao buscar dados:", error )
				setBloq( false )
			}
		}
	}


	return (
		<Box>
			<Flex gap={ 3 } flexDir={ 'row' } alignItems={ 'flex-end' } flexWrap="wrap">
				<Button
					h={ 8 }
					px={ 5 }
					colorScheme="teal"
					size="xs"
					whiteSpace="normal"
					height="auto"
					minH="32px"
					py={1}
					onClick={ onOpen }
				>
					+ Nova Pessoa
				</Button>

				{ dados.map( ( i: any ) => <PessoasData key={ i.id } data={ i } respData={ Remover } respAtualizar={ Atualizar } reload={ handlereload } /> ) }

			</Flex>
			<Modal isOpen={ isOpen } onClose={ onClose }>
				<ModalOverlay />
				<ModalContent bg={ 'gray.600' }>
					<ModalHeader>Add Pessoal</ModalHeader>
					<ModalCloseButton />
					<ModalBody >
						<SimpleGrid
							w={ '100%' }
							columns={ 1 }
							spacing={ 6 }
						>

							<SimpleGrid columns={ 12 } spacing={ 3 }>
								<FormControl as={ GridItem } colSpan={ [ 12 ] }>
									<FormLabel fontSize="xs" fontWeight="md">
										Nome
									</FormLabel>
									<Input
										type="text"
										focusBorderColor="#ffff"
										bg='#ffffff12'
										shadow="sm"
										size="xs"
										w="full"
										rounded="md"
										onChange={ ( e ) => setNome( capitalizeWords( e.target.value ) ) }
										value={ Nome }
									/>
								</FormControl>

								<FormControl as={ GridItem } colSpan={ 6 }>
									<FormLabel
										fontSize="xs"
										fontWeight="md"
									>
										E-mail
									</FormLabel>
									<Input
										type="text"
										focusBorderColor="white"
										bg={ '#ffffff12' }
										shadow="sm"
										size="xs"
										w="full"
										rounded="md"
										onChange={ ( e: any ) => setEmail( e.target.value ) }
										value={ Email }
									/>
								</FormControl>

								<FormControl as={ GridItem } colSpan={ 6 }>
									<FormLabel
										htmlFor="cep"
										fontSize="xs"
										fontWeight="md"
									>
										Telefone
									</FormLabel>
									<Input
										type="text"
										placeholder="(00) 0000-0000"
										focusBorderColor="white"
										bg={ '#ffffff12' }
										shadow="sm"
										size="xs"
										w="full"
										rounded="md"
										onChange={ ( e ) => setTelefone( e.target.value ) }
										value={ Telefone }
									/>
								</FormControl>

								<FormControl as={ GridItem } colSpan={ 6 }>
									<FormLabel
										fontSize="xs"
										fontWeight="md"
									>
										Whatsapp
									</FormLabel>
									<Input
										type="text"
										placeholder="(00) 0 0000-0000"
										focusBorderColor="white"
										bg={ '#ffffff12' }
										shadow="sm"
										size="xs"
										w="full"
										rounded="md"
										onChange={ ( e ) => setWhatApp( e.target.value ) }
										value={ WhatApp }
									/>
								</FormControl>

								<FormControl as={ GridItem } colSpan={ 6 }>
									<FormLabel
										fontSize="xs"
										fontWeight="md"
									>
										Departamento
									</FormLabel>
									<Input
										type="text"
										focusBorderColor="white"
										bg={ '#ffffff12' }
										shadow="sm"
										size="xs"
										w="full"
										rounded="md"
										onChange={ ( e ) => setDepartamento( capitalizeWords( e.target.value ) ) }
										value={ Departamento }
									/>
								</FormControl>

								<FormControl as={ GridItem } colSpan={ 9 }>
									<FormLabel
										fontSize="xs"
										fontWeight="md"
									>
										Cargo
									</FormLabel>
									<Input
										type="text"
										focusBorderColor="white"
										bg={ '#ffffff12' }
										shadow="sm"
										size="xs"
										w="full"
										rounded="md"
										onChange={ ( e ) => setCargo( capitalizeWords( e.target.value ) ) }
										value={ Cargo }
									/>
								</FormControl>
								{ session?.user.pemission === 'Adm' && <FormControl as={ GridItem } colSpan={ 9 }>
									<FormLabel
										fontSize="xs"
										fontWeight="md"
									>
										Vendedor
									</FormLabel>
									<Select
										focusBorderColor="white"
										bg={ '#ffffff12' }
										shadow="sm"
										size="xs"
										w="full"
										rounded="md"
										onChange={ ( e ) => setVendedorId( e.target.value ) }
										value={ VendedorId }

									>
										<option
											style={ { backgroundColor: '#515151', color: 'white' } }
											value=''
										></option>
										{ Vendedores.map( ( i: any ) => {
											return (
												<option
													key={ i.id }

													style={ { backgroundColor: '#515151', color: 'white' } }
													value={ i.id }
												>
													{ i.username }
												</option>
											)
										} ) }

									</Select>

								</FormControl>
								}

							</SimpleGrid>

							<SimpleGrid columns={ 12 } spacing={ 3 }>

								<Heading as={ GridItem } colSpan={ 12 } size="sd">
									Observações
								</Heading>
								<Box as={ GridItem } colSpan={ 12 } >
									<Textarea
										borderColor="white"
										bg={ '#ffffff12' }
										placeholder="Especifique aqui, todos os detalhes do cliente"
										size="sm"
										resize={ "none" }
										onChange={ ( e: any ) => setObs( capitalizeWords( e.target.value ) ) }
										value={ Obs }
									/>
								</Box>
							</SimpleGrid>

						</SimpleGrid>

					</ModalBody>
					<ModalFooter>
						{ !UPdate && <Button colorScheme='blue' mr={ 3 } isDisabled={ Bloq } onClick={ SaveAdd }>Adicionar</Button> }
						{ !!UPdate && <Button colorScheme='blue' mr={ 3 } isDisabled={ Bloq } onClick={ Update }>Atualizar</Button> }

					</ModalFooter>
				</ModalContent>
			</Modal>

		</Box>
	)
}
