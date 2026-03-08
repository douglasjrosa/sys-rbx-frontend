import { Box, Flex, Text } from "@chakra-ui/react"
import { useCallback, useRef, useState } from "react"
import {
	calculateCommission,
	DEFAULT_BASE_RATE,
	DEFAULT_MILESTONES,
	getMilestonePercentages,
} from "@/utils/commissionCalculator"

const POT_WIDTH = 64
const MIN_POT_HEIGHT = 120
const POT_TOP_PERCENT = 200
const GOLD_BOTTOM_PADDING = 8
const LINE_POS_200_PERCENT = 88
const MAX_PERCENT_AT_TOP = 250

const formatCurrency = ( n: number ) =>
	new Intl.NumberFormat( "pt-BR", { style: "currency", currency: "BRL" } ).format( n )

interface HoverState {
	percent: number
	vendas: number
	commission: number
	effectiveCommissionPercent: number
}

export const CommissionGoldPot = ( props: {
	commissionData: {
		atingimentoPercent?: number
		salarioTotal?: number
		vendas?: number
		meta?: number
		salarioFixo?: number
		comissaoBase?: number
		deductionsTotal?: number
		milestones?: number[]
		milestoneDetails?: { targetPercent: number; comissionPercent: number }[]
	} | null
} ) => {
	const { commissionData } = props
	const potRef = useRef<HTMLDivElement>( null )
	const [ hover, setHover ] = useState<HoverState | null>( null )

	const percent = commissionData
		? Math.max( 0, commissionData.atingimentoPercent ?? 0 )
		: 0
	const milestones = commissionData?.milestones?.length
		? commissionData.milestones
		: getMilestonePercentages( DEFAULT_MILESTONES )
	const meta = commissionData?.meta ?? 0
	const salarioFixo = commissionData?.salarioFixo ?? 0
	const deductionsTotal = commissionData?.deductionsTotal ?? 0
	const milestoneDetails = commissionData?.milestoneDetails ?? DEFAULT_MILESTONES
	const vendasForRate = commissionData?.vendas ?? 0
	const baseRate =
		vendasForRate > 0 && commissionData?.comissaoBase != null
			? commissionData.comissaoBase / vendasForRate
			: DEFAULT_BASE_RATE

	const isHovering = hover !== null
	const displayPercent = isHovering
		? hover.percent
		: Math.min( percent, MAX_PERCENT_AT_TOP )
	let linePosForBar: number
	if ( displayPercent >= POT_TOP_PERCENT ) {
		linePosForBar =
			LINE_POS_200_PERCENT +
			( ( displayPercent - POT_TOP_PERCENT ) /
				( MAX_PERCENT_AT_TOP - POT_TOP_PERCENT ) ) *
				( 100 - LINE_POS_200_PERCENT )
	} else if ( displayPercent >= 100 ) {
		linePosForBar = 50 + ( ( displayPercent - 100 ) / 100 ) * ( LINE_POS_200_PERCENT - 50 )
	} else {
		linePosForBar = ( displayPercent / 100 ) * 50
	}
	const displayCommission = isHovering ? hover.commission : ( commissionData?.salarioTotal ?? 0 )
	const displayPercentForColor = isHovering ? hover.percent : percent

	const secondTier = milestones[ 1 ] ?? 70
	const hundredTier = milestones.find( ( m ) => m >= 100 ) ?? 100

	const handleMouseMove = useCallback(
		( e: React.MouseEvent<HTMLDivElement> ) => {
			if ( !commissionData || !potRef.current ) return
			const rect = potRef.current.getBoundingClientRect()
			const relY = e.clientY - rect.top
			const potHeight = rect.height
			const percentFromBottom = Math.max( 0, Math.min( 1, relY / potHeight ) )
			const p = percentFromBottom
			const p25 = 0.875
			const p100 = 0.5
			const p200 = 0.12
			let simulatedPercent: number
			if ( p >= p25 ) {
				simulatedPercent = ( ( 1 - p ) / ( 1 - p25 ) ) * 25
			} else if ( p >= p100 ) {
				simulatedPercent = 25 + ( ( p25 - p ) / ( p25 - p100 ) ) * 75
			} else if ( p >= p200 ) {
				simulatedPercent = 100 + ( ( p100 - p ) / ( p100 - p200 ) ) * 100
			} else {
				simulatedPercent = 200 + ( ( p200 - p ) / p200 ) * 50
			}
			const simulatedVendas = meta * ( simulatedPercent / 100 )
			const calc = calculateCommission(
				simulatedVendas,
				meta,
				salarioFixo,
				baseRate,
				milestoneDetails,
				[]
			)
			const simTotal = Math.max(
				0,
				calc.salarioFixo + calc.comissaoFinal - deductionsTotal
			)
			const effectivePct =
				simulatedVendas > 0 ? ( calc.comissaoFinal / simulatedVendas ) * 100 : 0
			const safeEffectivePct = Number.isFinite( effectivePct ) ? effectivePct : 0
			setHover( {
				percent: simulatedPercent,
				vendas: simulatedVendas,
				commission: simTotal,
				effectiveCommissionPercent: safeEffectivePct,
			} )
		},
		[ commissionData, meta, salarioFixo, baseRate, milestoneDetails, deductionsTotal ]
	)

	const handleMouseEnter = useCallback( () => {
		if ( !commissionData ) return
		const p = Math.max( 0, commissionData.atingimentoPercent ?? 0 )
		const v = commissionData.vendas ?? 0
		const c = commissionData.salarioTotal ?? 0
		const comissaoFinal = ( commissionData as any ).comissaoFinal
		const effPct = v > 0 && comissaoFinal != null
			? ( comissaoFinal / v ) * 100 : 0
		const safeEffPct = Number.isFinite( effPct ) ? effPct : 0
		setHover( { percent: p, vendas: v, commission: c, effectiveCommissionPercent: safeEffPct } )
	}, [ commissionData ] )

	const handleMouseLeave = useCallback( () => setHover( null ), [] )

	return (
		<Box
			bg="gray.700"
			rounded="lg"
			px={4}
			py={4}
			borderLeft="4px solid"
			borderColor={
				displayPercentForColor >= hundredTier
					? "green.500"
					: displayPercentForColor >= secondTier
						? "blue.500"
						: "orange.500"
			}
			boxShadow="md"
			w={{ base: "100%", sm: "auto" }}
			minW="fit-content"
			h="100%"
			display="flex"
			flexDir="column"
			position="relative"
			onMouseEnter={ handleMouseEnter }
			onMouseMove={ handleMouseMove }
			onMouseLeave={ handleMouseLeave }
			cursor={ commissionData ? "crosshair" : "default" }
		>
			{ hover && (
				<Box
					position="absolute"
					right="100%"
					top="50%"
					transform="translateY(-50%)"
					mr={3}
					zIndex={ 10 }
					bg="gray.700"
					color="white"
					rounded="md"
					px={3}
					py={2}
					boxShadow="lg"
					borderWidth="1px"
					borderColor="whiteAlpha.200"
					pointerEvents="none"
					w="200px"
				>
					<Flex flexDirection="column" gap={ 0 }>
						<Text fontSize="xs" color="gray.400">Ao vender</Text>
						<Text fontSize="sm" fontWeight="semibold">{ formatCurrency( hover.vendas ) }</Text>
						<Box h={ 2 } />
						<Flex color="gray.400" alignItems="baseline">
							<Text fontSize="xs">Você atinge</Text>
							<Text fontSize="sm" mx={1} fontWeight="semibold">{ hover.percent.toFixed( 1 ) }%</Text>
							<Text fontSize="xs">da meta.</Text>
						</Flex>
						<Box h={ 2 } />
						<Flex color="gray.400" alignItems="baseline">
							<Text fontSize="xs">E ganha</Text>
							<Text fontSize="sm" mx={1} fontWeight="semibold">{ hover.effectiveCommissionPercent.toFixed( 2 ) }%</Text>
						</Flex>
						<Text fontSize="xs" color="gray.400">de comissão sobre o total vendido.</Text>
					</Flex>
				</Box>
			) }
			<Flex
				flexDirection="column"
				alignItems="center"
				flex={1}
				minH={0}
				gap={0}
			>
				<Box
					ref={ potRef }
					position="relative"
					w={`${POT_WIDTH}px`}
					h="100%"
					minH={`${MIN_POT_HEIGHT}px`}
					flex={1}
					flexShrink={0}
				>
						<Box
							position="absolute"
							inset={0}
							borderRadius="12px 12px 32px 32px"
							border="3px solid transparent"
							overflow="hidden"
							sx={{
								background: `
									linear-gradient(#1a202c, #1a202c) padding-box,
									linear-gradient(180deg, #93c5fd 0%, #60a5fa 25%, #3b82f6 50%, #2563eb 75%, #1d4ed8 100%) border-box
								`,
								boxShadow:
									"inset 0 -4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(147,197,253,0.4), 0 2px 8px rgba(59,130,246,0.25)",
							}}
						>
							{ displayPercent > 0 && (
							<Box
								position="absolute"
								bottom={2}
								left={2}
								right={2}
								h={`max(0px, calc(${linePosForBar}% - ${GOLD_BOTTOM_PADDING}px))`}
								borderRadius="0 0 20px 20px"
								transition="height 0.15s ease-out"
								sx={{
									background: `
										linear-gradient(
											180deg,
											#fef3c7 0%,
											#fde68a 15%,
											#fcd34d 35%,
											#fbbf24 55%,
											#f59e0b 75%,
											#d97706 100%
										)
									`,
									boxShadow: `
										inset 0 2px 8px rgba(255,255,255,0.5),
										inset 0 -2px 4px rgba(0,0,0,0.2),
										inset 0 0 20px rgba(251,191,36,0.4),
										0 0 12px rgba(251,191,36,0.3)
									`,
								}}
							/>
							) }
						</Box>
						{ milestones
							.filter( ( m ) => m <= POT_TOP_PERCENT )
							.map( ( m ) => {
							const isDoubleMeta = m === POT_TOP_PERCENT
							const linePos = isDoubleMeta
								? 88
								: ( m / POT_TOP_PERCENT ) * 100
							return (
								<Box
									key={ m }
									position="absolute"
									left={0}
									right={0}
									bottom={`${linePos}%`}
									h="1px"
									bg="white"
									opacity={0.7}
									transform="translateY(50%)"
									zIndex={1}
								/>
							)
						} ) }
						{ displayPercent > 0 && displayPercent < MAX_PERCENT_AT_TOP && (
							<Box
								position="absolute"
								left={0}
								right={0}
								bottom={`${linePosForBar}%`}
								h="3px"
								bg="white"
								transform="translateY(50%)"
								zIndex={3}
								boxShadow="0 0 6px rgba(255,255,255,0.9), 0 0 10px rgba(251,191,36,0.5)"
							/>
						) }
				</Box>
				<Flex
					flexDirection="column"
					alignItems="center"
					py={2}
					flexShrink={0}
				>
					<Text fontSize="xs" color="gray.400" mb={1}>
						A Receber
					</Text>
					<Text
						fontSize="md"
						fontWeight="bold"
						color={
							displayPercentForColor >= hundredTier
								? "green.400"
								: displayPercentForColor >= secondTier
									? "blue.300"
									: "yellow.400"
						}
						transition="color 0.15s ease-out"
					>
						{ commissionData
							? formatCurrency( displayCommission )
							: "-" }
					</Text>
				</Flex>
			</Flex>
		</Box>
	)
}
