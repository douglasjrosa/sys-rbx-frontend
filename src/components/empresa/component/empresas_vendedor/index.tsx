import Loading from "@/components/elements/loading"
import { Box, Flex, Heading } from "@chakra-ui/react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { memo, useMemo } from "react"
import { HiChatBubbleLeftRight } from "react-icons/hi2"
import { FaMoneyBillAlt } from "react-icons/fa"

type EmpresaData = {
	id: string
	attributes: any
}

type CarteiraVendedorProps = {
	filtro: EmpresaData[]
	isLoading: boolean
}

export const CarteiraVendedor = memo( ( { filtro, isLoading }: CarteiraVendedorProps ) => {
	const { data: session } = useSession()
	const router = useRouter()

	// Renderizar tabela apenas quando os dados estiverem disponíveis
	const tabelaContent = useMemo( () => {
		if ( isLoading ) {
			return (
				<tr>
					<td colSpan={ 3 } style={ { textAlign: 'center' } }>
						<Flex justifyContent="center" w="100%" py={ 4 }>
							<Loading size="110px">Carregando...</Loading>
						</Flex>
					</td>
				</tr>
			)
		}

		if ( !filtro || filtro.length === 0 ) {
			return (
				<tr>
					<td colSpan={ 3 } style={ { textAlign: 'center', padding: '1rem' } }>
						Nenhuma empresa encontrada
					</td>
				</tr>
			)
		}

		return filtro.map( ( empresa ) => {
			const negocio = empresa.attributes.businesses.data || []
			const interacao = empresa.attributes.interacaos.data

			// Filtrar negócios relevantes apenas uma vez
			const temNegocioAtivo = negocio.some( ( n: any ) =>
				n.attributes.andamento === 3 &&
				n.attributes.etapa !== 6 &&
				n.attributes.vendedor_name === session?.user?.name
			)

			// Verificar se há interação e se tem a propriedade cor
			let corInteracao = '#1A202C' // cor padrão
			let mostrarIconeInteracao = false

			if ( interacao ) {
				if ( typeof interacao === 'object' && 'cor' in interacao ) {
					// Se interacao é um objeto com propriedade cor (formato após processamento)
					corInteracao = interacao.cor || '#1A202C'
					mostrarIconeInteracao = true
				} else if ( Array.isArray( interacao ) && interacao.length > 0 ) {
					// Se interacao é um array e tem elementos
					mostrarIconeInteracao = true
				}
			}

			return (
				<tr
					key={ empresa.id }
					style={ { borderBottom: '1px solid #ffff', cursor: 'pointer' } }
					onClick={ () => router.push( `/empresas/CNPJ/${ empresa.id }` ) }
				>
					<td style={ { padding: '0.3rem 1.2rem' } }>{ empresa.attributes.nome }</td>
					<td style={ { padding: '0.3rem 1.2rem' } }>
						{ mostrarIconeInteracao && (
							<Flex w={ '100%' } justifyContent={ 'center' }>
								<HiChatBubbleLeftRight color={ corInteracao } fontSize={ '1.5rem' } />
							</Flex>
						) }
					</td>
					<td style={ { padding: '0.3rem 1.2rem' } }>
						{ temNegocioAtivo && (
							<Flex w={ '100%' } justifyContent={ 'center' }>
								<FaMoneyBillAlt color={ 'green' } fontSize={ '1.5rem' } />
							</Flex>
						) }
					</td>
				</tr>
			)
		} )
	}, [ filtro, isLoading, router, session?.user?.name ] )

	return (
		<Box color={ 'white' } w={ { base: '100%', lg: '50%' } } display="flex" flexDirection="column" h="100%">
			<Heading size={ 'lg' }>Empresas na minha carteira</Heading>
			<Box
				mt={ 5 }
				pe={ 3 }
				maxH={ { base: '23rem', lg: 'calc(100% - 70px)' } }
				overflow={ 'auto' }
				flex="1"
			>
				<table style={ { width: '100%' } }>
					<thead>
						<tr style={ { background: '#ffffff12', borderBottom: '1px solid #ffff' } }>
							<th style={ { padding: '0.6rem 1.2rem', textAlign: 'start', width: '45%' } }>Nome</th>
							<th style={ { padding: '0.6rem 1.2rem', textAlign: 'start', width: '6%' } }>Interações</th>
							<th style={ { padding: '0.6rem 1.2rem', textAlign: 'start', width: '6%' } }>Negocios</th>
						</tr>
					</thead>
					<tbody>
						{ tabelaContent }
					</tbody>
				</table>
			</Box>
		</Box>
	)
} )

CarteiraVendedor.displayName = 'CarteiraVendedor'
