import {
	Box,
	Flex,
	Heading,
	IconButton,
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
import { FaRegTrashCan } from "react-icons/fa6"

const formatCurrency = ( n: number ) =>
	new Intl.NumberFormat( "pt-BR", { style: "currency", currency: "BRL" } ).format( n )
const formatPercent = ( n: number ) => `${ n.toFixed( 1 ) }%`

export const TabelaComissao = ( props: { id: any; update: any } ) => {
	const IDVendedor = props.id
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
		<Flex w="100%" flexDir="column" p={ 3 }>
			<Box w="100%">
				<Heading size="md" mb={ 3 }>Histórico de comissões</Heading>
			</Box>
			<TableContainer overflowY="auto">
				<Table size="sm">
					<Thead bg="#ffffff12" h={ 10 }>
						<Tr>
							<Th color="white">Ano</Th>
							<Th color="white">Mês</Th>
							<Th color="white">Meta</Th>
							<Th color="white">Sal. Fixo</Th>
							<Th color="white">Vendas</Th>
							<Th color="white">Atingimento</Th>
							<Th color="white">Comissão</Th>
							<Th color="white">Total</Th>
							<Th color="white">Excluir</Th>
						</Tr>
					</Thead>
					<Tbody>
						{ configs.map( ( item ) => {
							const key = `${ item.attributes?.ano }-${ item.attributes?.mes }`
							const calc = calculated[ key ]
							return (
								<Tr key={ item.id }>
									<Td color="white">{ item.attributes?.ano }</Td>
									<Td color="white">{ item.attributes?.mes }</Td>
									<Td color="white">{ formatCurrency( parseFloat( item.attributes?.meta ) || 0 ) }</Td>
									<Td color="white">{ formatCurrency( parseFloat( item.attributes?.salario_fixo ) || 0 ) }</Td>
									<Td color="white">
										{ calc ? formatCurrency( calc.vendas ) : "-" }
									</Td>
									<Td color="white">
										{ calc ? formatPercent( calc.atingimentoPercent ) : "-" }
									</Td>
									<Td color="white">
										{ calc ? formatCurrency( calc.comissaoFinal ) : "-" }
									</Td>
									<Td color="white">
										{ calc ? formatCurrency( calc.salarioTotal ) : "-" }
									</Td>
									<Td>
										<IconButton
											colorScheme="red"
											size="xs"
											icon={ <FaRegTrashCan /> }
											aria-label="Excluir"
											onClick={ () => handleDelete( item.id ) }
										/>
									</Td>
								</Tr>
							)
						} ) }
					</Tbody>
				</Table>
			</TableContainer>
			{ configs.length === 0 && (
				<Box py={ 4 } color="gray.400" fontSize="sm">
					Nenhuma configuração de comissão. Adicione uma acima.
				</Box>
			) }
		</Flex>
	)
}
