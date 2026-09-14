import {
	buildOrderContext,
	runIntegrationsParallel,
} from "@/function/orderIntegration"
import {
	Button,
	Flex,
	IconButton,
	Modal,
	Text,
	ModalBody,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	useToast,
} from "@chakra-ui/react"
import { useRouter } from "next/router"
import { useCallback, useState } from "react"
import { FaTimes } from "react-icons/fa"

const WEEKDAYS_PT = [
	"Domingo",
	"Segunda-feira",
	"Terça-feira",
	"Quarta-feira",
	"Quinta-feira",
	"Sexta-feira",
	"Sábado",
]

const formatDeliveryDateDisplay = (dateStr: string) => {
	if (!dateStr) return ""
	const datePart = dateStr.split("T")[0]
	const [year, month, day] = datePart.split("-").map(Number)
	if (!year || !month || !day) return dateStr
	const date = new Date(year, month - 1, day)
	const weekday = WEEKDAYS_PT[date.getDay()]
	const formatted =
		`${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`
	return `${weekday} dia ${formatted}`
}

const SendOrderModal = (props: {
	isOpen: boolean
	onClose: () => void
	onchat: (value: boolean) => void
	orderData: {
		propostaId?: string | number
		orderValue?: string
		vendedor?: string
		vendedorId?: string
		businessId?: string | number
	}
	deliveryDate?: string
	saveBusiness?: () => Promise<void>
	businessId?: string
}) => {
	const {
		isOpen,
		onClose,
		onchat,
		orderData,
		deliveryDate = "",
		saveBusiness,
		businessId,
	} = props

	const router = useRouter()
	const toast = useToast()
	const [load, setload] = useState<boolean>(false)

	const runParallelIntegrations = useCallback(async (): Promise<boolean> => {
		const { propostaId, orderValue, vendedor, vendedorId, businessId } =
			orderData

		if (!propostaId || !businessId) {
			toast({
				title: "Erro",
				description:
					"Dados incompletos. Verifique se o negócio possui uma proposta.",
				status: "error",
				isClosable: true,
				duration: 5000,
				position: "bottom",
			})
			return false
		}

		toast({
			title: "Enviando dados do pedido.",
			status: "info",
			isClosable: true,
			duration: 4000,
			position: "bottom",
		})

		const ctx = await buildOrderContext({
			propostaId: String(propostaId),
			businessId: String(businessId),
			orderValue: String(orderValue ?? ""),
			vendedor: String(vendedor ?? ""),
			vendedorId: String(vendedorId ?? ""),
		})

		if (!ctx) {
			toast({
				title: "Erro ao carregar pedido",
				description: "Não foi possível obter os dados da proposta.",
				status: "error",
				isClosable: true,
				duration: 5000,
				position: "bottom",
			})
			return false
		}

		const { ok } = await runIntegrationsParallel(
			ctx,
			["bling", "trello", "pixtrela", "strapi"],
			{
				onBling: (result) => {
					toast({
						title: result.message,
						description: result.description,
						status: result.ok ? "success" : "error",
						isClosable: true,
						duration: result.ok ? 8000 : 30000,
						position: "bottom",
					})
				},
				onTrello: (result) => {
					toast({
						title: result.message,
						description: result.description,
						status: result.ok ? "success" : "error",
						isClosable: true,
						duration: result.ok ? 8000 : 30000,
						position: "bottom",
					})
				},
				onPixtrelaItem: (item) => {
					toast({
						title: `PIXTRELA: item ${item.itemIndex + 1}`,
						description: item.summary,
						status: item.ok ? "success" : "error",
						isClosable: true,
						duration: item.ok ? 60000 : 30000,
						position: "bottom",
					})
				},
				onStrapi: (result) => {
					toast({
						title: result.message,
						description: result.description,
						status: result.ok ? "success" : "error",
						isClosable: true,
						duration: result.ok ? 8000 : 30000,
						position: "bottom",
					})
				},
			},
		)

		return ok
	}, [orderData, toast])

	const handleConfirm = useCallback(async () => {
		setload(true)
		onchat(false)
		try {
			const orderOk = await runParallelIntegrations()
			if (!orderOk) {
				toast({
					title: "Negócio não foi concluído",
					description:
						"O pedido não foi integrado por completo. " +
						"Corrija os problemas indicados e tente novamente.",
					status: "error",
					isClosable: true,
					duration: 30000,
					position: "bottom",
				})
				return
			}
			if (saveBusiness) {
				await saveBusiness()
			}
			toast({
				title: "Tudo certo!",
				description: "Pedido enviado e negócio concluído com sucesso.",
				status: "success",
				isClosable: true,
				duration: 5000,
				position: "bottom",
			})
			onClose()
		} catch (error) {
			const description =
				error instanceof Error ? error.message : "Erro inesperado. Tente novamente."
			toast({
				title: "Erro ao confirmar pedido",
				description,
				status: "error",
				duration: 30000,
				isClosable: true,
				position: "bottom",
			})
		} finally {
			setload(false)
			onchat(true)
		}
	}, [runParallelIntegrations, saveBusiness, toast, onClose, onchat])

	const handleAlter = useCallback(() => {
		onClose()
		if (businessId) {
			router.push(`/negocios/proposta/${businessId}`)
		}
	}, [onClose, businessId, router])

	return (
		<Modal
			isCentered
			closeOnOverlayClick={false}
			isOpen={isOpen}
			onClose={onClose}
		>
			<ModalOverlay
				bg="blackAlpha.300"
				backdropFilter="blur(10px) hue-rotate(90deg)"
			/>
			<ModalContent bg="gray.600" position="relative">
				<IconButton
					aria-label="Fechar"
					icon={<FaTimes size={20} />}
					position="absolute"
					top="8px"
					right="8px"
					zIndex={1}
					size="sm"
					variant="solid"
					bg="red.500"
					color="white"
					rounded="md"
					_hover={{ bg: "red.600" }}
					onClick={onClose}
				/>
				<ModalHeader pt="55px" textAlign="center">
					CONFIRME A DATA DE ENTREGA
				</ModalHeader>
				<ModalBody pb={6} textAlign="center">
					<Text fontSize="md" mb={2}>
						Este pedido será programado para entrega em:
					</Text>
					<Text
						fontSize="2xl"
						fontWeight="bold"
						color="orange.300"
						mb={6}
					>
						{formatDeliveryDateDisplay(deliveryDate)}
					</Text>
					<Flex gap={3} justify="center">
						<Button
							flex={1}
							colorScheme="blue"
							onClick={handleAlter}
							isDisabled={load}
						>
							Alterar
						</Button>
						<Button
							flex={1}
							colorScheme="green"
							onClick={handleConfirm}
							isDisabled={load}
							isLoading={load}
						>
							Confirmar
						</Button>
					</Flex>
				</ModalBody>
			</ModalContent>
		</Modal>
	)
}

export default SendOrderModal
