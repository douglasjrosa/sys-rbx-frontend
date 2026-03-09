import {
	Box,
	Flex,
	Heading,
	IconButton,
	Link,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	useToast,
} from "@chakra-ui/react"
import axios from "axios"
import { useEffect, useState } from "react"
import { FaFilePdf, FaRegTrashCan } from "react-icons/fa6"

const formatValue = ( n: number ) =>
	new Intl.NumberFormat( "pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 } ).format( n )
const formatPercent = ( n: number ) => `${ n.toFixed( 1 ) }%`

const MONTH_SHORT = [ "", "JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ" ]
const formatPeriod = ( mes: number, ano: number ) => `${ MONTH_SHORT[ mes ] || String( mes ) }-${ ano }`

function getCommissionamentoStr ( calc: any ): string {
	if ( !calc ) return "-"
	const baseRatePctNum = calc.vendas ? ( calc.comissaoBase / calc.vendas ) * 100 : 1
	const baseRatePctStr = baseRatePctNum.toFixed( 1 )
	const multiplicador = calc.multiplicador ?? 0
	const multiplicadorPct = Math.round( multiplicador * 100 )
	const effectivePct = ( baseRatePctNum * multiplicador ).toFixed( 2 ).replace( ".", "," )
	return `${ multiplicadorPct }% de ${ baseRatePctStr }% = ${ effectivePct }%`
}

const isMonthBeforeCurrent = ( ano: number, mes: number ): boolean => {
	const now = new Date()
	const currentYear = now.getFullYear()
	const currentMonth = now.getMonth() + 1
	return ano < currentYear || ( ano === currentYear && mes < currentMonth )
}

export const TabelaComissao = ( props: { id: any; update: any; isAdmin?: boolean } ) => {
	const { id: IDVendedor, update, isAdmin = false } = props
	const [ configs, setConfigs ] = useState<any[]>( [] )
	const [ calculated, setCalculated ] = useState<Record<string, any>>( {} )
	const toast = useToast()

	useEffect( () => {
		if ( !IDVendedor ) return
		( async () => {
			try {
				const res = await axios.get( `/api/db/config-comissao/get?userId=${ IDVendedor }` )
				const list = Array.isArray( res.data ) ? res.data : []
				setConfigs( list )
			} catch ( err ) {
				setConfigs( [] )
			}
		} )()
	}, [ IDVendedor, props.update ] )

	useEffect( () => {
		if ( !IDVendedor || configs.length === 0 ) return
		const fetchAll = async () => {
			const out: Record<string, any> = {}
			for ( const c of configs ) {
				const mes = c.attributes?.mes
				const ano = c.attributes?.ano
				if ( !mes || !ano ) continue
				try {
					const r = await axios.get(
						`/api/db/commission/calculate?vendedorId=${ IDVendedor }&mes=${ mes }&ano=${ ano }`
					)
					out[ `${ ano }-${ mes }` ] = r.data
				} catch ( err ) {
					out[ `${ ano }-${ mes }` ] = null
				}
			}
			setCalculated( out )
		}
		fetchAll()
	}, [ IDVendedor, configs ] )

	const handleDelete = async ( configId: number ) => {
		try {
			await axios.delete( `/api/db/config-comissao/delete/${ configId }` )
			toast( { title: "Configuração removida", status: "success", duration: 3000, isClosable: true } )
			setConfigs( ( prev ) => prev.filter( ( x ) => x.id !== configId ) )
			setCalculated( ( prev ) => {
				const next = { ...prev }
				const c = configs.find( ( x ) => x.id === configId )
				if ( c ) delete next[ `${ c.attributes.ano }-${ c.attributes.mes }` ]
				return next
			} )
		} catch ( err: any ) {
			toast( {
				title: "Erro ao remover",
				description: err.response?.data?.message,
				status: "error",
				duration: 5000,
				isClosable: true,
			} )
		}
	}

	return (
		<Flex w="100%" flexDir="column" p={ 5 }>
			<Box w="100%" mb={ 4 }>
				<Heading size="md" color="gray.200" fontWeight="semibold">
					Histórico de comissões
				</Heading>
			</Box>
			<TableContainer overflowY="auto">
				<Table size="sm" variant="unstyled">
					<Thead bg="whiteAlpha.80" h={ 10 }>
						<Tr>
							<Th color="gray.300" textAlign="center" fontWeight="medium" fontSize="xs">
								Período
							</Th>
							<Th color="gray.300" textAlign="center" fontWeight="medium" fontSize="xs">
								Meta
							</Th>
							<Th color="gray.300" textAlign="center" fontWeight="medium" fontSize="xs">
								Fixo
							</Th>
							<Th color="gray.300" textAlign="center" fontWeight="medium" fontSize="xs">
								Vendas
							</Th>
							<Th color="gray.300" textAlign="center" fontWeight="medium" fontSize="xs">
								Atingimento
							</Th>
							<Th color="gray.300" textAlign="center" fontWeight="medium" fontSize="xs">
								Comissionamento
							</Th>
							<Th color="gray.300" textAlign="center" fontWeight="medium" fontSize="xs">
								Comissão
							</Th>
							<Th color="gray.300" textAlign="center" fontWeight="medium" fontSize="xs">
								Deduções
							</Th>
							<Th color="gray.300" textAlign="center" fontWeight="medium" fontSize="xs">
								Total
							</Th>
							<Th color="gray.300" textAlign="right" fontWeight="medium" fontSize="xs">
								Ações
							</Th>
						</Tr>
					</Thead>
					<Tbody>
						{ [ ...configs ]
							.sort( ( a, b ) => {
								const anoA = parseInt( String( a.attributes?.ano ), 10 ) || 0
								const anoB = parseInt( String( b.attributes?.ano ), 10 ) || 0
								if ( anoB !== anoA ) return anoB - anoA
								const mesA = parseInt( String( a.attributes?.mes ), 10 ) || 0
								const mesB = parseInt( String( b.attributes?.mes ), 10 ) || 0
								return mesB - mesA
							} )
							.map( ( item ) => {
							const key = `${ item.attributes?.ano }-${ item.attributes?.mes }`
							const calc = calculated[ key ]
							const itemMes = parseInt( String( item.attributes?.mes ), 10 )
							const itemAno = parseInt( String( item.attributes?.ano ), 10 )
							const showPdf = isMonthBeforeCurrent( itemAno, itemMes )
							return (
								<Tr key={ item.id } borderBottom="1px" borderColor="whiteAlpha.60">
									<Td color="gray.300" textAlign="center">
										{ formatPeriod( itemMes, itemAno ) }
									</Td>
									<Td color="gray.300" textAlign="center">
										{ formatValue( parseFloat( item.attributes?.meta ) || 0 ) }
									</Td>
									<Td color="gray.300" textAlign="center">
										{ formatValue( parseFloat( item.attributes?.salario_fixo ) || 0 ) }
									</Td>
									<Td color="gray.300" textAlign="center">
										{ calc ? formatValue( calc.vendas ) : "-" }
									</Td>
									<Td color="gray.300" textAlign="center">
										{ calc ? formatPercent( calc.atingimentoPercent ) : "-" }
									</Td>
									<Td color="gray.300" textAlign="center">
										{ getCommissionamentoStr( calc ) }
									</Td>
									<Td color="gray.300" textAlign="center">
										{ calc ? formatValue( calc.comissaoFinal ) : "-" }
									</Td>
									<Td color="gray.300" textAlign="center">
										{ calc && calc.deductionsTotal != null
											? formatValue( calc.deductionsTotal )
											: "-" }
									</Td>
									<Td color="gray.300" textAlign="center">
										{ calc ? formatValue( calc.salarioTotal ) : "-" }
									</Td>
									<Td textAlign="right">
										<Flex gap={ 1 } alignItems="center" justifyContent="flex-end">
											{ showPdf && (
												<Link
													href={ `/api/db/commission/pdf?vendedorId=${ IDVendedor }&mes=${ item.attributes?.mes }&ano=${ item.attributes?.ano }` }
													target="_blank"
													rel="noopener noreferrer"
												>
													<IconButton
														aria-label="Relatório PDF"
														icon={ <FaFilePdf /> }
														size="xs"
														bg="blue.500"
														color="white"
														_hover={{ bg: "blue.600" }}
													/>
												</Link>
											) }
											{ isAdmin && (
												<IconButton
													colorScheme="red"
													size="xs"
													icon={ <FaRegTrashCan /> }
													aria-label="Excluir"
													onClick={ () => handleDelete( item.id ) }
												/>
											) }
										</Flex>
									</Td>
								</Tr>
							)
						} ) }
					</Tbody>
				</Table>
			</TableContainer>
			{ configs.length === 0 && (
				<Box py={ 6 } color="gray.400" fontSize="sm">
					Nenhuma configuração de comissão. Adicione uma acima.
				</Box>
			) }
		</Flex>
	)
}
