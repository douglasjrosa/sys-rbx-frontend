import { Flex, IconButton, Tooltip } from "@chakra-ui/react"
import {
	FaPaperPlane,
	FaEye,
	FaHandshake,
	FaFileSignature,
	FaCheckCircle,
} from "react-icons/fa"
import { EtapasNegocio } from "@/components/data/etapa"
import { IconType } from "react-icons"

const ETAPA_ICONS: Record<string, IconType> = {
	"2": FaPaperPlane,
	"3": FaEye,
	"4": FaHandshake,
	"5": FaFileSignature,
	"6": FaCheckCircle,
}

const ETAPA_COLORS: Record<string, string> = {
	"2": "#3B82F6",
	"3": "#A855F7",
	"4": "#F97316",
	"5": "#22C55E",
	"6": "#3B82F6",
}

interface EtapaFunnelProps {
	value: number | string | null
	onChange: ( etapa: number ) => void
}

export const EtapaFunnel = ( { value, onChange }: EtapaFunnelProps ) => {
	const currentId = value != null ? String( value ) : null

	return (
		<Flex gap={2} justifyContent="center" alignItems="center" flexWrap="nowrap">
			{EtapasNegocio.map( ( etapa ) => {
				const Icon = ETAPA_ICONS[etapa.id]
				const isActive = currentId === etapa.id
				const color = ETAPA_COLORS[etapa.id] ?? "gray.400"

				return (
					<Tooltip
						key={etapa.id}
						label={etapa.title}
						placement="top"
						hasArrow
						bg="gray.600"
						color="white"
						py={2}
						px={3}
					>
						<IconButton
							aria-label={etapa.title}
							icon={<Icon size={isActive ? 28 : 22} />}
							size="sm"
							variant="ghost"
							p={2}
							color={isActive ? color : "gray.500"}
							opacity={isActive ? 1 : 0.45}
							filter={isActive ? "none" : "grayscale(1)"}
							_hover={{
								color: color,
								opacity: isActive ? 1 : 0.65,
								filter: "none",
								bg: "gray.600",
							}}
							onClick={() => {
								const id = parseInt( etapa.id, 10 )
								if ( !Number.isNaN( id ) ) {
									onChange( id )
								}
							}}
							cursor="pointer"
						/>
					</Tooltip>
				)
			} )}
		</Flex>
	)
}
