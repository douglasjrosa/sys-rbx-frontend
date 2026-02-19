import { Flex, IconButton, Tooltip } from "@chakra-ui/react"
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"

const GANHO_ID = 5
const PERDIDO_ID = 1

interface StatusIconsProps {
	value: number | string | null
	onChange: ( status: number ) => void
	omPedidos?: any[]
}

export const StatusIcons = ( { value, onChange, omPedidos = [] }: StatusIconsProps ) => {
	const currentStatus = value != null ? parseInt( String( value ), 10 ) : null
	const hasPedidos = Array.isArray( omPedidos ) && omPedidos.length > 0
	const isGanhoDisabled = !hasPedidos

	return (
		<Flex gap={3} justifyContent="center" alignItems="center">
			<Tooltip
				label={isGanhoDisabled ? "Adicione itens à proposta para marcar como Ganho" : "Ganho"}
				placement="top"
				hasArrow
				bg="gray.600"
				color="white"
				py={2}
				px={3}
			>
				<IconButton
					aria-label="Ganho"
					icon={<FaCheckCircle size={26} />}
					size="sm"
					variant="ghost"
					p={2}
					color={currentStatus === GANHO_ID ? "#22C55E" : "gray.500"}
					opacity={currentStatus === GANHO_ID ? 1 : 0.5}
					filter={currentStatus === GANHO_ID ? "none" : "grayscale(1)"}
					_hover={{
						color: currentStatus === GANHO_ID ? "#22C55E" : "#22C55E",
						opacity: isGanhoDisabled ? 0.5 : currentStatus === GANHO_ID ? 1 : 0.7,
						filter: "none",
						bg: "gray.600",
					}}
					onClick={() => !isGanhoDisabled && onChange( GANHO_ID )}
					cursor={isGanhoDisabled ? "not-allowed" : "pointer"}
					isDisabled={isGanhoDisabled}
				/>
			</Tooltip>
			<Tooltip
				label="Perdido"
				placement="top"
				hasArrow
				bg="gray.600"
				color="white"
				py={2}
				px={3}
			>
				<IconButton
					aria-label="Perdido"
					icon={<FaTimesCircle size={26} />}
					size="sm"
					variant="ghost"
					p={2}
					color={currentStatus === PERDIDO_ID ? "#EF4444" : "gray.500"}
					opacity={currentStatus === PERDIDO_ID ? 1 : 0.5}
					filter={currentStatus === PERDIDO_ID ? "none" : "grayscale(1)"}
					_hover={{
						color: "#EF4444",
						opacity: currentStatus === PERDIDO_ID ? 1 : 0.7,
						filter: "none",
						bg: "gray.600",
					}}
					onClick={() => onChange( PERDIDO_ID )}
					cursor="pointer"
				/>
			</Tooltip>
		</Flex>
	)
}
