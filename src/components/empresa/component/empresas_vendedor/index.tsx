import { Box, Button, Badge, Flex, HStack, Input, Text, Tooltip, Skeleton } from "@chakra-ui/react"
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { memo, useMemo, useState } from "react"
import { HiChatBubbleLeftRight } from "react-icons/hi2"
import { FaMoneyBillAlt } from "react-icons/fa"
import { parseISO, differenceInDays } from "date-fns"
import { ObjContato } from "@/components/data/objetivo"
import { TipoContato } from "@/components/data/tipo"
import Link from "next/link"

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
	onFilterByCNAE?: ( cnae: string ) => void
}

export const CarteiraVendedor = memo( ( {
	filtro,
	isLoading,
	showVendedor = false,
	paginaAtual,
	totalPaginas,
	onChangePagina,
	onFilterByCNAE
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

	// Função para calcular luminosidade e determinar cor do texto
	const getTextColor = ( bgColor: string ): string => {
		// Para verde (negócio ganho), sempre usar branco
		if ( bgColor === '#22C55E' || bgColor === '#16a34a' ) {
			return '#FFFFFF'
		}

		// Converter hex para RGB
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
			} else {
				return 'white'
			}
		} else {
			return 'white'
		}

		// Calcular luminosidade relativa
		const luminance = ( 0.299 * r + 0.587 * g + 0.114 * b ) / 255

		// Retornar preto para fundos claros, branco para fundos escuros
		return luminance > 0.5 ? '#000000' : '#FFFFFF'
	}

	// Função para ajustar a cor do fundo verde para melhor contraste
	const getBackgroundColor = ( originalColor: string ): string => {
		// Para verde, usar um tom mais escuro para melhor contraste com branco e fundo escuro
		if ( originalColor === '#22C55E' ) {
			return '#16a34a' // Verde mais escuro (green-600)
		}
		return originalColor
	}

	// Renderizar tabela apenas quando os dados estiverem disponíveis
	const tabelaContent = useMemo( () => {
		if ( isLoading ) {
			// Gerar 8 linhas de skeleton para simular a tabela
			return Array.from( { length: 8 } ).map( ( _, index ) => (
				<tr key={ `skeleton-${ index }` } style={ { borderBottom: '1px solid #ffff' } }>
					<td style={ { padding: '0.3rem 1.2rem' } }>
						<Skeleton height="20px" startColor="gray.600" endColor="gray.700" width="80%" />
					</td>
					<td style={ { padding: '0.3rem 1.2rem', textAlign: 'center' } }>
						<Skeleton height="20px" startColor="gray.600" endColor="gray.700" width="60px" mx="auto" />
					</td>
					{ showVendedor && (
						<td style={ { padding: '0.3rem 1.2rem', textAlign: 'center' } }>
							<Skeleton height="20px" startColor="gray.600" endColor="gray.700" width="70px" mx="auto" />
						</td>
					) }
					<td style={ { padding: '0.3rem 1.2rem', textAlign: 'center' } }>
						<Skeleton height="24px" startColor="gray.600" endColor="gray.700" width="24px" borderRadius="full" mx="auto" />
					</td>
					<td style={ { padding: '0.3rem 1.2rem', textAlign: 'center' } }>
						<Skeleton height="24px" startColor="gray.600" endColor="gray.700" width="24px" borderRadius="full" mx="auto" />
					</td>
					<td style={ { padding: '0.3rem 1.2rem', textAlign: 'center' } }>
						<Skeleton height="20px" startColor="gray.600" endColor="gray.700" width="80px" mx="auto" />
					</td>
				</tr>
			) )
		}

		if ( !filtro || filtro.length === 0 ) {
			return (
				<tr>
					<td colSpan={ showVendedor ? 5 : 4 } style={ { textAlign: 'center', padding: '1rem' } }>
						Nenhuma empresa encontrada
					</td>
				</tr>
			)
		}

		return filtro.map( ( empresa ) => {
			const negocio = empresa.attributes.businesses.data || []
			const interacao = empresa.attributes.interacaos.data
			const vendedorNome = empresa.attributes.user?.data?.attributes?.username || "Sem vendedor"

			// Filtrar negócios concluídos (etapa === 6) e ordenar por data_conclucao (mais recente primeiro)
			const negociosConcluidos = negocio
				.filter( ( n: any ) => n.attributes.etapa === 6 )
				.sort( ( a: any, b: any ) => {
					const dataA = a.attributes.date_conclucao ? new Date( a.attributes.date_conclucao ).getTime() : 0
					const dataB = b.attributes.date_conclucao ? new Date( b.attributes.date_conclucao ).getTime() : 0
					return dataB - dataA
				} )
			const ultimoNegocioConcluido = negociosConcluidos[ 0 ]

			// Filtrar negócios em andamento (andamento === 3 e etapa !== 6)
			const negociosAtivos = negocio.filter( ( n: any ) =>
				n.attributes.andamento === 3 &&
				n.attributes.etapa !== 6 &&
				n.attributes.vendedor_name === session?.user?.name
			)
			const temNegocioAtivo = negociosAtivos.length > 0
			const primeiroNegocioAtivo = negociosAtivos[ 0 ]

			// Determinar cor do ícone de histórico
			let corHistorico = '#9CA3AF' // Cinza padrão
			let dadosHistorico: any = null

			if ( temNegocioAtivo ) {
				// Amarelo = Há negócio em andamento
				corHistorico = '#EAB308'
				const vendedorNome = primeiroNegocioAtivo?.attributes?.vendedor?.data?.attributes?.username ||
					primeiroNegocioAtivo?.attributes?.vendedor_name ||
					"Não informado"
				dadosHistorico = {
					data: primeiroNegocioAtivo?.attributes?.deadline || primeiroNegocioAtivo?.attributes?.createdAt,
					valor: primeiroNegocioAtivo?.attributes?.Budget || null,
					vendedor: vendedorNome
				}
			} else if ( ultimoNegocioConcluido ) {
				// Determinar cor baseado no último negócio concluído
				if ( ultimoNegocioConcluido.attributes.andamento === 5 ) {
					// Verde = Ganho (usar verde mais escuro para melhor contraste)
					corHistorico = '#16a34a'
				} else if ( ultimoNegocioConcluido.attributes.andamento === 1 ) {
					// Vermelho = Perdido
					corHistorico = '#EF4444'
				}

				// Buscar valor do negócio (Budget ou totalGeral do primeiro pedido)
				const pedidos = ultimoNegocioConcluido.attributes.pedidos?.data || []
				const valor = ultimoNegocioConcluido.attributes.Budget ||
					( pedidos.length > 0 ? pedidos[ 0 ]?.attributes?.totalGeral : null )

				const vendedorNome = ultimoNegocioConcluido.attributes.vendedor?.data?.attributes?.username ||
					ultimoNegocioConcluido.attributes.vendedor_name ||
					"Não informado"

				dadosHistorico = {
					data: ultimoNegocioConcluido.attributes.date_conclucao || ultimoNegocioConcluido.attributes.createdAt,
					valor: valor,
					vendedor: vendedorNome
				}
			}

			// Verificar se há interação e obter dados para tooltip
			let corInteracao = 'rgb(0,100,255)'
			let mostrarIconeInteracao = false
			let dadosInteracao: any = null

			if ( interacao ) {
				if ( typeof interacao === 'object' && 'cor' in interacao ) {
					// Se interacao é um objeto processado (formato após processamento)
					corInteracao = interacao.cor || 'rgb(0,100,255)'
					mostrarIconeInteracao = true
					// Usar o objeto processado que agora tem descricao
					dadosInteracao = interacao
				} else if ( Array.isArray( interacao ) && interacao.length > 0 ) {
					// Se interacao é um array
					mostrarIconeInteracao = true
					const ultima = interacao[ interacao.length - 1 ]
					if ( ultima && ultima.attributes ) {
						dadosInteracao = ultima.attributes
					}
				}
			}

			return (
				<tr
					key={ empresa.id }
					style={ { borderBottom: '1px solid #ffff' } }
				>
					<td style={ { padding: '0.3rem 1.2rem' } }>
						<Link
							href={ `/empresas/CNPJ/${ empresa.id }` }
							style={ { color: '#bee3f8', textDecoration: 'none', fontWeight: 700, textTransform: 'uppercase' } }
							onMouseEnter={ ( e ) => { e.currentTarget.style.textDecoration = 'underline' } }
							onMouseLeave={ ( e ) => { e.currentTarget.style.textDecoration = 'none' } }
						>
							{ empresa.attributes.nome }
						</Link>
					</td>
					<td style={ { padding: '0.3rem 1.2rem', textAlign: 'center' } }>
						{ empresa.attributes.CNAE ? (
							<Flex justifyContent="center" alignItems="center" w="100%">
								<Badge
									colorScheme="blue"
									cursor="pointer"
									onClick={ ( e: React.MouseEvent<HTMLSpanElement> ) => {
										e.stopPropagation()
										if ( onFilterByCNAE ) {
											onFilterByCNAE( empresa.attributes.CNAE )
										}
									} }
									_hover={ { opacity: 0.8 } }
								>
									{ empresa.attributes.CNAE }
								</Badge>
							</Flex>
						) : (
							<Text textAlign="center">-</Text>
						) }
					</td>
					{ showVendedor && (
						<td style={ { padding: '0.3rem 1.2rem', textAlign: 'center' } }>{ vendedorNome }</td>
					) }
					<td style={ { padding: '0.3rem 1.2rem', textAlign: 'center' } }>
						<Flex w={ '100%' } justifyContent={ 'center' } onClick={ ( e ) => e.stopPropagation() }>
							<Tooltip
								label={
									dadosHistorico ? ( () => {
										const purchaseFrequency = empresa.attributes.purchaseFrequency || null
										const valorFormatado = dadosHistorico.valor ? ( () => {
											// Converter para número se for string
											const valor = typeof dadosHistorico.valor === 'string'
												? parseFloat( dadosHistorico.valor.replace( /\./g, '' ).replace( ',', '.' ) )
												: parseFloat( dadosHistorico.valor )

											if ( isNaN( valor ) ) return dadosHistorico.valor

											return new Intl.NumberFormat( 'pt-BR', {
												style: 'currency',
												currency: 'BRL'
											} ).format( valor )
										} )() : null

										const textColor = getTextColor( corHistorico )

										return (
											<Box p={ 3 } bg={ corHistorico } borderRadius="md">
												{ dadosHistorico.vendedor && (
													<Text fontSize="xs" fontWeight="bold" mb={ 1 } color={ textColor }>
														{ dadosHistorico.vendedor }
													</Text>
												) }
												{ valorFormatado && (
													<Text fontSize="md" mb={ 1 } color={ textColor }>
														{ valorFormatado }
													</Text>
												) }
												{ dadosHistorico.data && (
													<Text fontSize="xs" mb={ 1 } color={ textColor }>
														{ new Date( dadosHistorico.data ).toLocaleDateString( 'pt-BR' ) }
													</Text>
												) }
												{ purchaseFrequency && (
													<Text fontSize="xs" mt={ 1 } color={ textColor }>
														Compra { purchaseFrequency }
													</Text>
												) }
											</Box>
										)
									} )() : "Não há negócios"
								}
								hasArrow
								bg={ getBackgroundColor( corHistorico ) }
								color={ getTextColor( getBackgroundColor( corHistorico ) ) }
								fontSize="xs"
								placement="top"
							>
								<span style={ { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' } }>
									<FaMoneyBillAlt color={ getBackgroundColor( corHistorico ) } fontSize={ '1.5rem' } />
								</span>
							</Tooltip>
						</Flex>
					</td>
					<td style={ { padding: '0.3rem 1.2rem', textAlign: 'center' } }>
						{ mostrarIconeInteracao && (
							<Flex w={ '100%' } justifyContent={ 'center' } onClick={ ( e ) => e.stopPropagation() }>
								<Tooltip
									label={
										dadosInteracao ? ( () => {
											// Buscar objetivo e tipo
											const objetivoId = dadosInteracao.objetivo?.toString() || dadosInteracao.objetivo
											const tipoId = dadosInteracao.tipo?.toString() || dadosInteracao.tipo

											const objetivoObj = ObjContato.find( ( o: any ) => o.id === objetivoId )
											const tipoObj = TipoContato.find( ( t: any ) => t.id === tipoId )

											const objetivoTexto = objetivoObj?.title || "Sem objetivo"
											const tipoTexto = tipoObj?.title || "Sem tipo"
											const descricao = dadosInteracao.descricao || ""

											const vendedorNome = dadosInteracao.vendedor_name || "Sem vendedor"
											const dataCriacao = dadosInteracao.createdAt ? new Date( dadosInteracao.createdAt ).toLocaleDateString( 'pt-BR' ) : null
											const dataProxima = dadosInteracao.proxima ? new Date( dadosInteracao.proxima ).toLocaleDateString( 'pt-BR' ) : null

											const textColorInteracao = getTextColor( corInteracao )

											return (
												<Box p={ 3 } pb={ 6 } minW="300px" maxW="400px" position="relative" bg={ corInteracao } borderRadius="md">
													{ dataCriacao && (
														<Text fontSize="xs" position="absolute" top={ 3 } right={ 3 } opacity={ 0.7 } color={ textColorInteracao }>
															{ dataCriacao }
														</Text>
													) }
													{ objetivoTexto && (
														<Text fontSize="sm" fontWeight="bold" mb={ 1 } color={ textColorInteracao }>
															{ objetivoTexto }
														</Text>
													) }
													{ vendedorNome && (
														<Text fontSize="xs" mb={ 2 } opacity={ 0.6 } color={ textColorInteracao }>
															{ vendedorNome }
														</Text>
													) }
													{ descricao && (
														<Text fontSize="xs" mb={ 2 } whiteSpace="pre-wrap" color={ textColorInteracao }>
															{ descricao }
														</Text>
													) }
													{ tipoTexto && (
														<Text fontSize="xs" position="absolute" bottom={ 3 } left={ 3 } opacity={ 0.8 } color={ textColorInteracao }>
															{ tipoTexto }
														</Text>
													) }
													{ dataProxima && (
														<Text fontSize="xs" position="absolute" bottom={ 3 } right={ 3 } opacity={ 0.7 } color={ textColorInteracao }>
															{ dataProxima }
														</Text>
													) }
												</Box>
											)
										} )() : "Sem interações"
									}
									hasArrow
									bg={ corInteracao }
									color={ getTextColor( corInteracao ) }
									fontSize="xs"
									placement="top"
									maxW="500px"
								>
									<span style={ { display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' } }>
										<HiChatBubbleLeftRight color={ corInteracao } fontSize={ '1.5rem' } />
									</span>
								</Tooltip>
							</Flex>
						) }
					</td>
					<td style={ { padding: '0.3rem 1.2rem', textAlign: 'center' } }>
						{ ( () => {
							const expiresIn = empresa.attributes.expiresIn
							if ( !expiresIn ) {
								return <Text textAlign="center">-</Text>
							}

							try {
								const dataExpiracao = parseISO( expiresIn )
								const agora = new Date()
								const diasRestantes = differenceInDays( dataExpiracao, agora )
								const dataFormatada = dataExpiracao.toLocaleDateString( 'pt-BR' )

								let corTexto = 'white'
								let opacidade = 1

								if ( diasRestantes < 0 ) {
									// Já expirado - branco com opacidade menor
									opacidade = 0.6
								} else if ( diasRestantes <= 5 ) {
									// Últimos 5 dias - vermelho
									corTexto = '#EF4444'
								} else if ( diasRestantes <= 15 ) {
									// Próximos 15 dias - amarelo
									corTexto = '#EAB308'
								}

								return (
									<Text color={ corTexto } opacity={ opacidade } textAlign="center">
										{ dataFormatada }
									</Text>
								)
							} catch ( error ) {
								return <Text textAlign="center">-</Text>
							}
						} )() }
					</td>
				</tr>
			)
		} )
	}, [ filtro, isLoading, router, session?.user?.name, showVendedor, onFilterByCNAE ] )

	// Renderizar controles de paginação
	const paginacao = useMemo( () => {
		if ( totalPaginas <= 1 ) return null

		return (
			<Flex alignItems="center" mt={ 4 } justifyContent="center">
				<HStack spacing={ 2 }>
					<Button
						size="xs"
						bg="#2b6cb0"
						color="white"
						_hover={ { bg: '#2c5282' } }
						_active={ { bg: '#2a4365' } }
						_disabled={ { bg: '#1a365d', opacity: 0.5, cursor: 'not-allowed' } }
						onClick={ () => onChangePagina( Math.max( 1, paginaAtual - 1 ) ) }
						isDisabled={ paginaAtual === 1 || isLoading }
					>
						<FaAngleDoubleLeft />
					</Button>
					<Text fontSize="xs">Ir para página:</Text>
					<Input
						size="xs"
						width="50px"
						textAlign="center"
						borderRadius="md"
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
					<Button
						size="xs"
						bg="#2b6cb0"
						color="white"
						_hover={ { bg: '#2c5282' } }
						_active={ { bg: '#2a4365' } }
						_disabled={ { bg: '#1a365d', opacity: 0.5, cursor: 'not-allowed' } }
						onClick={ () => onChangePagina( Math.min( totalPaginas, paginaAtual + 1 ) ) }
						isDisabled={ paginaAtual === totalPaginas || isLoading }
					>
						<FaAngleDoubleRight />
					</Button>
				</HStack>
			</Flex>
		)
	}, [ paginaAtual, totalPaginas, isLoading, onChangePagina, paginaInput ] )

	return (
		<Box color={ 'white' } w={ '100%' } display="flex" flexDirection="column">
			<Box
				mt={ 0 }
				pe={ 3 }
			>
				<table style={ { width: '100%' } }>
					<thead>
						<tr style={ { background: '#ffffff12', borderBottom: '1px solid #ffff' } }>
							<th style={ { padding: '0.6rem 1.2rem', textAlign: 'start', width: showVendedor ? '25%' : '30%', textTransform: 'uppercase' } }>Nome</th>
							<th style={ { padding: '0.6rem 1.2rem', textAlign: 'center', width: '10%', textTransform: 'uppercase' } }>CNAE</th>
							{ showVendedor && (
								<th style={ { padding: '0.6rem 1.2rem', textAlign: 'center', width: '12%', textTransform: 'uppercase' } }>Vendedor</th>
							) }
							<th style={ { padding: '0.6rem 1.2rem', textAlign: 'center', width: '15%', textTransform: 'uppercase' } }>Negócios</th>
							<th style={ { padding: '0.6rem 1.2rem', textAlign: 'center', width: '6%', textTransform: 'uppercase' } }>Interações</th>
							<th style={ { padding: '0.6rem 1.2rem', textAlign: 'center', width: '15%', textTransform: 'uppercase' } }>Expira em</th>
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
