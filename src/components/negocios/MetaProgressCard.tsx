import { generateCurrentAndPast12Months } from "@/function/dateselect"
import {
	Box,
	Button,
	Flex,
	FormLabel,
	Link,
	Menu,
	MenuButton,
	MenuItem,
	MenuList,
	Text,
} from "@chakra-ui/react"
import { ChevronDownIcon } from "@chakra-ui/icons"
import axios from "axios"
import { useEffect, useState } from "react"
import NextLink from "next/link"
import { DEFAULT_MILESTONES, getMilestonePercentages } from "@/utils/commissionCalculator"

const POT_HEIGHT = 120
const POT_WIDTH = 64

const formatCurrency = ( n: number ) =>
	new Intl.NumberFormat( "pt-BR", { style: "currency", currency: "BRL" } ).format( n )

export const MetaProgressCard = ( props: {
	vendedor: string
	mes: number
	ano: number
	onMonthChange: ( item: { month: number; year: number } ) => void
} ) => {
	const [ data, setData ] = useState<any>( null )
	const [ loading, setLoading ] = useState( true )
	const [ monthList, setMonthList ] = useState<any[]>( [] )
	const [ selectedItem, setSelectedItem ] = useState<any>( null )

	useEffect( () => {
		setMonthList( generateCurrentAndPast12Months() )
	}, [] )

	useEffect( () => {
		const match = monthList.find(
			( m ) => m.month === props.mes && m.year === props.ano
		)
		setSelectedItem( match || monthList[ 0 ] )
	}, [ monthList, props.mes, props.ano ] )

	useEffect( () => {
		if ( !props.vendedor ) {
			setLoading( false )
			setData( null )
			return
		}
		setLoading( true )
		axios
			.get(
				`/api/db/commission/calculate?username=${ encodeURIComponent( props.vendedor ) }&mes=${ props.mes }&ano=${ props.ano }`
			)
			.then( ( r ) => {
				setData( r.data )
			} )
			.catch( ( err ) => {
				if ( err.response?.status === 404 && err.response?.data?.hasConfig === false ) {
					setData( { hasConfig: false } )
				} else {
					setData( null )
				}
			} )
			.finally( () => setLoading( false ) )
	}, [ props.vendedor, props.mes, props.ano ] )

	const handleSelect = ( item: { month: number; year: number } ) => {
		props.onMonthChange( item )
	}

	if ( !props.vendedor ) return null

	if ( loading ) {
		return (
			<Box
				w="100%"
				py={ 4 }
				px={ 4 }
				bg="gray.700"
				rounded="lg"
				mb={ 4 }
			>
				<Text color="gray.400">Carregando...</Text>
			</Box>
		)
	}

	if ( data?.hasConfig === false || ( data?.message && !data.vendas && data.meta === undefined ) ) {
		return (
			<Box
				w="100%"
				py={ 4 }
				px={ 4 }
				bg="gray.700"
				rounded="lg"
				mb={ 4 }
			>
				<Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={ 2 }>
					<Text color="gray.400">
						Configure sua meta em{" "}
						<Link as={ NextLink } href="/vendedor" color="blue.400">
							Vendedores
						</Link>
					</Text>
					<Flex gap={ 2 } alignItems="center">
						<FormLabel fontSize="xs" color="white" mb={ 0 }>Mês</FormLabel>
						<Menu matchWidth>
							<MenuButton
								as={ Button }
								rightIcon={ <ChevronDownIcon /> }
								size="sm"
								bg="gray.600"
								color="white"
							>
								{ selectedItem?.name ?? "..." }
							</MenuButton>
							<MenuList bg="gray.700">
								{ monthList.map( ( i ) => (
									<MenuItem
										key={ i.id }
										onClick={ () => handleSelect( { month: i.month, year: i.year } ) }
										bg="transparent"
										color="white"
									>
										{ i.name }
									</MenuItem>
								) ) }
							</MenuList>
						</Menu>
					</Flex>
				</Flex>
			</Box>
		)
	}

	const { atingimentoPercent, salarioTotal, milestones: dataMilestones } = data || {}
	const percent = Math.max( 0, atingimentoPercent || 0 )
	const milestones = dataMilestones?.length
		? dataMilestones
		: getMilestonePercentages( DEFAULT_MILESTONES )
	const maxPercent = Math.max( 100, ...milestones )
	const fillDisplayPercent = Math.min( percent, maxPercent )
	const fillHeight = ( fillDisplayPercent / maxPercent ) * POT_HEIGHT
	const secondTier = milestones[ 1 ] ?? 70
	const hundredTier = milestones.find( ( m ) => m >= 100 ) ?? 100

	return (
		<Box
			w="100%"
			py={ 4 }
			px={ 4 }
			bg="gray.700"
			rounded="lg"
			mb={ 4 }
			borderLeft="4px solid"
			borderColor={
				percent >= hundredTier ? "green.500" : percent >= secondTier ? "blue.500" : "orange.500"
			}
		>
			<Flex
				justifyContent="space-between"
				alignItems="center"
				flexWrap="wrap"
				gap={ 4 }
				direction={ { base: "column", sm: "row" } }
			>
				<Flex gap={ 2 } alignItems="center" flexShrink={ 0 }>
					<FormLabel fontSize="xs" color="white" mb={ 0 }>
						Mês
					</FormLabel>
					<Menu matchWidth>
						<MenuButton
							as={ Button }
							rightIcon={ <ChevronDownIcon /> }
							size="sm"
							bg="gray.600"
							color="white"
						>
							{ selectedItem?.name ?? "..." }
						</MenuButton>
						<MenuList bg="gray.700">
							{ monthList.map( ( i ) => (
								<MenuItem
									key={ i.id }
									onClick={ () =>
										handleSelect( { month: i.month, year: i.year } )
									}
									bg="transparent"
									color="white"
								>
									{ i.name }
								</MenuItem>
							) ) }
						</MenuList>
					</Menu>
				</Flex>
				<Flex alignItems="flex-end" gap={ 3 } flex={ 1 } justifyContent="flex-end">
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
						{ milestones.map( ( m ) => (
							<Box
								key={ m }
								position="absolute"
								left={ 0 }
								right={ 0 }
								bottom={ `${ ( m / maxPercent ) * POT_HEIGHT }px` }
								h="1px"
								bg="white"
								opacity={ 0.7 }
								transform="translateY(50%)"
								zIndex={ 1 }
							/>
						) ) }
						{ percent > 0 && fillDisplayPercent < maxPercent && (
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
						alignItems="flex-end"
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
								percent >= hundredTier
									? "green.400"
									: percent >= secondTier
										? "blue.300"
										: "yellow.400"
							}
						>
							{ formatCurrency( salarioTotal ?? 0 ) }
						</Text>
					</Flex>
				</Flex>
			</Flex>
		</Box>
	)
}
