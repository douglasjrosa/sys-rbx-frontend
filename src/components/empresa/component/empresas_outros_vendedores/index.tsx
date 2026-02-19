import {
	Box,
	Flex,
	HStack,
	Text,
	Skeleton,
	Table,
	Thead,
	Tbody,
	Tr,
	Th,
	Td,
	TableContainer,
	Button,
} from "@chakra-ui/react"
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaInfoCircle } from "react-icons/fa"
import { memo, useMemo } from "react"
import { formatCNAE } from "@/function/Mask/cnae"

type EmpresaData = {
	id: string
	attributes: {
		nome?: string
		CNAE?: string
		expiresIn?: string | null
		cidade?: string
		vendedor?: string
	}
}

type CarteiraOutrosVendedoresProps = {
	filtro: EmpresaData[]
	isLoading: boolean
	paginaAtual: number
	totalPaginas: number
	onChangePagina: ( pagina: number ) => void
	/** When true, user has not searched yet - show hint to use search field */
	hasSearched?: boolean
}

const formatDate = ( dateString?: string | null ): string => {
	if ( !dateString || dateString === "-" ) return "-"
	try {
		if ( typeof dateString === "string" && dateString.includes( "/" ) ) {
			return dateString
		}
		const date = new Date( dateString )
		if ( isNaN( date.getTime() ) ) return dateString
		return new Intl.DateTimeFormat( "pt-BR" ).format( date )
	} catch {
		return dateString || "-"
	}
}

export const CarteiraOutrosVendedores = memo( ( {
	filtro,
	isLoading,
	paginaAtual,
	totalPaginas,
	onChangePagina,
	hasSearched = true,
}: CarteiraOutrosVendedoresProps ) => {
	const tabelaContent = useMemo( () => {
		if ( isLoading ) {
			return Array.from( { length: 10 } ).map( ( _, index ) => (
				<Tr key={ `skeleton-${ index }` }>
					<Td><Skeleton height="20px" width="80%" /></Td>
					<Td><Skeleton height="20px" width="80px" mx="auto" /></Td>
					<Td><Skeleton height="20px" width="90px" mx="auto" /></Td>
					<Td><Skeleton height="20px" width="100px" mx="auto" /></Td>
					<Td><Skeleton height="20px" width="80px" mx="auto" /></Td>
				</Tr>
			) )
		}

		if ( !filtro || filtro.length === 0 ) {
			const emptyMessage = hasSearched
				? "Nenhuma empresa de outros vendedores encontrada"
				: "Digite no campo de pesquisa para buscar empresas de outros vendedores"
			return (
				<Tr>
					<Td colSpan={ 5 } textAlign="center" py={ 10 } color="gray.500">
						<Flex direction="column" align="center" gap={ 2 }>
							<FaInfoCircle size={ 24 } />
							<Text>{ emptyMessage }</Text>
						</Flex>
					</Td>
				</Tr>
			)
		}

		return filtro.map( ( empresa ) => {
			const attrs = empresa.attributes || {}
			return (
				<Tr
					key={ empresa.id }
					_hover={ { bg: "whiteAlpha.50" } }
					cursor="default"
				>
					<Td>
						<Text fontSize="sm" noOfLines={ 1 }>
							{ attrs.nome || "-" }
						</Text>
					</Td>
					<Td>
						<Text fontSize="sm" noOfLines={ 1 }>
							{ formatCNAE( attrs.CNAE || "" ) || "-" }
						</Text>
					</Td>
					<Td>
						<Text fontSize="sm" noOfLines={ 1 }>
							{ formatDate( attrs.expiresIn ) }
						</Text>
					</Td>
					<Td>
						<Text fontSize="sm" noOfLines={ 1 }>
							{ attrs.cidade || "-" }
						</Text>
					</Td>
					<Td>
						<Text fontSize="sm" noOfLines={ 1 }>
							{ attrs.vendedor || "-" }
						</Text>
					</Td>
				</Tr>
			)
		} )
	}, [ filtro, isLoading, hasSearched ] )

	return (
		<Box w="100%">
			<TableContainer>
				<Table variant="simple" size="sm">
					<Thead>
						<Tr>
							<Th color="gray.400">Nome</Th>
							<Th color="gray.400">CNAE</Th>
							<Th color="gray.400">Data de expiração</Th>
							<Th color="gray.400">Cidade</Th>
							<Th color="gray.400">Vendedor</Th>
						</Tr>
					</Thead>
					<Tbody>{ tabelaContent }</Tbody>
				</Table>
			</TableContainer>
			{ totalPaginas > 1 && (
				<Flex justifyContent="flex-end" mt={ 4 }>
					<HStack spacing={ 2 }>
						<Button
							size="xs"
							bg="#2b6cb0"
							color="white"
							_hover={ { bg: "#2c5282" } }
							onClick={ () => onChangePagina( Math.max( 1, paginaAtual - 1 ) ) }
							isDisabled={ paginaAtual === 1 || isLoading }
						>
							<FaAngleDoubleLeft />
						</Button>
						<Text fontSize="xs">Página { paginaAtual } de { totalPaginas }</Text>
						<Button
							size="xs"
							bg="#2b6cb0"
							color="white"
							_hover={ { bg: "#2c5282" } }
							onClick={ () => onChangePagina( Math.min( totalPaginas, paginaAtual + 1 ) ) }
							isDisabled={ paginaAtual === totalPaginas || isLoading }
						>
							<FaAngleDoubleRight />
						</Button>
					</HStack>
				</Flex>
			) }
		</Box>
	)
} )
