import { CalendarSkeleton, RenderCalendar } from '@/components/painel/calendario/render'
import { SelectMonth } from '@/components/painel/calendario/select/selectMont'
import { getAllDaysOfMonth } from '@/function/Datearray'
import { Box, Flex, FormLabel, Heading, chakra, Skeleton } from '@chakra-ui/react'
import axios from 'axios'
import { isSameDay, parseISO } from 'date-fns'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { getEffectiveUser } from '@/utils/pseudoUser'
import { formatCompanyDisplayName } from '@/utils/formatCompanyName'

const Painel: React.FC = () => {
	const router = useRouter()
	const { data: session } = useSession()
	const [ date, setDate ] = useState<number>()
	const [ User, setUser ] = useState<string>( '' )
	const [ Andamento, setAndamento ] = useState<string>( '' )
	const [ Perdido, setPerdido ] = useState<string>( '' )
	const [ Concluido, setConcluido ] = useState<string>( '' )
	const [ Mes, setMes ] = useState<any>()
	const [ Year, setYear ] = useState<any>()
	const [ calendar, setCalendar ] = useState<any>( [] )
	const [ data, setData ] = useState<any>( [] )
	const [ isLoading, setIsLoading ] = useState( false )
	const [ calendarData, setCalendarData ] = useState( [] )


	const DateAtual = new Date()

	useEffect(() => {
		if (router.isReady && session?.user) {
			const { mes, ano } = router.query
			if (mes) setMes(parseInt(mes as string))
			else if (!Mes) setMes(DateAtual.getMonth() + 1)
			if (ano) setYear(parseInt(ano as string))
			else if (!Year) setYear(DateAtual.getFullYear())
			setUser(getEffectiveUser(session.user))
		}
	}, [router.isReady, router.query, session?.user])

	useEffect(() => {
		const handler = () => {
			if (session?.user) setUser(getEffectiveUser(session.user))
		}
		window.addEventListener('pseudoUserChange', handler)
		return () => window.removeEventListener('pseudoUserChange', handler)
	}, [session?.user])


	useEffect( () => {
		if ( !session?.user || !Mes || !Year ) return;

		( async () => {
			const daysOfMonth = await getAllDaysOfMonth( Mes, Year )
			setCalendar( daysOfMonth.Dias )

			if ( daysOfMonth.DataInicio && daysOfMonth.DataFim ) {
				setIsLoading( true )
				try {

					const response = await axios.get( `/api/db/business/get/calendar?DataIncicio=${ daysOfMonth.DataInicio }&DataFim=${ daysOfMonth.DataFim }&Vendedor=${ User }` )
					setData( response.data.data )
					setAndamento( response.data.em_aberto )
					setPerdido( response.data.perdido )
					setConcluido( response.data.conclusao )

				} catch ( error ) {
					console.error( error )
				} finally {
					setIsLoading( false )
				}
			}
		} )()
	}, [ Mes, User, Year, date, session?.user ] )


	useEffect( () => {
		if ( data && Array.isArray( data ) ) {
			const diasMesclados = calendar.map( ( dia: any ) => {
				const clientesCorrespondentes = data.filter( ( c: any ) => {
					const dateConclusao = parseISO( c.attributes.date_conclucao )

					if ( isSameDay( dateConclusao, parseISO( dia.date ) ) ) {
						return true
					}

					return false
				} ).map( ( cliente: any ) => {
					return {
						...cliente,
						correspondingDate: parseISO( dia.date )
					}
				} )

				return {
					id: dia.id,
					date: dia.date,
					clientes: clientesCorrespondentes
				}
			} )

			const parts: any = diasMesclados.reduce(
				( accumulator: any, item: any ) => {
					const day = parseInt( item.date.slice( -2 ) )

					if ( day >= 1 && day <= 10 ) {
						accumulator[ 0 ].push( item )
					} else if ( day >= 11 && day <= 20 ) {
						accumulator[ 1 ].push( item )
					} else {
						accumulator[ 2 ].push( item )
					}

					return accumulator
				},
				[ [], [], [] ]
			)

			setCalendarData( parts )
		}
	}, [ calendar, data ] )

	function handleDateChange ( month: any ) {
		router.push({
			pathname: router.pathname,
			query: { ...router.query, mes: month.month, ano: month.year }
		}, undefined, { shallow: true })
	}

	const parseCurrencyToNumber = (value: string) => {
		if (!value) return 0;
		const num = parseFloat(value.replace(/[^0-9,]/g, '').replace(',', '.'));
		return isNaN(num) ? 0 : num;
	}

	const badgeWidth = { base: '100%', sm: '10rem', md: '12rem' }
	const badgeHeight = '40px'

	return (
		<Box minH="100%" bg="gray.800" w="100%">
			<Flex
				px={{ base: 4, md: 6 }}
				pt={4}
				pb={4}
				w="100%"
				maxW="1400px"
				mx="auto"
				flexDirection={{ base: 'column', md: 'row' }}
				justifyContent="space-between"
				alignItems={{ base: 'center', md: 'flex-end' }}
				gap={{ base: 8, md: 0 }}
				flexWrap="wrap"
			>
				<Flex alignItems="flex-end">
					<Heading
						size={{ base: 'lg', md: 'xl' }}
						color="white"
						title={User}
					>
						{ formatCompanyDisplayName( User ) }
					</Heading>
				</Flex>
				<Flex
					display="grid"
					gridTemplateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
					alignItems="flex-end"
					gap={{ base: 4, sm: 5 }}
					w={{ base: '100%', sm: 'auto' }}
					justifyContent="center"
					justifyItems={{ base: 'stretch', sm: 'center', lg: 'center' }}
				>
					<SelectMonth onValue={ handleDateChange } />
					{ isLoading ? (
						<>
							<Flex flexDirection="column" alignItems="center" w={{ base: '100%', sm: 'auto' }}>
								<FormLabel textAlign="center" color="white" mb={1} fontSize="sm">
									Perdidos
								</FormLabel>
								<Skeleton w={badgeWidth} h={badgeHeight} rounded="5px" />
							</Flex>
							<Flex flexDirection="column" alignItems="center" w={{ base: '100%', sm: 'auto' }}>
								<FormLabel textAlign="center" color="white" mb={1} fontSize="sm">
									Em Andamento
								</FormLabel>
								<Skeleton w={badgeWidth} h={badgeHeight} rounded="5px" />
							</Flex>
							<Flex flexDirection="column" alignItems="center" w={{ base: '100%', sm: 'auto' }}>
								<FormLabel textAlign="center" color="white" mb={1} fontSize="sm">
									Ganhos
								</FormLabel>
								<Skeleton w={badgeWidth} h={badgeHeight} rounded="5px" />
							</Flex>
						</>
					) : (
						<>
							{parseCurrencyToNumber(Perdido) > 0 && (
								<Flex flexDirection="column" alignItems="center" w={{ base: '100%', sm: 'auto' }}>
									<FormLabel textAlign="center" color="white" mb={1} fontSize="sm">
										Perdidos
									</FormLabel>
									<Flex
										w={badgeWidth}
										h={badgeHeight}
										bg="red"
										color="white"
										justifyContent="center"
										alignItems="center"
										rounded="5px"
									>
										<chakra.span fontWeight="bold">{ Perdido }</chakra.span>
									</Flex>
								</Flex>
							)}
							{parseCurrencyToNumber(Andamento) > 0 && (
								<Flex flexDirection="column" alignItems="center" w={{ base: '100%', sm: 'auto' }}>
									<FormLabel textAlign="center" color="white" mb={1} fontSize="sm">
										Em Andamento
									</FormLabel>
									<Flex
										w={badgeWidth}
										h={badgeHeight}
										bg="orange.400"
										color="white"
										justifyContent="center"
										alignItems="center"
										rounded="5px"
									>
										<chakra.span fontWeight="bold">{ Andamento }</chakra.span>
									</Flex>
								</Flex>
							)}
							{parseCurrencyToNumber(Concluido) > 0 && (
								<Flex flexDirection="column" alignItems="center" w={{ base: '100%', sm: 'auto' }}>
									<FormLabel textAlign="center" color="white" mb={1} fontSize="sm">
										Ganhos
									</FormLabel>
									<Flex
										w={badgeWidth}
										h={badgeHeight}
										bg="green.500"
										color="white"
										justifyContent="center"
										alignItems="center"
										rounded="5px"
									>
										<chakra.span fontWeight="bold">{ Concluido }</chakra.span>
									</Flex>
								</Flex>
							)}
						</>
					) }
				</Flex>
			</Flex>
			<Box w="100%" maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} pb={6}>
				<Flex direction="column" gap={5} alignItems="center">
					{ isLoading ? (
						<CalendarSkeleton />
					) : (
						<RenderCalendar data={ calendarData } />
					) }
				</Flex>
			</Box>
		</Box>
	)
}

export default Painel