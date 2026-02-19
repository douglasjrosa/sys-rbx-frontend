import { Box, Button, Badge, Flex, HStack, Input, Text, Tooltip, Skeleton, Table, Thead, Tbody, Tr, Th, Td, TableContainer } from "@chakra-ui/react"
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaInfoCircle } from "react-icons/fa"
import Link from "next/link"
import { memo, useMemo } from "react"
import { FaMoneyBillAlt } from "react-icons/fa"
import { useRouter } from "next/router"
import { HiChatBubbleLeftRight } from "react-icons/hi2"
import { useSession } from "next-auth/react"
import { parseISO, differenceInDays } from "date-fns"
import { ObjContato } from "@/components/data/objetivo"
import { TipoContato } from "@/components/data/tipo"
import { formatCNAE } from "@/function/Mask/cnae"

type EmpresaData = {
	id: string
	attributes: any
}

type CarteiraAusenteProps = {
	filtro: EmpresaData[]
	isLoading: boolean
	paginaAtual: number
	totalPaginas: number
	onChangePagina: ( pagina: number ) => void
	onFilterByCNAE?: ( cnae: string ) => void
	onFilterByCidade?: ( cidade: string ) => void
}

export const CarteiraAusente = memo( ( {
	filtro,
	isLoading,
	onFilterByCNAE,
	onFilterByCidade
}: CarteiraAusenteProps ) => {
	const { data: session } = useSession()
	const router = useRouter()

	// Função para calcular luminosidade e determinar cor do texto
	const getTextColor = ( bgColor: string ): string => {
		if ( !bgColor ) return 'white'
		if ( bgColor === '#22C55E' || bgColor === '#16a34a' ) return '#FFFFFF'
		if ( bgColor === '#EAB308' || bgColor === 'yellow' || bgColor?.toLowerCase()?.includes( 'yellow' ) ) return '#000000'

		let r: number, g: number, b: number
		if ( bgColor.startsWith( '#' ) ) {
			r = parseInt( bgColor.slice( 1, 3 ), 16 )
			g = parseInt( bgColor.slice( 3, 5 ), 16 )
			b = parseInt( bgColor.slice( 5, 7 ), 16 )
		} else if ( bgColor.startsWith( 'rgb' ) ) {
			const match = bgColor.match( /\d+/g )
			if ( match ) {
				r = parseInt( match[ 0 ] )
				g = parseInt( match[ 1 ] )
				b = parseInt( match[ 2 ] )
			} else return 'white'
		} else return 'white'

		const luminance = ( 0.299 * r + 0.587 * g + 0.114 * b ) / 255
		return luminance > 0.5 ? '#000000' : '#FFFFFF'
	}

	const getBackgroundColor = ( originalColor: string ): string => {
		if ( originalColor === '#22C55E' ) return '#16a34a'
		return originalColor
	}

	const tabelaContent = useMemo( () => {
		if ( isLoading ) {
			return Array.from( { length: 10 } ).map( ( _, index ) => (
				<Tr key={ `skeleton-${ index }` }>
					<Td><Skeleton height="20px" width="80%" /></Td>
					<Td><Skeleton height="20px" width="60px" mx="auto" /></Td>
					<Td><Skeleton height="24px" width="24px" borderRadius="full" mx="auto" /></Td>
					<Td><Skeleton height="24px" width="24px" borderRadius="full" mx="auto" /></Td>
					<Td><Skeleton height="20px" width="80px" mx="auto" /></Td>
					<Td><Skeleton height="20px" width="100px" mx="auto" /></Td>
				</Tr>
			) )
		}

		if ( !filtro || filtro.length === 0 ) {
			return (
				<Tr>
					<Td colSpan={ 6 } textAlign="center" py={ 10 } color="gray.500">
						<Flex direction="column" align="center" gap={ 2 }>
							<FaInfoCircle size={ 24 } />
							<Text>Nenhuma empresa encontrada</Text>
						</Flex>
					</Td>
				</Tr>
			)
		}

		const getField = ( obj: any, field: string ) => {
			if ( !obj ) return undefined
			return obj.attributes ? obj.attributes[ field ] : obj[ field ]
		}

		return filtro.map( ( empresa ) => {
			const negocio = empresa.attributes?.businesses?.data || []
			const interacaoRaw = empresa.attributes?.interacaos?.data || null
			let interacao: any = null
			if ( !interacaoRaw ) interacao = null
			else if ( Array.isArray( interacaoRaw ) ) interacao = interacaoRaw.length === 0 ? null : interacaoRaw
			else interacao = interacaoRaw

			const negociosConcluidos = negocio
				.filter( ( n: any ) => getField( n, 'etapa' ) === 6 )
				.sort( ( a: any, b: any ) => {
					const dataA = getField( a, 'date_conclucao' ) ? new Date( getField( a, 'date_conclucao' ) ).getTime() : 0
					const dataB = getField( b, 'date_conclucao' ) ? new Date( getField( b, 'date_conclucao' ) ).getTime() : 0
					return dataB - dataA
				} )
			const ultimoNegocioConcluido = negociosConcluidos[ 0 ]

			const negociosAtivos = negocio.filter( ( n: any ) =>
				getField( n, 'andamento' ) === 3 &&
				getField( n, 'etapa' ) !== 6 &&
				getField( n, 'vendedor_name' ) === session?.user?.name
			)
			const temNegocioAtivo = negociosAtivos.length > 0
			const primeiroNegocioAtivo = negociosAtivos[ 0 ]

			let corHistorico = '#4A5568'
			let dadosHistorico: any = null

			if ( temNegocioAtivo ) {
				corHistorico = '#EAB308'
				const vObj = primeiroNegocioAtivo?.vendedor || primeiroNegocioAtivo?.attributes?.vendedor
				const vName = vObj?.username || vObj?.data?.attributes?.username || getField( primeiroNegocioAtivo, 'vendedor_name' ) || "Não informado"
				dadosHistorico = { data: getField( primeiroNegocioAtivo, 'deadline' ) || getField( primeiroNegocioAtivo, 'createdAt' ), valor: getField( primeiroNegocioAtivo, 'Budget' ) || null, vendedor: vName }
			} else if ( ultimoNegocioConcluido ) {
				const andamento = getField( ultimoNegocioConcluido, 'andamento' )
				if ( andamento === 5 ) corHistorico = '#16a34a'
				else if ( andamento === 1 ) corHistorico = '#EF4444'

				const pedidos = ultimoNegocioConcluido?.pedidos || ultimoNegocioConcluido?.attributes?.pedidos || []
				const pArray = Array.isArray( pedidos ) ? pedidos : pedidos?.data || []
				const valor = getField( ultimoNegocioConcluido, 'Budget' ) || ( pArray.length > 0 ? ( pArray[ 0 ]?.totalGeral || pArray[ 0 ]?.attributes?.totalGeral ) : null )
				const vObj = ultimoNegocioConcluido?.vendedor || ultimoNegocioConcluido?.attributes?.vendedor
				const vName = vObj?.username || vObj?.data?.attributes?.username || getField( ultimoNegocioConcluido, 'vendedor_name' ) || "Não informado"
				dadosHistorico = { data: getField( ultimoNegocioConcluido, 'date_conclucao' ) || getField( ultimoNegocioConcluido, 'createdAt' ), valor, vendedor: vName }
			}

			let corInteracao = 'rgb(0,100,255)'
			let mostrarIconeInteracao = false
			let dadosInteracao: any = null
			if ( interacao ) {
				if ( Array.isArray( interacao ) && interacao.length > 0 ) {
					mostrarIconeInteracao = true
					const ultima = interacao[ interacao.length - 1 ]
					dadosInteracao = ultima.attributes || ultima
				} else if ( typeof interacao === 'object' && interacao !== null ) {
					mostrarIconeInteracao = true
					corInteracao = interacao.cor || 'rgb(0,100,255)'
					dadosInteracao = interacao.attributes || interacao
				}
			}

			return (
				<Tr key={ empresa.id } _hover={{ bg: 'whiteAlpha.50' }} transition="background 0.2s">
					<Td maxW="200px">
						<Link href={ `/empresas/CNPJ/${ empresa.id }` }>
							<Text color="blue.300" fontWeight="bold" fontSize="xs" isTruncated textTransform="uppercase" _hover={{ textDecoration: 'underline' }}>
								{ empresa.attributes.nome }
							</Text>
						</Link>
					</Td>
					<Td textAlign="center">
						{ empresa.attributes.CNAE && (
							<Badge colorScheme="blue" variant="subtle" cursor="pointer" fontSize="2xs" onClick={ () => onFilterByCNAE?.( empresa.attributes.CNAE ) }>
								{ formatCNAE( empresa.attributes.CNAE ) }
							</Badge>
						) }
					</Td>
					<Td textAlign="center">
						{ dadosHistorico && (
							<Tooltip label={ ( () => {
								const pf = empresa.attributes.purchaseFrequency || null
								const vF = dadosHistorico.valor ? new Intl.NumberFormat( 'pt-BR', { style: 'currency', currency: 'BRL' } ).format( parseFloat( String( dadosHistorico.valor ).replace( /[^\d,-]/g, '' ).replace( ',', '.' ) ) ) : null
								const tC = getTextColor( corHistorico )
								return (
									<Box p={ 1 }>
										<Text fontWeight="bold" color={ tC } fontSize="xs">{ dadosHistorico.vendedor }</Text>
										{ vF && <Text color={ tC } fontSize="sm">{ vF }</Text> }
										<Text color={ tC } fontSize="2xs">{ new Date( dadosHistorico.data ).toLocaleDateString( 'pt-BR' ) }</Text>
										{ pf && <Text color={ tC } fontSize="2xs" mt={ 1 }>Compra { pf }</Text> }
									</Box>
								)
							} )() } bg={ getBackgroundColor( corHistorico ) } hasArrow>
								<Box display="inline-block"><FaMoneyBillAlt color={ getBackgroundColor( corHistorico ) } size={ 20 } /></Box>
							</Tooltip>
						) }
					</Td>
					<Td textAlign="center">
						{ mostrarIconeInteracao && (
							<Tooltip label={ dadosInteracao ? ( () => {
								const obj = ObjContato.find( ( o ) => o.id === dadosInteracao.objetivo?.toString() )?.title || "Sem objetivo"
								const tipo = TipoContato.find( ( t ) => t.id === dadosInteracao.tipo?.toString() )?.title || "Sem tipo"
								const tC = getTextColor( corInteracao )
								return (
									<Box p={ 1 } maxW="250px">
										<Text fontWeight="bold" color={ tC } fontSize="xs">{ obj }</Text>
										<Text color={ tC } fontSize="2xs" opacity={ 0.8 }>{ dadosInteracao.vendedor_name }</Text>
										<Text color={ tC } fontSize="xs" mt={ 1 } noOfLines={ 3 }>{ dadosInteracao.descricao }</Text>
										<Flex justify="space-between" mt={ 2 }>
											<Text color={ tC } fontSize="2xs" fontStyle="italic">{ tipo }</Text>
											{ dadosInteracao.proxima && <Text color={ tC } fontSize="2xs">Próxima: { new Date( dadosInteracao.proxima ).toLocaleDateString( 'pt-BR' ) }</Text> }
										</Flex>
									</Box>
								)
							} )() : "Sem interações" } bg={ corInteracao } hasArrow>
								<Box display="inline-block"><HiChatBubbleLeftRight color={ corInteracao } size={ 20 } /></Box>
							</Tooltip>
						) }
					</Td>
					<Td textAlign="center">
						{ ( () => {
							const expiresIn = empresa.attributes.expiresIn
							if ( !expiresIn ) return "-"
							try {
								const dE = parseISO( expiresIn )
								const dR = differenceInDays( dE, new Date() )
								let color = "gray.300"
								if ( dR < 0 ) color = "whiteAlpha.400"
								else if ( dR <= 5 ) color = "red.400"
								else if ( dR <= 15 ) color = "yellow.400"
								return <Text fontSize="xs" color={ color }>{ dE.toLocaleDateString( 'pt-BR' ) }</Text>
							} catch { return "-" }
						} )() }
					</Td>
					<Td textAlign="center">
						{ empresa.attributes.cidade ? (
							<Badge colorScheme="purple" variant="outline" fontSize="2xs" cursor="pointer" onClick={ () => onFilterByCidade?.( empresa.attributes.cidade ) }>
								{ `${ empresa.attributes.cidade } - ${ empresa.attributes.uf || '' }` }
							</Badge>
						) : '-' }
					</Td>
				</Tr>
			)
		} )
	}, [ filtro, isLoading, session?.user?.name, onFilterByCNAE, onFilterByCidade ] )

	return (
		<TableContainer h={{ base: 'auto', md: '100%' }} overflowY={{ base: 'visible', md: 'auto' }} sx={{
			'&::-webkit-scrollbar': { width: '8px' },
			'&::-webkit-scrollbar-track': { background: 'gray.800' },
			'&::-webkit-scrollbar-thumb': { background: 'gray.700', borderRadius: '4px' },
			'&::-webkit-scrollbar-thumb:hover': { background: 'gray.600' },
		}}>
			<Table variant="simple" size="sm">
				<Thead position="sticky" top={0} bg="gray.800" zIndex={1} boxShadow="0 1px 0 rgba(255,255,255,0.1)">
					<Tr>
						<Th color="gray.400" py={4} w="200px" maxW="200px">Nome</Th>
						<Th color="gray.400" textAlign="center">CNAE</Th>
						<Th color="gray.400" textAlign="center">Histórico</Th>
						<Th color="gray.400" textAlign="center">Interação</Th>
						<Th color="gray.400" textAlign="center">Expiração</Th>
						<Th color="gray.400" textAlign="center">Cidade</Th>
					</Tr>
				</Thead>
				<Tbody>
					{ tabelaContent }
				</Tbody>
			</Table>
		</TableContainer>
	)
} )

CarteiraAusente.displayName = 'CarteiraAusente'
