import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, useToast, Flex, Badge, Text, Spinner, HStack } from '@chakra-ui/react'
import { useEffect, useState, useCallback } from 'react'
import axios, { AxiosError } from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FaArrowLeft, FaEye, FaEdit } from 'react-icons/fa'

interface Orcamento {
	id: number
	numero: string
	data: string
	vTotal: number
	situacao: string
	cliente: string
}

function Orcamentos () {
	const router = useRouter()
	const { cnpj, email } = router.query
	const [ orcamentos, setOrcamentos ] = useState<Orcamento[]>( [] )
	const [ loading, setLoading ] = useState( false )
	const toast = useToast()

	const fetchOrcamentos = useCallback( async () => {
		if ( !cnpj || !email ) return

		try {
			setLoading( true )
			// Note: The external API might have a different structure for budgets. 
			// Based on products proxy, let's call the budget endpoint if exists, 
			// or use the products one if it returns budgets.
			// Assuming '/pedidos' is the correct endpoint based on common naming.
			const response = await axios.get( `/api/rbx/${ email }/pedidos?CNPJ=${ cnpj }` )
			setOrcamentos( response.data || [] )
		} catch ( error ) {
			console.error( 'Erro ao buscar orçamentos:', error )
			toast( {
				title: 'Erro ao carregar orçamentos',
				description: 'Não foi possível carregar a lista de orçamentos.',
				status: 'error',
				duration: 5000,
				isClosable: true,
			} )
		} finally {
			setLoading( false )
		}
	}, [ cnpj, email, toast ] )

	useEffect( () => {
		if ( router.isReady ) {
			fetchOrcamentos()
		}
	}, [ router.isReady, fetchOrcamentos ] )

	const formatDate = ( dateString: string ) => {
		if ( !dateString ) return '-'
		const date = new Date( dateString )
		return new Intl.DateTimeFormat( 'pt-BR' ).format( date )
	}

	const formatCurrency = ( value: number ) => {
		return new Intl.NumberFormat( 'pt-BR', {
			style: 'currency',
			currency: 'BRL'
		} ).format( value || 0 )
	}

	const getStatusColor = ( status: string ) => {
		if ( !status ) return 'gray'
		const s = status.toLowerCase()
		if ( s.includes( 'aprovado' ) || s.includes( 'ganho' ) ) return 'green'
		if ( s.includes( 'pendente' ) || s.includes( 'aberto' ) ) return 'yellow'
		if ( s.includes( 'recusado' ) || s.includes( 'cancelado' ) || s.includes( 'perdido' ) ) return 'red'
		return 'blue'
	}

	return (
		<Box display="flex" flexDirection="column" gap={ 6 } p={ 10 } bg="gray.800" minH="100vh" color="white">
			<Flex justifyContent="space-between" alignItems="center" borderBottom="1px" borderColor="gray.700" pb={ 4 }>
				<HStack spacing={ 4 }>
					<Button
						onClick={ () => router.back() }
						leftIcon={ <FaArrowLeft /> }
						variant="ghost"
						colorScheme="blue"
						size="sm"
					>
						Voltar
					</Button>
					<Heading size="lg">Histórico de Orçamentos</Heading>
					<Link href={{
						pathname: '/produtos/novo',
						query: { cnpj, email }
					}} passHref>
						<Button leftIcon={<FaEdit />} colorScheme="green" size="sm">
							Novo Produto
						</Button>
					</Link>
				</HStack>

				{ cnpj && (
					<Badge colorScheme="blue" fontSize="md" p={ 2 } borderRadius="md">
						CNPJ: { cnpj }
					</Badge>
				) }
			</Flex>

			{ loading ? (
				<Flex justify="center" py={ 20 }>
					<Spinner size="xl" />
				</Flex>
			) : orcamentos.length === 0 ? (
				<Box textAlign="center" py={ 20 } bg="gray.700" borderRadius="xl">
					<Text fontSize="lg" color="gray.400">Nenhum orçamento encontrado para este cliente.</Text>
				</Box>
			) : (
				<Box bg="gray.700" p={ 6 } borderRadius="xl" shadow="2xl" overflowX="auto">
					<Table variant="simple" size="sm">
						<Thead>
							<Tr>
								<Th color="gray.400">Número</Th>
								<Th color="gray.400">Data</Th>
								<Th color="gray.400">Cliente</Th>
								<Th color="gray.400" isNumeric>Valor Total</Th>
								<Th color="gray.400" textAlign="center">Situação</Th>
								<Th color="gray.400" textAlign="right">Ações</Th>
							</Tr>
						</Thead>
						<Tbody>
							{ orcamentos.map( ( orcamento, index ) => (
								<Tr key={ index } _hover={ { bg: 'gray.600' } } transition="0.2s">
									<Td fontWeight="bold" color="blue.300">#{ orcamento.numero }</Td>
									<Td>{ formatDate( orcamento.data ) }</Td>
									<Td>
										<Text isTruncated maxW="200px">{ orcamento.cliente }</Text>
									</Td>
									<Td isNumeric fontWeight="bold" color="green.300">
										{ formatCurrency( orcamento.vTotal ) }
									</Td>
									<Td textAlign="center">
										<Badge
											colorScheme={ getStatusColor( orcamento.situacao ) }
											variant="solid"
											borderRadius="full"
											px={ 3 }
										>
											{ orcamento.situacao }
										</Badge>
									</Td>
									<Td textAlign="right">
										<HStack spacing={ 2 } justify="flex-end">
											<Button
												size="xs"
												leftIcon={ <FaEye /> }
												colorScheme="blue"
												variant="ghost"
												onClick={ () => {
													toast( { title: 'Em breve', description: 'Visualização detalhada em desenvolvimento.', status: 'info' } )
												} }
											>
												Ver
											</Button>
											<Button
												size="xs"
												leftIcon={ <FaEdit /> }
												colorScheme="green"
												variant="ghost"
												onClick={ () => {
													toast( { title: 'Em breve', description: 'Edição em desenvolvimento.', status: 'info' } )
												} }
											>
												Editar
											</Button>
										</HStack>
									</Td>
								</Tr>
							) ) }
						</Tbody>
					</Table>
				</Box>
			) }
		</Box>
	)
}

export default Orcamentos

