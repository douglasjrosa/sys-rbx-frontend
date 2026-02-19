/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Flex, IconButton, Modal, ModalContent, ModalOverlay, useDisclosure, useToast } from "@chakra-ui/react"
import axios from "axios"
import { FaComments, FaTimes } from "react-icons/fa"
import { useRouter } from "next/router"
import React, { useEffect, useRef, useState } from "react"
import Loading from "../../components/elements/loading"
import { Z_INDEX } from "@/utils/zIndex"
import { BodyChat } from "../../components/negocios/component/bodychat"
import { NegocioFooter } from "../../components/negocios/component/footer"
import { NegocioHeader } from "../../components/negocios/component/hearder"
import { formatCompanyDisplayName } from "@/utils/formatCompanyName"

export default function CreateNegocio () {
	const router = useRouter()
	const id: any = router.query.id
	const toast = useToast()
	const divRef = useRef<HTMLDivElement>( null )
	const modalChatRef = useRef<HTMLDivElement>( null )
	const [ msg, setMsg ] = useState( [] )
	const [ msg2, setMsg2 ] = useState( false )
	const [ loadingGeral, setLoadingGeral ] = useState( true )
	const [ loading, setLoading ] = useState( false )
	const [ nBusiness, setnBusiness ] = useState( "" )
	const [ Approach, setApproach ] = useState( "" )
	const [ Budget, setBudget ] = useState( "" )
	const [ Status, setStatus ] = useState( "" )
	const [ Deadline, setDeadline ] = useState( "" )
	const [ DataRetorno, setDataRetorno ] = useState( "" )
	const [ Nome, setNome ] = useState( "" )
	const [ Historia, setHistoria ] = useState( [] )
	const [ ChatHistory, setChatHistory ] = useState( [] )
	const [ Etapa, setEtapa ] = useState<any | null>()
	const [ Mperca, setMperca ] = useState<any | null>()
	const [ Data, setData ] = useState<any | null>()
	const { isOpen: isChatOpen, onOpen: onChatOpen, onClose: onChatClose } = useDisclosure()

	useEffect( () => {
		const target = isChatOpen ? modalChatRef.current : divRef.current
		if ( target ) {
			setTimeout( () => {
				target.scrollTop = target.scrollHeight
			}, 0 )
		}
	}, [ divRef, modalChatRef, msg, isChatOpen, ChatHistory ] )


	useEffect( () => {
		( async () => {
			localStorage.setItem( 'id', id )
			const url = "/api/db/business/get/id/" + id
			//cunsulta informações gerais do cliente
			await axios( {
				method: "GET",
				url: url,
			} )
				.then( ( res ) => {

					setData( res.data )
					setnBusiness( res.data.attributes.nBusiness )
					setApproach( res.data.attributes.Approach )
					setBudget( res.data.attributes.Budget )
					setStatus( res.data.attributes.andamento )
					setDeadline( res.data.attributes.deadline )
					setDataRetorno( res.data.attributes.DataRetorno )
					setHistoria( res.data.attributes.history )
					setChatHistory( res.data.attributes.incidentRecord )
					setEtapa( res.data.attributes.etapa )
					setMperca( res.data.attributes.Mperca )
					setNome( res.data.attributes.empresa.data.attributes.nome )

					setLoadingGeral( false )
				} )
				.catch( ( err ) => {
					console.error( err )
					toast( {
						title: "Ops",
						description: "erro ao recuperar as informações",
						status: "error",
						duration: 9000,
						isClosable: true,
					} )

					setLoadingGeral( false )
				} )
		} )()
	}, [] )

	useEffect( () => {
		if ( msg ) {
			( async () => {
				setLoading( true )
				const url = "/api/db/business/get/id/" + id
				//cunsulta informações gerais do cliente
				await axios( {
					method: "GET",
					url: url,
				} )
					.then( ( res ) => {

						setChatHistory( res.data.attributes.incidentRecord )

						setLoading( false )
					} )
					.catch( ( err ) => {
						console.error( err )
						toast( {
							title: "Ops",
							description: "erro ao recuperar as informações",
							status: "error",
							duration: 9000,
							isClosable: true,
						} )

						setLoading( false )
					} )
			} )()
		}
	}, [ msg ] )
	useEffect( () => {
		if ( msg2 ) {
			( async () => {
				setLoading( true )
				const url = "/api/db/business/get/id/" + id
				//cunsulta informações gerais do cliente
				await axios( {
					method: "GET",
					url: url,
				} )
					.then( ( res ) => {

						setChatHistory( res.data.attributes.incidentRecord )

						setLoading( false )
						setMsg2( false )
					} )
					.catch( ( err ) => {
						console.error( err )
						toast( {
							title: "Ops",
							description: "erro ao recuperar as informações",
							status: "error",
							duration: 9000,
							isClosable: true,
						} )

						setLoading( false )
						setMsg2( false )
					} )
			} )()
		}
	}, [ msg2 ] )

	function getMsg ( menssage: React.SetStateAction<any> ) {
		setMsg( menssage )
	}
	function onOptimisticUpdate ( record: any[] ) {
		setChatHistory( record )
	}
	function chatRelaod ( menssage: React.SetStateAction<any> ) {
		setLoadingGeral( true )
		setMsg2( menssage );
		( async () => {
			localStorage.setItem( 'id', id )
			const url = "/api/db/business/get/id/" + id
			//cunsulta informações gerais do cliente
			await axios( {
				method: "GET",
				url: url,
			} )
				.then( ( res ) => {
					setData( res.data )
					setnBusiness( res.data.attributes.nBusiness )
					setApproach( res.data.attributes.Approach )
					setBudget( res.data.attributes.Budget )
					setStatus( res.data.attributes.andamento )
					setDeadline( res.data.attributes.deadline )
					setDataRetorno( res.data.attributes.DataRetorno )
					setHistoria( res.data.attributes.history )
					setChatHistory( res.data.attributes.incidentRecord )
					setEtapa( res.data.attributes.etapa )
					setMperca( res.data.attributes.Mperca )
					setNome( res.data.attributes.name )

					setLoadingGeral( false )
				} )
				.catch( ( err ) => {
					console.error( err )
					toast( {
						title: "Ops",
						description: "erro ao recuperar as informações",
						status: "error",
						duration: 9000,
						isClosable: true,
					} )

					setLoadingGeral( false )
				} )
		} )()
	}
	function getLoad ( lading: React.SetStateAction<any> ) {
		setLoadingGeral( lading )
	}

	if ( loadingGeral ) {
		return (
			<Box w={ '100%' } h={ '100%' }>
				<Loading size="200px">Carregando...</Loading>
			</Box>
		)
	}

	const displayCompanyName = formatCompanyDisplayName( Nome )

	const ChatContent = () => (
		<Box
			flex={1}
			bg="#1a1f2e"
			display="flex"
			flexDirection="column"
			h="full"
			minH={0}
		>
			<Box flex={1} p={4} pb="100px">
				<BodyChat conteudo={ ChatHistory } loading={ loading } />
			</Box>
			<Box
				position="fixed"
				bottom={0}
				left={0}
				right={0}
				zIndex={20}
				bg="gray.800"
				borderTop="1px solid"
				borderColor="gray.600"
				p="20px"
			>
				<NegocioFooter data={ ChatHistory } onGetValue={ getMsg } onOptimisticUpdate={ onOptimisticUpdate } />
			</Box>
		</Box>
	)

	const mobileChatButton = (
		<IconButton
			aria-label="Chat"
			icon={<FaComments size={24} />}
			colorScheme="blue"
			size="lg"
			rounded="full"
			display={{ base: "flex", lg: "none" }}
			onClick={isChatOpen ? onChatClose : onChatOpen}
		/>
	)

	return (
		<>
			{/* Mobile: full-screen chat modal - must stay below navbar layer */}
			<Modal isOpen={isChatOpen} onClose={onChatClose} size="full">
				<ModalOverlay
					bg="blackAlpha.700"
					zIndex={Z_INDEX.PAGE_MODAL}
					sx={{
						"@media (max-width: 991px)": {
							top: "60px",
							height: "calc(100vh - 60px)",
						},
					}}
				/>
				<ModalContent
					bg="gray.800"
					maxW="100vw"
					m={0}
					zIndex={Z_INDEX.PAGE_MODAL}
					sx={{
						"@media (max-width: 991px)": {
							top: "60px",
							height: "calc(100vh - 60px)",
							maxH: "calc(100vh - 60px)",
						},
					}}
				>
					<Flex ref={ modalChatRef } h="full" flexDirection="column" p={4} position="relative" minH={0} overflowY="auto">
						<IconButton
							aria-label="Fechar chat"
							icon={<FaTimes size={20} />}
							position="fixed"
							top="80px"
							right="12px"
							zIndex={25}
							size="sm"
							variant="solid"
							bg="red.500"
							color="white"
							rounded="md"
							_hover={{ bg: "red.600" }}
							onClick={onChatClose}
						/>
						<ChatContent />
					</Flex>
				</ModalContent>
			</Modal>
			<Flex
				w="100%"
				h={{ base: "auto", lg: "100vh" }}
				overflowY={{ base: "visible", lg: "hidden" }}
				flexDirection={{ base: "column", lg: "row" }}
				bg="gray.800"
				color="white"
			>
				{/* Left column: chat-style card - hidden on mobile */}
				<Flex
					flex={{ base: 0, lg: 1 }}
					flexDirection="column"
					minH={{ base: 0, lg: 0 }}
					flexShrink={0}
					bg="gray.800"
					display={{ base: "none", lg: "flex" }}
				>
					<Box
						flex={1}
						ref={ divRef }
						overflowY="auto"
						bg="#1a1f2e"
						m={4}
						rounded="xl"
						shadow="xl"
						border="1px solid"
						borderColor="gray.600"
						display="flex"
						flexDirection="column"
					>
						<Box flex={1} overflowY="auto" p={4}>
							<BodyChat conteudo={ ChatHistory } loading={ loading } />
						</Box>
<Box
						borderTop="1px solid"
						borderColor="gray.600"
						bg="gray.800"
						roundedBottom="xl"
						flexShrink={0}
						p={{ lg: "15px" }}
					>
						<NegocioFooter data={ ChatHistory } onGetValue={ getMsg } onOptimisticUpdate={ onOptimisticUpdate } />
					</Box>
					</Box>
				</Flex>
				{/* Right column: fields and buttons card */}
				<Box
					w={{ base: "100%", lg: "420px" }}
					minW={{ lg: "420px" }}
					p={5}
					pb={{ base: 10, lg: 5 }}
					bg="gray.600"
					borderLeft={{ lg: "1px solid" }}
					borderColor={{ lg: "gray.600" }}
					overflowY={{ base: "visible", lg: "auto" }}
					display="flex"
					flexDirection="column"
					minH={{ base: 0, lg: "100%" }}
					flexShrink={0}
				>
					<NegocioHeader
						title={ displayCompanyName }
						mobileChatButton={ mobileChatButton }
						nBusiness={ nBusiness }
						Approach={ Approach }
						Budget={ Budget }
						Status={ Status }
						Deadline={ Deadline }
						historia={ Historia }
						DataRetorno={ DataRetorno }
						Mperca={ Mperca }
						etapa={ Etapa }
						onLoad={ getLoad }
						chat={ ChatHistory }
						onchat={ chatRelaod }
						onData={ Data }
						compact
					/>
				</Box>
			</Flex>
		</>
	)
}
