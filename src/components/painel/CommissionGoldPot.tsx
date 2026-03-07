import { Box, Flex, FormLabel, Text } from "@chakra-ui/react"

const MILESTONES = [ 50, 71, 86, 100 ]
const POT_HEIGHT = 120
const POT_WIDTH = 64

const formatCurrency = ( n: number ) =>
	new Intl.NumberFormat( "pt-BR", { style: "currency", currency: "BRL" } ).format( n )

export const CommissionGoldPot = ( props: {
	commissionData: {
		atingimentoPercent?: number
		salarioTotal?: number
	} | null
} ) => {
	const { commissionData } = props
	const percent = commissionData
		? Math.min( 100, Math.max( 0, commissionData.atingimentoPercent ?? 0 ) )
		: 0
	const fillHeight = ( percent / 100 ) * POT_HEIGHT

	return (
		<Box
			bg="gray.700"
			rounded="lg"
			px={4}
			py={4}
			borderLeft="4px solid"
			borderColor={
				percent >= 100 ? "green.500" : percent >= 71 ? "blue.500" : "orange.500"
			}
			boxShadow="md"
			w={{ base: "100%", sm: "auto" }}
			minW="fit-content"
		>
			<Flex
				flexDirection="column"
				alignItems={{ base: "center", lg: "flex-end" }}
			>
					<FormLabel
					textAlign={{ base: "center", lg: "right" }}
					color="white"
					mb={ 1 }
					fontSize="sm"
				>
						Comissão
				</FormLabel>
				<Flex
					alignItems="flex-end"
					gap={ 3 }
					justifyContent={{ base: "center", lg: "flex-end" }}
				>
				<Box
					position="relative"
					w={ `${ POT_WIDTH }px` }
					h={ `${ POT_HEIGHT }px` }
					flexShrink={ 0 }
				>
					<Box
						position="absolute"
						inset={ 0 }
						borderRadius="12px 12px 32px 32px"
						border="3px solid"
						borderColor="yellow.600"
						bg="gray.800"
						overflow="hidden"
						boxShadow="inset 0 -4px 8px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.3)"
					>
						<Box
							position="absolute"
							bottom={ 0 }
							left={ 2 }
							right={ 2 }
							h={ `${ Math.max( 4, fillHeight ) }px` }
							bgGradient="linear(to-t, yellow.600, yellow.400)"
							borderRadius="0 0 24px 24px"
							transition="height 0.4s ease"
							boxShadow="inset 0 0 12px rgba(255,215,0,0.4)"
						/>
					</Box>
					{ MILESTONES.map( ( m ) => (
						<Box
							key={ m }
							position="absolute"
							left={ 0 }
							right={ 0 }
							bottom={ `${ ( m / 100 ) * POT_HEIGHT }px` }
							h="1px"
							bg="white"
							opacity={ 0.7 }
							transform="translateY(50%)"
							zIndex={ 1 }
						/>
					) ) }
					{ percent > 0 && percent < 100 && (
						<Box
							position="absolute"
							left={ 0 }
							right={ 0 }
							bottom={ `${ fillHeight }px` }
							h="3px"
							bg="white"
							transform="translateY(50%)"
							zIndex={ 2 }
							boxShadow="0 0 4px rgba(255,255,255,0.8)"
						/>
					) }
				</Box>
				<Flex
					flexDirection="column"
					alignItems={{ base: "center", lg: "flex-end" }}
					justifyContent="center"
					py={ 2 }
					minH={ POT_HEIGHT }
				>
					<Text fontSize="xs" color="gray.400" mb={ 1 }>
						Valor final
					</Text>
					<Text
						fontSize="xl"
						fontWeight="bold"
						color={
							percent >= 100
								? "green.400"
								: percent >= 71
									? "blue.300"
									: "yellow.400"
						}
					>
						{ commissionData
							? formatCurrency( commissionData.salarioTotal ?? 0 )
							: "-" }
					</Text>
				</Flex>
			</Flex>
			</Flex>
		</Box>
	)
}
