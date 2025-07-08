import Loading from "@/components/elements/loading"
import { Box, Button, Flex, Heading, HStack, Input, Text } from "@chakra-ui/react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { memo, useMemo, useState } from "react"
import { HiChatBubbleLeftRight } from "react-icons/hi2"
import { FaMoneyBillAlt } from "react-icons/fa"

type EmpresaData = {
	id: string
	attributes: any
}

type CarteiraVendedorProps = {
	filtro: EmpresaData[]
	isLoading: boolean
	showVendedor?: boolean
	paginaAtual: number
	totalPaginas: number
	onChangePagina: ( pagina: number ) => void
}

export const CarteiraVendedor = memo( ( {
	filtro,
	isLoading,
	showVendedor = false,
	paginaAtual,
	totalPaginas,
	onChangePagina
}: CarteiraVendedorProps ) => {
	const { data: session } = useSession()
	const router = useRouter()
	const isAdmin = session?.user?.pemission === 'Adm'
	const [ paginaInput, setPaginaInput ] = useState<string>( paginaAtual.toString() )

	// Função para lidar com a navegação manual por input
	const handlePaginaInputChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
		setPaginaInput( e.target.value )
	}

	// Função para validar e navegar para a página digitada
	const handlePaginaInputSubmit = () => {
		const numeroPagina = parseInt( paginaInput, 10 )
		if ( !isNaN( numeroPagina ) && numeroPagina >= 1 && numeroPagina <= totalPaginas ) {
			onChangePagina( numeroPagina )
		} else {
			// Resetar para a página atual se o valor for inválido
			setPaginaInput( paginaAtual.toString() )
		}
	}

	// Atualizar o input quando a página atual mudar
	useMemo( () => {
		setPaginaInput( paginaAtual.toString() )
	}, [ paginaAtual ] )

	// Renderizar tabela apenas quando os dados estiverem disponíveis
	const tabelaContent = useMemo( () => {
		if ( isLoading ) {
			return (
				<tr>
					<td colSpan={ showVendedor ? 4 : 3 } style={ { textAlign: 'center' } }>
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
					<td colSpan={ showVendedor ? 4 : 3 } style={ { textAlign: 'center', padding: '1rem' } }>
						Nenhuma empresa encontrada
					</td>
				</tr>
			)
		}

		return filtro.map( ( empresa ) => {
			const negocio = empresa.attributes.businesses.data || []
			const interacao = empresa.attributes.interacaos.data
			const vendedorNome = empresa.attributes.user?.data?.attributes?.username || "Sem vendedor"

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
					{ showVendedor && (
						<td style={ { padding: '0.3rem 1.2rem' } }>{ vendedorNome }</td>
					) }
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
	}, [ filtro, isLoading, router, session?.user?.name, showVendedor ] )

	// Renderizar controles de paginação
	const paginacao = useMemo( () => {
		if ( totalPaginas <= 1 ) return null

		return (
			<Flex direction="column" alignItems="center" mt={ 4 } gap={ 2 }>
				<HStack spacing={ 2 } justifyContent="center">
					<Button
						size="xs"
						onClick={ () => onChangePagina( Math.max( 1, paginaAtual - 1 ) ) }
						isDisabled={ paginaAtual === 1 || isLoading }
					>
						Anterior
					</Button>

					{ paginaAtual > 2 && (
						<Button size="xs" onClick={ () => onChangePagina( 1 ) }>1</Button>
					) }

					{ paginaAtual > 3 && <Box>...</Box> }

					{ paginaAtual > 1 && (
						<Button size="xs" onClick={ () => onChangePagina( paginaAtual - 1 ) }>
							{ paginaAtual - 1 }
						</Button>
					) }

					<Button size="xs" colorScheme="blue">
						{ paginaAtual }
					</Button>

					{ paginaAtual < totalPaginas && (
						<Button size="xs" onClick={ () => onChangePagina( paginaAtual + 1 ) }>
							{ paginaAtual + 1 }
						</Button>
					) }

					{ paginaAtual < totalPaginas - 2 && <Box>...</Box> }

					{ paginaAtual < totalPaginas - 1 && (
						<Button size="xs" onClick={ () => onChangePagina( totalPaginas ) }>
							{ totalPaginas }
						</Button>
					) }

					<Button
						size="xs"
						onClick={ () => onChangePagina( Math.min( totalPaginas, paginaAtual + 1 ) ) }
						isDisabled={ paginaAtual === totalPaginas || isLoading }
					>
						Próxima
					</Button>
				</HStack>

				<HStack spacing={ 2 } mt={ 2 }>
					<Text fontSize="xs">Ir para página:</Text>
					<Input
						size="xs"
						width="50px"
						value={ paginaInput }
						onChange={ handlePaginaInputChange }
						onBlur={ handlePaginaInputSubmit }
						onKeyPress={ ( e ) => {
							if ( e.key === 'Enter' ) {
								handlePaginaInputSubmit()
							}
						} }
					/>
					<Text fontSize="xs">de { totalPaginas }</Text>
				</HStack>
			</Flex>
		)
	}, [ paginaAtual, totalPaginas, isLoading, onChangePagina, paginaInput ] )

	return (
		<Box color={ 'white' } w={ { base: '100%', lg: '50%' } } display="flex" flexDirection="column" h="100%">
			<Heading size={ 'lg' }>
				{ isAdmin && showVendedor ? "Todas as empresas com vendedor" : "Empresas na minha carteira" }
			</Heading>
			<Box
				mt={ 5 }
				pe={ 3 }
				maxH={ { base: '23rem', lg: 'calc(100% - 120px)' } }
				overflow={ 'auto' }
				flex="1"
			>
				<table style={ { width: '100%' } }>
					<thead>
						<tr style={ { background: '#ffffff12', borderBottom: '1px solid #ffff' } }>
							<th style={ { padding: '0.6rem 1.2rem', textAlign: 'start', width: showVendedor ? '35%' : '45%' } }>Nome</th>
							{ showVendedor && (
								<th style={ { padding: '0.6rem 1.2rem', textAlign: 'start', width: '20%' } }>Vendedor</th>
							) }
							<th style={ { padding: '0.6rem 1.2rem', textAlign: 'start', width: '6%' } }>Interações</th>
							<th style={ { padding: '0.6rem 1.2rem', textAlign: 'start', width: '6%' } }>Negocios</th>
						</tr>
					</thead>
					<tbody>
						{ tabelaContent }
					</tbody>
				</table>
			</Box>

			{ /* Paginação fixa na parte inferior */ }
			<Box mt={ 3 } pb={ 2 }>
				{ paginacao }
			</Box>
		</Box>
	)
} )

CarteiraVendedor.displayName = 'CarteiraVendedor'
