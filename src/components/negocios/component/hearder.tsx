import {
	Box,
	Button,
	Flex,
	FormLabel,
	Heading,
	Input,
	Select,
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
import formatarDataParaSaoPaulo from "@/function/formatHora"
import SendOrderModal from "./sendOrderModal"
import Link from "next/link"

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

	const { isOpen, onOpen, onClose } = useDisclosure()
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
	const [ Bpedido, setBpedido ] = useState( "" )
	const [ DataRetorno, setDataRetorno ] = useState<any>()
	const [ propostaId, setPropostaId ] = useState( '' )
	const [ DataItens, setDataItens ] = useState<any | null>()
	const [ Blocksave, setBlocksave ] = useState<boolean>( false )

	const [ pedido, setPedido ] = useState<any>( { attributes: {} } )
	const [ orderData, setOrderData ] = useState<any | null>()


	useEffect( () => {
		if ( props.onData ) {
			// #region agent log
			fetch( 'http://127.0.0.1:7244/ingest/9b56e505-01d3-49e7-afde-e83171883b39', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify( { location: 'hearder.tsx:64', message: 'useEffect - setting initial values', data: { propostaIdFromProps: props.onData.attributes.pedidos?.data?.[ 0 ]?.id, DataItensFromProps: props.onData.attributes.pedidos?.data?.[ 0 ]?.attributes.itens?.length, pedidosExists: !!props.onData.attributes.pedidos?.data }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'E' } ) } ).catch( () => { } )
			// #endregion
			setStatus( parseInt( props.Status ) )
			setBudget( SetValue( props.Budget ) )
			setDeadline( props.Deadline ? props.Deadline.substring( 0, 10 ) : '' )
			setBusines( props.nBusiness )
			setApproach( props.Approach )
			setDataRetorno( !props.DataRetorno ? new Date().toISOString() : props.DataRetorno )
			setMperca( props.Mperca )
			setEtapa( parseInt( props.etapa ) )
			props.onLoad( false )
			setPedido( props.onData.attributes.pedidos?.data?.[ 0 ] )
			setBpedido( props.onData.attributes.Bpedido )
			setPropostaId( props.onData.attributes.pedidos?.data?.[ 0 ]?.id )
			setDataItens( props.onData.attributes.pedidos?.data?.[ 0 ]?.attributes.itens )

			if (
				props.nBusiness && parseInt( props.etapa ) === 6
				|| parseInt( props.Status ) === 1
				&& parseInt( props.etapa ) === 6
			) setBlocksave( true )
			if ( session?.user.pemission === 'Adm' ) setBlocksave( false )

			setOrderData( {
				propostaId: props.onData.attributes.pedidos?.data?.[ 0 ]?.id,
				orderValue: props.onData.attributes.pedidos?.data?.[ 0 ]?.attributes?.totalGeral,
				vendedor: String( session?.user.name ),
				vendedorId: String( session?.user.id ),
				businessId: props.onData.id
			} )
		}
	}, [ props, session ] )
	const DataAtual = formatarDataParaSaoPaulo( new Date( Date.now() ) )
	const DataAtualDate = new Date()
	const DataAtualFormatada = DataAtualDate.toLocaleString( 'pt-BR', { timeZone: 'America/Sao_Paulo' } )

	const historicomsg = {
		vendedor: session?.user.name,
		date: DataAtualFormatada,
		msg: `Vendedor(a) ${ session?.user.name }, alterou as informações desse Busines`,
	}

	const filtro = Mperca ? StatusPerca.filter( ( e: any ) => e.id == Mperca ).map( ( i: any ) => i.title ) : []
	const motivoPerda = filtro.length > 0 ? filtro[ 0 ] : 'Não especificado'

	const ChatConcluido = {
		msg: Status === 5 ? `Parabéns, você concluiu esse Negocio com sucesso` : `Negocio perdido, motivo: ${ motivoPerda }`,
		date: DataAtual,
		user: "Sistema",
		susseso: Status === 5 ? 'green' : Status === 1 ? 'red' : '',
		flag: Status === 5 ? "Ganho" : 'Perca'
	}

	const history = [ ...( props.historia || [] ), historicomsg ]

	const Salve = async () => {
		// #region agent log
		fetch( 'http://127.0.0.1:7244/ingest/9b56e505-01d3-49e7-afde-e83171883b39', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify( { location: 'hearder.tsx:119', message: 'Salve function called', data: { Etapa, Status, propostaId, DataItensLength: DataItens?.length, ID }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A,E' } ) } ).catch( () => { } )
		// #endregion

		if ( Etapa === 6 && Status == 3 ) {
			toast( {
				title: "Esse Negócio não pode ser finalizado",
				description: "Ao concluir um Negócio, é obrigatório definir um status",
				status: "warning",
				duration: 9000,
				isClosable: true,
				position: 'top-right'
			} )
		} else if ( !propostaId && Etapa === 6 && Status === 5 && !DataItens?.length ) {
			// #region agent log
			fetch( 'http://127.0.0.1:7244/ingest/9b56e505-01d3-49e7-afde-e83171883b39', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify( { location: 'hearder.tsx:130', message: 'Validation blocked - missing proposta or items', data: { Etapa, Status, propostaId, DataItensLength: DataItens?.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' } ) } ).catch( () => { } )
			// #endregion
			toast( {
				title: "Esse Negócio não pode ser finalizado",
				description: "para finalizar um negócio, a proposta deve ser gerada e autorizada",
				status: "warning",
				duration: 9000,
				isClosable: true,
				position: 'top-right'
			} )
		} else {
			// #region agent log
			fetch( 'http://127.0.0.1:7244/ingest/9b56e505-01d3-49e7-afde-e83171883b39', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify( { location: 'hearder.tsx:139', message: 'Validation passed - preparing data', data: { Etapa, Status, Deadline, Busines, Budget, Approach, Mperca, DataRetorno, historyLength: history.length, chatLength: props.chat?.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' } ) } ).catch( () => { } )
			// #endregion
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
					incidentRecord: [ ...( props.chat || [] ), ChatConcluido ],
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

			// #region agent log
			fetch( 'http://127.0.0.1:7244/ingest/9b56e505-01d3-49e7-afde-e83171883b39', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify( { location: 'hearder.tsx:170', message: 'Before axios PUT request', data: { url: `/api/db/business/put/id/${ ID }`, dataPayload: JSON.stringify( data ), etapa: Etapa }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' } ) } ).catch( () => { } )
			// #endregion

			await axios( {
				url: "/api/db/business/put/id/" + ID,
				method: "PUT",
				data: data,
			} )
				.then( ( res ) => {
					// #region agent log
					fetch( 'http://127.0.0.1:7244/ingest/9b56e505-01d3-49e7-afde-e83171883b39', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify( { location: 'hearder.tsx:177', message: 'PUT request successful', data: { status: res.status, propostaId, Etapa, Status, shouldOpenModal: propostaId && Etapa === 6 && Status === 5 }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C,D' } ) } ).catch( () => { } )
					// #endregion
					if ( propostaId && Etapa === 6 && Status === 5 ) {
						// #region agent log
						fetch( 'http://127.0.0.1:7244/ingest/9b56e505-01d3-49e7-afde-e83171883b39', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify( { location: 'hearder.tsx:179', message: 'Opening modal for order send', data: { propostaId, Etapa, Status }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' } ) } ).catch( () => { } )
						// #endregion
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
					// #region agent log
					fetch( 'http://127.0.0.1:7244/ingest/9b56e505-01d3-49e7-afde-e83171883b39', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify( { location: 'hearder.tsx:202', message: 'PUT request failed', data: { errorMessage: err.message, status: err.response?.status, responseData: err.response?.data, url: err.config?.url }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' } ) } ).catch( () => { } )
					// #endregion
					props.onchat( true )
					console.error( err )
					const errorMessage = err.response?.data?.error?.message || err.response?.data?.mensage || err.message || "Erro ao salvar o negócio"
					const errorDetails = err.response?.data?.detalhe?.errors?.map( ( e: any ) => e.message ).join( ", " ) || err.response?.data?.error?.details?.errors?.map( ( e: any ) => e.message ).join( ", " )

					toast( {
						title: "Erro ao salvar",
						description: errorDetails ? `${ errorMessage }: ${ errorDetails }` : errorMessage,
						status: "error",
						duration: 9000,
						isClosable: true,
						position: 'top-right'
					} )
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
							<Box>
								<FormLabel
									fontSize="xs"
									fontWeight="md"
								>
									Data de Expiração
								</FormLabel>
								<Input
									shadow="sm"
									size="sm"
									w="full"
									type={ "date" }
									fontSize="xs"
									rounded="md"
									onChange={ ( e ) => setDeadline( e.target.value ) }
									value={ Deadline }
								/>
							</Box>
							{ Etapa === 6 && (
								<>
									<Box>
										<BtnStatus Resp={ props.Status } onAddResp={ getStatus } omPedidos={ [ pedido ] } />
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
						<Link href={ `/negocios/proposta/${ ID }` }>
							<Button colorScheme={ "green" } >Proposta</Button>
						</Link>
					) }
					{ propostaId && !Bpedido && Status === 5 && Etapa === 6 ? (
						<>
							<Button
								colorScheme={ "whatsapp" }
								variant={ 'solid' }
								onClick={ () => {

									window.open(
										`/api/db/proposta/pdf/${ propostaId }`,
										"_blank"
									)
								} }
							>
								PDF
							</Button>

						</>
					) : null }

					{ propostaId && !Bpedido && Status === 3 && Etapa !== 6 ? (
						<>
							<Button
								colorScheme={ "teal" }
								variant={ 'solid' }
								onClick={ () => window.open(
									`/api/db/proposta/pdf/${ propostaId }`,
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
									`/api/db/proposta/pdf/${ propostaId }`,
									"_blank"
								) }
							>
								PDF
							</Button>
						</>
					) : null }
					{ propostaId && Status === 1 && Etapa === 6 ? (
						<>

							<Button variant={ 'outline' } colorScheme={ "whatsapp" } onClick={ Salve }>
								Atualizar
							</Button>

							<Button
								colorScheme={ "red" }
								variant={ 'outline' }
								onClick={ () => window.open(
									`/api/db/proposta/pdf/${ propostaId }`,
									"_blank"
								) }
							>
								PDF
							</Button>

						</>
					) : null }
					{ session?.user.pemission === 'Adm' || 1 && (
						<>
							<Button isDisabled={ !propostaId } colorScheme={ "linkedin" } onClick={ () => onOpen() }>
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
				{ orderData && <SendOrderModal
					isOpen={ isOpen }
					onClose={ onClose }
					onchat={ props.onchat }
					orderData={ orderData }
				/> }
			</Flex >
		</>
	)
}
