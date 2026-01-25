import { Box, Button, Badge, Flex, HStack, Input, Text, Tooltip, Skeleton } from "@chakra-ui/react"
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa"
import Link from "next/link"
import { memo, useMemo, useState } from "react"
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
	paginaAtual,
	totalPaginas,
	onChangePagina,
	onFilterByCNAE,
	onFilterByCidade
}: CarteiraAusenteProps ) => {
	const { data: session } = useSession()
	const router = useRouter()
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

		// Para amarelo (negócio em andamento), sempre usar preto para melhor contraste
		if ( bgColor === '#EAB308' || bgColor === 'yellow' || bgColor?.toLowerCase()?.includes( 'yellow' ) ) {
			return '#000000'
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
		// #region agent log
		fetch('http://127.0.0.1:7244/ingest/9b56e505-01d3-49e7-afde-e83171883b39',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CarteiraAusente:112',message:'Renderizando tabelaContent',data:{filtroCount:filtro?.length,isLoading},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H6'})}).catch(()=>{});
		// #endregion

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
					<td style={ { padding: '0.3rem 1.2rem', textAlign: 'center' } }>
						<Skeleton height="24px" startColor="gray.600" endColor="gray.700" width="24px" borderRadius="full" mx="auto" />
					</td>
					<td style={ { padding: '0.3rem 1.2rem', textAlign: 'center' } }>
						<Skeleton height="24px" startColor="gray.600" endColor="gray.700" width="24px" borderRadius="full" mx="auto" />
					</td>
					<td style={ { padding: '0.3rem 1.2rem', textAlign: 'center' } }>
						<Skeleton height="20px" startColor="gray.600" endColor="gray.700" width="80px" mx="auto" />
					</td>
					<td style={ { padding: '0.3rem 1.2rem', textAlign: 'center' } }>
						<Skeleton height="20px" startColor="gray.600" endColor="gray.700" width="100px" mx="auto" />
					</td>
				</tr>
			) )
		}

		if ( !filtro || filtro.length === 0 ) {
			return (
				<tr>
					<td colSpan={ 6 } style={ { textAlign: 'center', padding: '1rem' } }>
						Nenhuma empresa encontrada
					</td>
				</tr>
			)
		}

		// Log para verificar dados no componente
		if ( filtro.length > 0 ) {
			const primeiraEmpresa = filtro[ 0 ]
			console.log( '🔍 [COMPONENTE AUSENTE] Processando primeira empresa:' )
			console.log( '  - ID:', primeiraEmpresa?.id )
			console.log( '  - Nome:', primeiraEmpresa?.attributes?.nome )
			console.log( '  - businesses.data:', primeiraEmpresa?.attributes?.businesses?.data )
			console.log( '  - businesses.data length:', primeiraEmpresa?.attributes?.businesses?.data?.length || 0 )
			console.log( '  - interacaos.data:', primeiraEmpresa?.attributes?.interacaos?.data )
			console.log( '  - interacaos.data type:', typeof primeiraEmpresa?.attributes?.interacaos?.data )
			console.log( '  - interacaos.data isArray:', Array.isArray( primeiraEmpresa?.attributes?.interacaos?.data ) )
			if ( primeiraEmpresa?.attributes?.interacaos?.data ) {
				const interacaoData = primeiraEmpresa.attributes.interacaos.data
				if ( Array.isArray( interacaoData ) ) {
					console.log( '  - interacaos.data length:', interacaoData.length )
					if ( interacaoData.length > 0 ) {
						console.log( '  - Primeira interação:', interacaoData[ 0 ] )
					}
				} else {
					console.log( '  - interacaos.data (objeto):', interacaoData )
					console.log( '  - interacaos.data.proxima:', interacaoData.proxima )
					console.log( '  - interacaos.data.descricao:', interacaoData.descricao )
				}
			}
		}

		// Função auxiliar para acessar campos que podem estar em attributes ou diretamente no objeto
		const getField = ( obj: any, field: string ) => {
			if ( !obj ) return undefined
			// Se tem attributes, usar attributes, senão usar diretamente
			return obj.attributes ? obj.attributes[ field ] : obj[ field ]
		}

		return filtro.map( ( empresa ) => {
			const negocio = empresa.attributes?.businesses?.data || []
			// Normalizar interacao: pode vir como objeto único (após processamento) ou array
			const interacaoRaw = empresa.attributes?.interacaos?.data || null
			let interacao: any = null
			
			// Determinar o formato da interação
			if ( !interacaoRaw ) {
				interacao = null
			} else if ( Array.isArray( interacaoRaw ) ) {
				// Se é array vazio, null
				if ( interacaoRaw.length === 0 ) {
					interacao = null
				} else {
					// Array com elementos, usar o último
					interacao = interacaoRaw
				}
			} else if ( typeof interacaoRaw === 'object' ) {
				// Objeto único (pode ser processado ou não)
				interacao = interacaoRaw
			}

			// Filtrar negócios concluídos (etapa === 6) e ordenar por data_conclucao (mais recente primeiro)
			const negociosConcluidos = negocio
				.filter( ( n: any ) => getField( n, 'etapa' ) === 6 )
				.sort( ( a: any, b: any ) => {
					const dataA = getField( a, 'date_conclucao' ) ? new Date( getField( a, 'date_conclucao' ) ).getTime() : 0
					const dataB = getField( b, 'date_conclucao' ) ? new Date( getField( b, 'date_conclucao' ) ).getTime() : 0
					return dataB - dataA
				} )
			const ultimoNegocioConcluido = negociosConcluidos[ 0 ]

			// Filtrar negócios em andamento (andamento === 3 e etapa !== 6)
			const negociosAtivos = negocio.filter( ( n: any ) =>
				getField( n, 'andamento' ) === 3 &&
				getField( n, 'etapa' ) !== 6 &&
				getField( n, 'vendedor_name' ) === session?.user?.name
			)
			const temNegocioAtivo = negociosAtivos.length > 0
			const primeiroNegocioAtivo = negociosAtivos[ 0 ]

			// Determinar cor do ícone de histórico
			let corHistorico = '#9CA3AF' // Cinza padrão
			let dadosHistorico: any = null

			if ( temNegocioAtivo ) {
				// Amarelo = Há negócio em andamento
				corHistorico = '#EAB308'
				const vendedorObj = primeiroNegocioAtivo?.vendedor || primeiroNegocioAtivo?.attributes?.vendedor
				const vendedorNome = vendedorObj?.username || vendedorObj?.data?.attributes?.username || 
					getField( primeiroNegocioAtivo, 'vendedor_name' ) ||
					"Não informado"
				dadosHistorico = {
					data: getField( primeiroNegocioAtivo, 'deadline' ) || getField( primeiroNegocioAtivo, 'createdAt' ),
					valor: getField( primeiroNegocioAtivo, 'Budget' ) || null,
					vendedor: vendedorNome
				}
			} else if ( ultimoNegocioConcluido ) {
				// Determinar cor baseado no último negócio concluído
				const andamento = getField( ultimoNegocioConcluido, 'andamento' )
				if ( andamento === 5 ) {
					// Verde = Ganho (usar verde mais escuro para melhor contraste)
					corHistorico = '#16a34a'
				} else if ( andamento === 1 ) {
					// Vermelho = Perdido
					corHistorico = '#EF4444'
				}

				// Buscar valor do negócio (Budget ou totalGeral do primeiro pedido)
				const pedidos = ultimoNegocioConcluido?.pedidos || ultimoNegocioConcluido?.attributes?.pedidos || []
				const pedidosArray = Array.isArray( pedidos ) ? pedidos : pedidos?.data || []
				const valor = getField( ultimoNegocioConcluido, 'Budget' ) ||
					( pedidosArray.length > 0 ? ( pedidosArray[ 0 ]?.totalGeral || pedidosArray[ 0 ]?.attributes?.totalGeral ) : null )

				const vendedorObj = ultimoNegocioConcluido?.vendedor || ultimoNegocioConcluido?.attributes?.vendedor
				const vendedorNome = vendedorObj?.username || vendedorObj?.data?.attributes?.username ||
					getField( ultimoNegocioConcluido, 'vendedor_name' ) ||
					"Não informado"

				dadosHistorico = {
					data: getField( ultimoNegocioConcluido, 'date_conclucao' ) || getField( ultimoNegocioConcluido, 'createdAt' ),
					valor: valor,
					vendedor: vendedorNome
				}
			}

			// Verificar se há interação e obter dados para tooltip
			let corInteracao = 'rgb(0,100,255)'
			let mostrarIconeInteracao = false
			let dadosInteracao: any = null

			if ( interacao ) {
				// Se é array vazio, não mostrar
				if ( Array.isArray( interacao ) && interacao.length === 0 ) {
					mostrarIconeInteracao = false
				} else if ( typeof interacao === 'object' && 'cor' in interacao ) {
					// Se interacao é um objeto processado (formato após processamento)
					corInteracao = interacao.cor || 'rgb(0,100,255)'
					mostrarIconeInteracao = true
					// Usar o objeto processado que agora tem descricao
					dadosInteracao = interacao
				} else if ( Array.isArray( interacao ) && interacao.length > 0 ) {
					// Se interacao é um array com elementos
					mostrarIconeInteracao = true
					const ultima = interacao[ interacao.length - 1 ]
					if ( ultima ) {
						// Normalizar acesso aos campos (pode estar em attributes ou diretamente)
						dadosInteracao = ultima.attributes || ultima
					}
				} else if ( typeof interacao === 'object' && interacao !== null ) {
					// Se interacao é um objeto único (não array)
					mostrarIconeInteracao = true
					dadosInteracao = interacao.attributes || interacao
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
						{ empresa.attributes.CNAE && (
							<Flex justifyContent="center">
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
									{ formatCNAE( empresa.attributes.CNAE ) }
								</Badge>
							</Flex>
						) }
					</td>
					<td style={ { padding: '0.3rem 1.2rem', textAlign: 'center' } }>
						{ dadosHistorico && (
							<Flex w={ '100%' } justifyContent={ 'center' } onClick={ ( e ) => e.stopPropagation() }>
								<Tooltip
									label={ ( () => {
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
									} )()
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
						) }
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
					<td style={ { padding: '0.3rem 1.2rem', textAlign: 'center' } }>
						<Flex justifyContent="center" alignItems="center" w="100%">
							{ empresa.attributes.cidade ? (
								<Badge
									colorScheme="purple"
									cursor="pointer"
									fontSize="0.65rem"
									onClick={ ( e: React.MouseEvent<HTMLSpanElement> ) => {
										e.stopPropagation()
										if ( onFilterByCidade ) {
											onFilterByCidade( empresa.attributes.cidade )
										}
									} }
									_hover={ { opacity: 0.8 } }
									textTransform="none"
								>
									{ `${ empresa.attributes.cidade } - ${ empresa.attributes.uf || '' }` }
								</Badge>
							) : '-' }
						</Flex>
					</td>
				</tr>
			)
		} )
	}, [ filtro, isLoading, router, session?.user?.name, onFilterByCNAE, onFilterByCidade ] )

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
		<Box color={ 'white' } w={ '100%' } h={ '100%' } display="flex" flexDirection="column">
			<Box
				mt={ 0 }
				pe={ 3 }
				flex="1"
				overflowY="auto"
				minH={ 0 }
				sx={ {
					'&::-webkit-scrollbar': {
						width: '8px',
					},
					'&::-webkit-scrollbar-track': {
						background: '#1A202C',
						borderRadius: '4px',
					},
					'&::-webkit-scrollbar-thumb': {
						background: '#4A5568',
						borderRadius: '4px',
					},
					'&::-webkit-scrollbar-thumb:hover': {
						background: '#718096',
					},
				} }
			>
				<table style={ { width: '100%', borderCollapse: 'separate', borderSpacing: 0 } }>
					<thead style={ { position: 'sticky', top: 0, zIndex: 10, background: '#1A202C' } }>
						<tr style={ { background: '#ffffff12', borderBottom: '1px solid #ffff' } }>
							<th style={ { padding: '0.6rem 1.2rem', textAlign: 'start', width: '30%', textTransform: 'uppercase' } }>Nome</th>
							<th style={ { padding: '0.6rem 1.2rem', textAlign: 'center', width: '10%', textTransform: 'uppercase' } }>CNAE</th>
							<th style={ { padding: '0.6rem 1.2rem', textAlign: 'center', width: '15%', textTransform: 'uppercase' } }>Negócios</th>
							<th style={ { padding: '0.6rem 1.2rem', textAlign: 'center', width: '6%', textTransform: 'uppercase' } }>Interações</th>
							<th style={ { padding: '0.6rem 1.2rem', textAlign: 'center', width: '15%', textTransform: 'uppercase' } }>Expira em</th>
							<th style={ { padding: '0.6rem 1.2rem', textAlign: 'center', width: '15%', textTransform: 'uppercase' } }>Cidade</th>
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

CarteiraAusente.displayName = 'CarteiraAusente'
