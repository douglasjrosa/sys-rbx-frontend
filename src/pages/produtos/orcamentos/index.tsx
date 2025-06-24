import { Box, Button, Heading, Table, Thead, Tbody, Tr, Th, Td, useToast } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import axios, { AxiosError } from 'axios'
import Link from 'next/link'

interface Orcamento {
	id: number
	attributes: {
		numero: string
		data: string
		valor: number
		status: string
		empresa: {
			data: {
				attributes: {
					nome: string
				}
			}
		}
	}
}

function Orcamentos () {
	const [ orcamentos, setOrcamentos ] = useState<Orcamento[]>( [] )
	const [ loading, setLoading ] = useState( true )
	const toast = useToast()

	useEffect( () => {
		fetchOrcamentos()
	}, [] )

	const fetchOrcamentos = async () => {
		try {
			setLoading( true )
			const response = await axios.get( '/api/rbx/douglasjrosa@gmail.com/produtos?CNPJ=08044106000107' )
			console.log( { response } )
			setOrcamentos( response.data.data || [] )
		} catch ( error ) {
			console.error( 'Erro ao buscar orçamentos:', error )
			const axiosError = error as AxiosError
			if ( axiosError.response?.status === 401 ) {
				window.location.href = '/api/auth/signin'
			} else {
				toast( {
					title: 'Erro ao carregar orçamentos',
					description: 'Não foi possível carregar a lista de orçamentos.',
					status: 'error',
					duration: 5000,
					isClosable: true,
				} )
			}
		} finally {
			setLoading( false )
		}
	}

	const formatDate = ( dateString: string ) => {
		const date = new Date( dateString )
		return new Intl.DateTimeFormat( 'pt-BR' ).format( date )
	}

	const formatCurrency = ( value: number ) => {
		return new Intl.NumberFormat( 'pt-BR', {
			style: 'currency',
			currency: 'BRL'
		} ).format( value )
	}

	const getStatusColor = ( status: string ) => {
		switch ( status.toLowerCase() ) {
			case 'aprovado':
				return 'green.500'
			case 'pendente':
				return 'yellow.500'
			case 'recusado':
				return 'red.500'
			default:
				return 'gray.500'
		}
	}

	return (
		<Box
			display="flex"
			flexDirection="column"
			gap={ 4 }
			p={ 10 }
		>
			<Box display="flex" justifyContent="space-between" alignItems="center" mb={ 4 }>
				<Heading size="lg">Orçamentos</Heading>
				<Link href="/produtos" passHref legacyBehavior>
					<Button
						size="sm"
						colorScheme="blue"
						bg="blue.700"
						_hover={ { bg: 'blue.800' } }
					>
						Voltar para Produtos
					</Button>
				</Link>
			</Box>

			{ loading ? (
				<Box textAlign="center" py={ 10 }>Carregando orçamentos...</Box>
			) : orcamentos.length === 0 ? (
				<Box textAlign="center" py={ 10 }>Nenhum orçamento encontrado.</Box>
			) : (
				<Table variant="simple" size="sm">
					<Thead>
						<Tr>
							<Th>Número</Th>
							<Th>Empresa</Th>
							<Th>Data</Th>
							<Th isNumeric>Valor</Th>
							<Th>Status</Th>
							<Th>Ações</Th>
						</Tr>
					</Thead>
					<Tbody>
						{ orcamentos.map( ( orcamento ) => (
							<Tr key={ orcamento.id }>
								<Td>{ orcamento.attributes.numero }</Td>
								<Td>{ orcamento.attributes.empresa.data.attributes.nome }</Td>
								<Td>{ formatDate( orcamento.attributes.data ) }</Td>
								<Td isNumeric>{ formatCurrency( orcamento.attributes.valor ) }</Td>
								<Td>
									<Box
										as="span"
										px={ 2 }
										py={ 1 }
										borderRadius="md"
										color="white"
										bg={ getStatusColor( orcamento.attributes.status ) }
									>
										{ orcamento.attributes.status }
									</Box>
								</Td>
								<Td>
									<Button
										size="xs"
										colorScheme="blue"
										mr={ 2 }
										onClick={ () => {
											// Implementar visualização detalhada
											console.log( `Ver orçamento ${ orcamento.id }` )
										} }
									>
										Ver
									</Button>
									<Button
										size="xs"
										colorScheme="green"
										onClick={ () => {
											// Implementar edição
											console.log( `Editar orçamento ${ orcamento.id }` )
										} }
									>
										Editar
									</Button>
								</Td>
							</Tr>
						) ) }
					</Tbody>
				</Table>
			) }
		</Box>
	)
}

export default Orcamentos

