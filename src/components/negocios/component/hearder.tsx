import {
	Box,
	Button,
	Flex,
	FormLabel,
	Heading,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Select,
	Text,
	useDisclosure,
	useToast,
} from "@chakra-ui/react"
import axios from "axios"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { SetStateAction, useEffect, useState } from "react"
import { BtnStatus } from "../../elements/lista/status"
import { StatusPerca } from "@/components/data/perca"
import { EtapasNegocio } from "@/components/data/etapa"
import { BtmRetorno } from "@/components/elements/btmRetorno"
import { SetValue } from "@/function/currenteValor"
import { pedido } from "@/function/setpedido"
import formatarDataParaSaoPaulo from "@/function/formatHora"

export const NegocioHeader = ( props: {
	nBusiness: string
	Approach: string
	Budget: string
	title: string
	Status: any
	Deadline: string
	historia?: any
	DataRetorno?: string
	etapa?: any
	Mperca?: any
	onLoad: any
	chat: any
	onchat: any
	onData: any
} ) => {
	const router = useRouter()
	const ID = router.query.id
	const toast = useToast()
	const { data: session } = useSession()
	const [ Status, setStatus ] = useState<any>()
	const [ Etapa, setEtapa ] = useState<any>()
	const [ Mperca, setMperca ] = useState<any>()
	const [ Busines, setBusines ] = useState( "" )
	const [ Approach, setApproach ] = useState( "" )
	const [ Budget, setBudget ] = useState<any>()
	const [ Deadline, setDeadline ] = useState( "" )
	const [ NPedido, setNPedido ] = useState( "" )
	const [ Bpedido, setBpedido ] = useState( "" )
	const [ DataRetorno, setDataRetorno ] = useState<any>()
	const [ Data, setData ] = useState<any | null>()
	const [ PropostaId, setPropostaId ] = useState( '' )
	const [ DataItens, setDataItens ] = useState<any | null>()
	const [ load, setload ] = useState<boolean>( false )
	const [ Blocksave, setBlocksave ] = useState<boolean>( false )
	const { isOpen, onOpen, onClose } = useDisclosure()

	useEffect( () => {
		if ( props.onData ) {
			setData( props.onData )
			setStatus( parseInt( props.Status ) )
			setBudget( SetValue( props.Budget ) )
			setDeadline( props.Deadline )
			setBusines( props.nBusiness )
			setApproach( props.Approach )
			setDataRetorno( !props.DataRetorno ? new Date().toISOString() : props.DataRetorno )
			setMperca( props.Mperca )
			setEtapa( parseInt( props.etapa ) )
			props.onLoad( false )
			const [ pedidos ] = props.onData.attributes.pedidos.data
			const nPedido = pedidos?.attributes.nPedido
			setNPedido( nPedido )
			setBpedido( props.onData.attributes.Bpedido )
			const ITENS = pedidos?.attributes
			setPropostaId( props.onData.attributes?.pedidos?.data[ 0 ]?.id )
			setDataItens( ITENS?.itens )
			setBlocksave( props.nBusiness && parseInt( props.etapa ) === 6 || parseInt( props.Status ) === 1 && parseInt( props.etapa ) === 6 ? true : false )
		}
	}, [ props ] )
	const DataAtual = formatarDataParaSaoPaulo( new Date( Date.now() ) )

	const historicomsg = {
		vendedor: session?.user.name,
		date: DataAtual.toLocaleString(),
		msg: `Vendedor(a) ${ session?.user.name }, alterou as informações desse Busines`,
	}

	const filtro = StatusPerca.filter( ( e: any ) => e.id == Mperca ).map( ( i: any ) => i.title )

	const ChatConcluido = {
		msg: Status === 5 ? `Parabéns, você concluiu esse Negocio com sucesso` : `Negocio perdido, motivo: ${ filtro }`,
		date: DataAtual,
		user: "Sistema",
		susseso: Status === 5 ? 'green' : Status === 1 ? 'red' : '',
		flag: Status === 5 ? "Ganho" : 'Perca'
	}

	const history = [ ...props.historia, historicomsg ]

	const Salve = async () => {

		if ( Etapa === 6 && Status == 3 ) {
			toast( {
				title: "Esse Negócio não pode ser finalizado",
				description: "Ao concluir um Negócio, é obrigatório definir um status",
				status: "warning",
				duration: 9000,
				isClosable: true,
				position: 'top-right'
			} )
		} else if ( !NPedido && Etapa === 6 && Status === 5 && DataItens.length < 0 ) {
			toast( {
				title: "Esse Negócio não pode ser finalizado",
				description: "para finalizar um negócio, a proposta deve ser gerada e autorizada",
				status: "warning",
				duration: 9000,
				isClosable: true,
				position: 'top-right'
			} )
		} else {
			const data1 = {
				data: {
					deadline: Deadline,
					nBusiness: Busines,
					Budget: SetValue( Budget ),
					Approach: Approach,
					history: history,
					etapa: Etapa,
					andamento: Status,
					Mperca: Mperca,
					incidentRecord: [ ...props.chat, ChatConcluido ],
					DataRetorno: DataRetorno,
					date_conclucao: DataAtual
				},
			}

			const data2 = {
				data: {
					deadline: Deadline,
					nBusiness: Busines,
					Budget: SetValue( Budget ),
					Approach: Approach,
					history: history,
					etapa: Etapa,
					andamento: Status,
					Mperca: Mperca,
					DataRetorno: DataRetorno,
				},
			}

			const data = Etapa === 6 ? data1 : data2

			await axios( {
				url: "/api/db/business/put/id/" + ID,
				method: "PUT",
				data: data,
			} )
				.then( ( res ) => {
					if ( NPedido && Etapa === 6 && Status === 5 ) {
						onOpen()
						setBlocksave( true )
					} else if ( Etapa === 6 && Status === 1 ) {
						toast( {
							title: "Atualização feita",
							description: "Infelizmente esse negocio foi perdido",
							status: "error",
							duration: 9000,
							isClosable: true,
						} )
						props.onchat( true )
						setBlocksave( true )
					} else {
						toast( {
							title: "Atualização feita",
							description: "Atualização das informações foi efetuada com sucesso",
							status: "info",
							duration: 9000,
							isClosable: true,
						} )
						props.onchat( true )
					}
				} )
				.catch( ( err ) => {
					props.onchat( true )
					console.error( err )
				} )
		}
	}

	const masckValor = ( e: any ) => {
		const valor = e.target.value.replace( '.', '' ).replace( ',', '' )
		const valorformat = SetValue( valor )
		if ( valor.length > 15 ) {
			setBudget( valorformat.slice( -15 ) )
		} else {
			setBudget( valorformat )
		}
	}

	const finalizar = async () => {
		toast( {
			title: "Aguarde. Enviando pedido...",
			status: "info",
			isClosable: true,
			position: 'bottom',
		} )
		setload( true )
		const [ pedidos ] = Data.attributes.pedidos.data
		const nPedido = pedidos?.attributes.nPedido
		const EmpresaId = Data.attributes.empresa.data.id
		const valor = pedidos?.attributes.totalGeral
		const vendedor = String( session?.user.name )
		const vendedorId = String( session?.user.id )
		const IdNegocio = Data.id

		const respPedido = await pedido( nPedido, EmpresaId, valor, vendedor, vendedorId, IdNegocio )

		const { title } = respPedido

		const description = <Box>
			<p>{ respPedido.description }</p>
			{ respPedido.fields?.length &&
				<ol>
					{ respPedido.fields.map( ( field: any, index: number ) => (
						<li key={ index } >{ field }</li>
					) ) }
				</ol>
			}
		</Box>

		const status = respPedido.status === "error" ? "error" : (
			respPedido.status === "success" ? "success" : "warning"
		)

		toast( {
			title,
			description,
			status,
			isClosable: true,
			duration: 30000,
			position: "bottom",
		} )

		onClose()
		setload( false )
		props.onchat( true )
	}

	function getStatus ( statusinf: SetStateAction<any> ) {
		setStatus( parseInt( statusinf ) )
	}

	return (
		<>
			<Flex>
				<Flex gap={ 8 } w={ "85%" } flexWrap={ "wrap" }>
					<Flex alignItems={ "center" }>
						<BtmRetorno Url="/negocios" />
					</Flex>
					<Flex alignItems={ "center" }>
						<Heading size={ "xs" }>{ props.title }</Heading>
					</Flex>
					{ Bpedido && Etapa === 6 ? null : (
						<>
							<Box>
								<FormLabel
									fontSize="xs"
									fontWeight="md"
								>
									Data de retorno
								</FormLabel>
								<Input
									shadow="sm"
									size="sm"
									w="full"
									type={ "date" }
									fontSize="xs"
									rounded="md"
									onChange={ ( e ) => setDataRetorno( e.target.value ) }
									value={ DataRetorno }
								/>
							</Box>
							<Box>
								<FormLabel
									fontSize="xs"
									fontWeight="md"
								>
									Orçamento estimado
								</FormLabel>
								<Input
									shadow="sm"
									size="sm"
									w="full"
									fontSize="xs"
									rounded="md"

									onChange={ masckValor }
									value={ Budget }
								/>
							</Box>
							<Box>
								<FormLabel
									fontSize="xs"
									fontWeight="md"
								>
									Etapa do Negócio
								</FormLabel>
								<Select
									shadow="sm"
									size="sm"
									w="full"
									fontSize="xs"
									rounded="md"
									onChange={ ( e ) => setEtapa( parseInt( e.target.value ) ) }
									value={ Etapa }
								>
									<option style={ { backgroundColor: "#1A202C" } }></option>
									{ EtapasNegocio.map( ( i: any ) => (
										<option style={ { backgroundColor: "#1A202C" } } key={ i.id } value={ i.id }>
											{ i.title }
										</option>
									) ) }
								</Select>
							</Box>
							{ Etapa === 6 && (
								<>
									<Box>
										<BtnStatus Resp={ props.Status } onAddResp={ getStatus } omPedidos={ Data.attributes.pedidos.data } />
									</Box>
								</>
							) }
							<Box hidden={ Status == 1 ? false : true }>
								<FormLabel
									fontSize="xs"
									fontWeight="md"
								>
									Motivo de Perda
								</FormLabel>
								<Select
									shadow="sm"
									size="sm"
									w="full"
									fontSize="xs"
									rounded="md"
									onChange={ ( e ) => setMperca( e.target.value ) }
									value={ Mperca }
								>
									<option style={ { backgroundColor: "#1A202C" } }></option>
									{ StatusPerca.map( ( i: any ) => (
										<option style={ { backgroundColor: "#1A202C" } } key={ i.id } value={ i.id }>
											{ i.title }
										</option>
									) ) }
								</Select>
							</Box>
						</>
					) }
				</Flex>

				<Flex alignItems={ "center" } flexWrap={ 'wrap' } gap={ 3 } w={ "25%" }>

					{ Blocksave ? null : (
						<>
							<Button colorScheme={ "whatsapp" } onClick={ Salve }>
								Salvar
							</Button>
						</>
					) }
					{ Bpedido && Etapa === 6 || Blocksave ? null : (
						<>
							<Button
								colorScheme={ "green" }
								onClick={ async () => {
									if ( NPedido && DataItens.length > 0 ) {
										router.push( "/propostas/update/" + ID )
									} else {
										if ( PropostaId ) {
											await axios.delete( `/api/db/proposta/delete/${ PropostaId }` )
												.then( ( response: any ) => {
													router.push( `/propostas/create/${ ID }` )
												} )
												.catch( ( error: any ) => {
													console.error( error )
												} )
										} else {
											router.push( `/propostas/create/${ ID }` )
										}
									}
								} }
							>
								Proposta
							</Button>

						</>
					) }
					{ NPedido && !Bpedido && Status === 5 && Etapa === 6 ? (
						<>
							<Button
								colorScheme={ "whatsapp" }
								variant={ 'solid' }
								onClick={ () => {

									window.open(
										`/api/db/proposta/pdf/${ NPedido }`,
										"_blank"
									)
								} }
							>
								PDF
							</Button>

						</>
					) : null }

					{ NPedido && !Bpedido && Status === 3 && Etapa !== 6 ? (
						<>
							<Button
								colorScheme={ "teal" }
								variant={ 'solid' }
								onClick={ () => window.open(
									`/api/db/proposta/pdf/${ NPedido }`,
									"_blank"
								) }
							>
								PDF
							</Button>
						</>
					) : null }
					{ Bpedido && Status === 5 && Etapa === 6 ? (
						<>
							<Button
								colorScheme={ "teal" }
								variant={ 'solid' }
								onClick={ () => window.open(
									`/api/db/proposta/pdf/${ NPedido }`,
									"_blank"
								) }
							>
								PDF
							</Button>
						</>
					) : null }
					{ NPedido && Status === 1 && Etapa === 6 ? (
						<>

							<Button variant={ 'outline' } colorScheme={ "whatsapp" } onClick={ Salve }>
								Atualizar
							</Button>

							<Button
								colorScheme={ "red" }
								variant={ 'outline' }
								onClick={ () => window.open(
									`/api/db/proposta/pdf/${ NPedido }`,
									"_blank"
								) }
							>
								PDF
							</Button>

						</>
					) : null }
					{ session?.user.pemission === 'Adm' && (
						<>
							<Button isDisabled={ !NPedido } colorScheme={ "linkedin" } onClick={ () => onOpen() }>
								Reenviar Pedido
							</Button>
							<Button
								colorScheme={ "red" }
								onClick={ async () => {
									props.onLoad( true )
									await axios( '/api/db/business/delete/' + ID )
										.then( () => {
											toast( {
												title: 'Negocio foi Deletado',
												status: 'info',
												duration: 3000,
												isClosable: true,
											} )
											router.push( "/negocios" )
										} )
										.catch( ( err: any ) => {
											console.error( err )
										} )
								} }
							>
								Excluir
							</Button>
						</>
					) }
				</Flex>
				<Modal isCentered closeOnOverlayClick={ false } isOpen={ isOpen } onClose={ onClose }>
					<ModalOverlay
						bg='blackAlpha.300'
						backdropFilter='blur(10px) hue-rotate(90deg)'
					/>
					<ModalContent bg={ 'gray.600' }>
						<ModalHeader>Negócio Concluido</ModalHeader>
						{/* <ModalCloseButton /> */ }
						<ModalBody>
							<Text>Para finalizar é necessário gerar um pedido para produção!</Text>
						</ModalBody>
						<ModalFooter>
							<Button
								fontSize={ '0.8rem' }
								p={ 3 }
								colorScheme={ "messenger" }
								isDisabled={ load }
								onClick={ finalizar }
							>
								Gerar Pedido
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			</Flex >
		</>
	)
}
