import { CarteiraAusente } from "@/components/empresa/component/empresas_ausente"
import { CarteiraVendedor } from "@/components/empresa/component/empresas_vendedor"
import { FiltroEmpresa } from "@/components/empresa/component/fitro/empresa"
import { FiltroCNAE, FiltroCNAERef } from "@/components/empresa/component/fitro/cnae"
import { Box, Button, Flex, Heading, useToast, Select, FormLabel, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Text, Tabs, TabList, TabPanels, Tab, TabPanel, HStack, Input } from "@chakra-ui/react"
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa"
import axios from "axios"
import { parseISO, startOfDay, differenceInDays } from "date-fns"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useCallback, useEffect, useMemo, useState, useRef } from "react"

function Empresas () {
	const router = useRouter()
	const { data: session } = useSession()
	const toast = useToast()
	const isAdmin = session?.user?.pemission === 'Adm'

	// Estados separados para cada tipo de empresa
	const [ empresasComVendedor, setEmpresasComVendedor ] = useState<any[]>( [] )
	const [ empresasSemVendedor, setEmpresasSemVendedor ] = useState<any[]>( [] )

	// Estados para filtro e paginação
	const [ filtroTexto, setFiltroTexto ] = useState( "" )
	const [ filtroCNAE, setFiltroCNAE ] = useState( "" )
	const [ filtroVendedorId, setFiltroVendedorId ] = useState<string>( "" )
	const [ ordemClassificacao, setOrdemClassificacao ] = useState<"relevancia" | "expiracao">( "relevancia" )
	const filtroCNAERef = useRef<FiltroCNAERef>( null )
	const [ paginaAtualSemVendedor, setPaginaAtualSemVendedor ] = useState( 1 )
	const [ paginaAtualComVendedor, setPaginaAtualComVendedor ] = useState( 1 )
	const [ carregandoVendedor, setCarregandoVendedor ] = useState( false )
	const [ carregandoSemVendedor, setCarregandoSemVendedor ] = useState( false )
	const [ totalPaginasSemVendedor, setTotalPaginasSemVendedor ] = useState( 1 )
	const [ totalPaginasComVendedor, setTotalPaginasComVendedor ] = useState( 1 )
	const [ tabIndex, setTabIndex ] = useState( 0 )
	const prevTotalPaginasComVendedor = useRef( 1 )
	const prevTotalPaginasSemVendedor = useRef( 1 )
	const inicializadoRef = useRef( false )

	// Estados para vendedores e migração
	const [ vendedores, setVendedores ] = useState<any[]>( [] )
	const [ novoVendedorId, setNovoVendedorId ] = useState<string>( "" )
	const [ migrando, setMigrando ] = useState( false )
	const { isOpen: isOpenMigrate, onOpen: onOpenMigrate, onClose: onCloseMigrate } = useDisclosure()

	// Função para calcular diferença em dias entre duas datas
	const calcularDiferencaEmDias = useCallback( ( data1: Date, data2: Date ): number => {
		const umDiaEmMilissegundos = 24 * 60 * 60 * 1000
		const data1UTC = Date.UTC( data1.getFullYear(), data1.getMonth(), data1.getDate() )
		const data2UTC = Date.UTC( data2.getFullYear(), data2.getMonth(), data2.getDate() )
		return Math.floor( ( data2UTC - data1UTC ) / umDiaEmMilissegundos )
	}, [] )

	// Função para processar interações e definir cores e informações
	const processarInteracao = useCallback( ( ultimaInteracao: any, dataAtual: Date ) => {
		if ( !ultimaInteracao ) return { proxima: null, cor: 'gray', info: 'Você não tem interação agendada', difDias: 500 }

		const proximaData = startOfDay( parseISO( ultimaInteracao.attributes.proxima ) )
		const diferencaEmDias = calcularDiferencaEmDias( dataAtual, proximaData )

		if ( ultimaInteracao.attributes.status_atendimento === false ) {
			return { proxima: null, cor: 'gray', info: 'Você não tem interação agendada', difDias: 500 }
		} else if ( diferencaEmDias === 0 ) {
			return { proxima: proximaData.toISOString(), cor: 'yellow', info: 'Você tem interação agendada para hoje', difDias: diferencaEmDias }
		} else if ( diferencaEmDias < 0 ) {
			return { proxima: proximaData.toISOString(), cor: '#FC0707', info: `Você tem interação que já passou, a data agendada era ${ proximaData.toLocaleDateString() }`, difDias: diferencaEmDias }
		} else {
			return { proxima: proximaData.toISOString(), cor: '#3B2DFF', info: `Você tem interação agendada para ${ proximaData.toLocaleDateString() }`, difDias: diferencaEmDias }
		}
	}, [ calcularDiferencaEmDias ] )

	// Função auxiliar para obter prioridade da cor da interação
	const getPrioridadeCorInteracao = ( cor: string | undefined ): number => {
		if ( !cor ) return 2 // Sem ícone (cinza)
		if ( cor === '#FC0707' || cor === 'red' ) return 0 // Vermelho - mais alta prioridade
		if ( cor === 'yellow' || cor === '#EAB308' ) return 1 // Amarelo
		if ( cor === '#3B2DFF' || cor === 'blue' || cor === 'rgb(0,100,255)' ) return 3 // Azul - menor prioridade
		return 2 // Sem ícone (cinza) - padrão
	}

	// Função auxiliar para obter prioridade do purchaseFrequency
	const getPrioridadePurchaseFrequency = ( frequency: string | null | undefined ): number => {
		if ( frequency === 'Mensalmente' ) return 0
		if ( frequency === 'Eventualmente' ) return 1
		if ( frequency === 'Raramente' ) return 2
		return 3 // Sem frequência definida
	}

	// Função auxiliar para obter status do negócio e sua prioridade
	const getStatusNegocio = ( empresa: any, username: string ): { status: string, prioridade: number } => {
		const negocios = empresa.attributes.businesses?.data || []

		// Filtrar negócios concluídos (etapa === 6)
		const negociosConcluidos = negocios.filter( ( n: any ) => n.attributes.etapa === 6 )
			.sort( ( a: any, b: any ) => {
				const dataA = a.attributes.date_conclucao ? new Date( a.attributes.date_conclucao ).getTime() : 0
				const dataB = b.attributes.date_conclucao ? new Date( b.attributes.date_conclucao ).getTime() : 0
				return dataB - dataA
			} )

		// Filtrar negócios em andamento (andamento === 3 e etapa !== 6)
		const negociosAtivos = negocios.filter( ( n: any ) =>
			n.attributes.andamento === 3 &&
			n.attributes.etapa !== 6 &&
			n.attributes.vendedor_name === username
		)

		if ( negociosConcluidos.length > 0 ) {
			const ultimoNegocio = negociosConcluidos[ 0 ]
			if ( ultimoNegocio.attributes.andamento === 5 ) {
				return { status: 'Ganhos', prioridade: 0 } // Ganhos - mais alta prioridade
			}
			if ( ultimoNegocio.attributes.andamento === 1 ) {
				return { status: 'Perdidos', prioridade: 2 } // Perdidos
			}
		}

		if ( negociosAtivos.length > 0 ) {
			return { status: 'Em andamento', prioridade: 1 } // Em andamento
		}

		return { status: 'Sem negócios', prioridade: 3 } // Sem negócios - menor prioridade
	}

	// Função para obter dias até expiração (retorna número grande se não houver data)
	const getDiasAteExpiracao = ( expiresIn: string | null | undefined ): number => {
		if ( !expiresIn ) return 999999 // Sem data de expiração vem por último
		try {
			const dataExpiracao = parseISO( expiresIn )
			const agora = new Date()
			return differenceInDays( dataExpiracao, agora )
		} catch {
			return 999999
		}
	}

	// Função para obter valor do negócio (retorna 0 se não houver negócio)
	const getValorNegocio = ( empresa: any, username: string ): number => {
		const negocios = empresa.attributes.businesses?.data || []

		if ( negocios.length === 0 ) return 0

		// Filtrar negócios concluídos (etapa === 6) e ordenar por data_conclucao (mais recente primeiro)
		const negociosConcluidos = negocios.filter( ( n: any ) => n.attributes.etapa === 6 )
			.sort( ( a: any, b: any ) => {
				const dataA = a.attributes.date_conclucao ? new Date( a.attributes.date_conclucao ).getTime() : 0
				const dataB = b.attributes.date_conclucao ? new Date( b.attributes.date_conclucao ).getTime() : 0
				return dataB - dataA
			} )

		// Filtrar negócios em andamento (andamento === 3 e etapa !== 6)
		const negociosAtivos = negocios.filter( ( n: any ) =>
			n.attributes.andamento === 3 &&
			n.attributes.etapa !== 6 &&
			n.attributes.vendedor_name === username
		)

		// Priorizar: Ganhos > Em andamento > Perdidos
		if ( negociosConcluidos.length > 0 ) {
			const ultimoNegocio = negociosConcluidos[ 0 ]
			if ( ultimoNegocio.attributes.andamento === 5 ) {
				// Negócio ganho - usar Budget ou totalGeral do primeiro pedido
				const pedidos = ultimoNegocio.attributes.pedidos?.data || []
				const valor = ultimoNegocio.attributes.Budget ||
					( pedidos.length > 0 ? pedidos[ 0 ]?.attributes?.totalGeral : null )

				if ( !valor ) return 0

				// Converter para número se for string
				if ( typeof valor === 'string' ) {
					const valorLimpo = valor.replace( /\./g, '' ).replace( ',', '.' )
					const valorNumerico = parseFloat( valorLimpo )
					return isNaN( valorNumerico ) ? 0 : valorNumerico
				}

				return parseFloat( valor ) || 0
			}
			if ( ultimoNegocio.attributes.andamento === 1 ) {
				// Negócio perdido
				const pedidos = ultimoNegocio.attributes.pedidos?.data || []
				const valor = ultimoNegocio.attributes.Budget ||
					( pedidos.length > 0 ? pedidos[ 0 ]?.attributes?.totalGeral : null )

				if ( !valor ) return 0

				if ( typeof valor === 'string' ) {
					const valorLimpo = valor.replace( /\./g, '' ).replace( ',', '.' )
					const valorNumerico = parseFloat( valorLimpo )
					return isNaN( valorNumerico ) ? 0 : valorNumerico
				}

				return parseFloat( valor ) || 0
			}
		}

		if ( negociosAtivos.length > 0 ) {
			// Negócio em andamento
			const primeiroNegocioAtivo = negociosAtivos[ 0 ]
			const valor = primeiroNegocioAtivo.attributes.Budget || null

			if ( !valor ) return 0

			if ( typeof valor === 'string' ) {
				const valorLimpo = valor.replace( /\./g, '' ).replace( ',', '.' )
				const valorNumerico = parseFloat( valorLimpo )
				return isNaN( valorNumerico ) ? 0 : valorNumerico
			}

			return parseFloat( valor ) || 0
		}

		return 0
	}

	// Função para ordenar empresas com base nos novos critérios
	const ordenarEmpresas = ( empresas: any[], username: string, ordem: "relevancia" | "expiracao" = "relevancia" ): any[] => {
		// Se ordenação por expiração, confiar na ordenação da API (que já vem globalmente ordenada)
		if ( ordem === "expiracao" ) {
			return empresas;
		}

		return [ ...empresas ].sort( ( a, b ) => {
			// Se ordenação por relevância, aplicar todos os critérios (somente localmente pois envolve dados processados)
			// 1. Prioridade da cor da interação
			const corA = typeof a.attributes.interacaos?.data === 'object' && a.attributes.interacaos?.data?.cor
				? a.attributes.interacaos.data.cor
				: undefined
			const corB = typeof b.attributes.interacaos?.data === 'object' && b.attributes.interacaos?.data?.cor
				? b.attributes.interacaos.data.cor
				: undefined

			const prioridadeCorA = getPrioridadeCorInteracao( corA )
			const prioridadeCorB = getPrioridadeCorInteracao( corB )

			if ( prioridadeCorA !== prioridadeCorB ) {
				return prioridadeCorA - prioridadeCorB
			}

			// 2. Prioridade do purchaseFrequency
			const freqA = a.attributes.purchaseFrequency
			const freqB = b.attributes.purchaseFrequency

			const prioridadeFreqA = getPrioridadePurchaseFrequency( freqA )
			const prioridadeFreqB = getPrioridadePurchaseFrequency( freqB )

			if ( prioridadeFreqA !== prioridadeFreqB ) {
				return prioridadeFreqA - prioridadeFreqB
			}

			// 3. Status do negócio
			const statusA = getStatusNegocio( a, username )
			const statusB = getStatusNegocio( b, username )

			if ( statusA.prioridade !== statusB.prioridade ) {
				return statusA.prioridade - statusB.prioridade
			}

			// 4. Data de expiração (mais próxima primeiro)
			const diasA = getDiasAteExpiracao( a.attributes.expiresIn )
			const diasB = getDiasAteExpiracao( b.attributes.expiresIn )

			if ( diasA !== diasB ) {
				return diasA - diasB
			}

			// 5. Valor do negócio (do maior para o menor)
			const valorA = getValorNegocio( a, username )
			const valorB = getValorNegocio( b, username )

			if ( valorA !== valorB ) {
				return valorB - valorA // Ordenar decrescente (maior primeiro)
			}

			// Empate: ordenar alfabeticamente por nome
			const nomeA = a.attributes.nome.toLowerCase()
			const nomeB = b.attributes.nome.toLowerCase()
			return nomeA.localeCompare( nomeB )
		} )
	}

	// Função para processar empresas com vendedor
	const processarEmpresasComVendedor = useCallback( ( empresasData: any[], username: string, dataAtual: Date, isAdmin: boolean ) => {
		// Para admin, mostrar todas as empresas com vendedor
		// Para usuários normais, filtrar apenas suas próprias empresas
		const filtroVendedor = isAdmin
			? empresasData.filter( f => f.attributes.user.data !== null )
			: empresasData.filter( f => f.attributes.user.data?.attributes.username === username )

		// Processar interações e ordenar
		const processados = filtroVendedor.map( empresa => {
			const interacoes = empresa.attributes.interacaos.data
			const interacoesVendedor = interacoes.filter( ( interacao: any ) =>
				interacao.attributes.vendedor_name === username
			)
			const ultimaInteracao = interacoesVendedor[ interacoesVendedor.length - 1 ]

			const infoInteracao = processarInteracao( ultimaInteracao, dataAtual )

			return {
				id: empresa.id,
				attributes: {
					...empresa.attributes,
					interacaos: {
						data: ultimaInteracao ? {
							id: ultimaInteracao.id,
							proxima: infoInteracao.proxima,
							cor: infoInteracao.cor,
							info: infoInteracao.info,
							descricao: ultimaInteracao.attributes?.descricao || null,
							tipo: ultimaInteracao.attributes?.tipo || null,
							objetivo: ultimaInteracao.attributes?.objetivo || null,
							vendedor_name: ultimaInteracao.attributes?.vendedor_name || null,
							createdAt: ultimaInteracao.attributes?.createdAt || null,
						} : []
					},
					diferencaEmDias: infoInteracao.difDias,
				},
			}
		} )

		// Retornar empresas sem ordenação aqui - a ordenação será aplicada no useMemo localmente
		return processados
	}, [ processarInteracao ] )

	// Função para processar empresas sem vendedor
	const processarEmpresasSemVendedor = useCallback( ( empresasData: any[], username: string, isAdmin: boolean, dataAtual: Date ) => {
		// Filtrar empresas sem vendedor ou não pertencentes ao usuário atual
		const filtroSemVendedor = empresasData.filter( f => {
			if ( !isAdmin ) {
				return f.attributes.user.data?.attributes.username == null
			} else {
				return f.attributes.user.data?.attributes.username !== username
			}
		} )

		// Encontrar empresas sem vendedor mas com interações do usuário atual
		const empresasComInteracoesDoUsuario = filtroSemVendedor
			.filter( empresa => {
				const interacoes = empresa.attributes.interacaos.data
				return interacoes.some( ( interacao: any ) =>
					interacao.attributes.vendedor_name === username
				)
			} )
			.map( empresa => {
				const interacoes = empresa.attributes.interacaos.data
				const ultimaInteracao = interacoes[ interacoes.length - 1 ]

				const infoInteracao = processarInteracao( ultimaInteracao, dataAtual )

				return {
					id: empresa.id,
					attributes: {
						...empresa.attributes,
						interacaos: {
							data: {
								id: ultimaInteracao?.id,
								proxima: infoInteracao.proxima,
								cor: infoInteracao.cor,
								info: infoInteracao.info,
								vendedor_name: ultimaInteracao?.attributes.vendedor_name,
								descricao: ultimaInteracao?.attributes?.descricao || null,
								tipo: ultimaInteracao?.attributes?.tipo || null,
								objetivo: ultimaInteracao?.attributes?.objetivo || null,
								createdAt: ultimaInteracao?.attributes?.createdAt || null,
							},
						},
						diferencaEmDias: infoInteracao.difDias,
					},
				}
			} )

		// Empresas sem interações ou com interações de outros vendedores
		const empresasSemInteracoes = filtroSemVendedor.filter( f =>
			f.attributes.interacaos.data.length === 0
		).map( empresa => {
			return {
				id: empresa.id,
				attributes: {
					...empresa.attributes,
					interacaos: {
						data: []
					},
					diferencaEmDias: 500,
				},
			}
		} )

		const empresasComInteracoesDeOutros = filtroSemVendedor
			.filter( empresa => {
				const interacoes = empresa.attributes.interacaos.data
				return interacoes.length > 0 && !interacoes.some( ( interacao: any ) =>
					interacao.attributes.vendedor_name === username
				)
			} )
			.map( empresa => {
				// Processar interação mesmo que seja de outro vendedor (para ter a cor)
				const interacoes = empresa.attributes.interacaos.data
				const ultimaInteracao = interacoes[ interacoes.length - 1 ]
				const infoInteracao = processarInteracao( ultimaInteracao, dataAtual )

				return {
					id: empresa.id,
					attributes: {
						...empresa.attributes,
						interacaos: {
							data: {
								id: ultimaInteracao?.id,
								proxima: infoInteracao.proxima,
								cor: infoInteracao.cor,
								info: infoInteracao.info,
								vendedor_name: ultimaInteracao?.attributes.vendedor_name,
								descricao: ultimaInteracao?.attributes?.descricao || null,
								tipo: ultimaInteracao?.attributes?.tipo || null,
								objetivo: ultimaInteracao?.attributes?.objetivo || null,
								createdAt: ultimaInteracao?.attributes?.createdAt || null,
							},
						},
						diferencaEmDias: infoInteracao.difDias,
					},
				}
			} )

		// Combinar todas as empresas sem vendedor
		const todasEmpresas = [ ...empresasComInteracoesDoUsuario, ...empresasSemInteracoes, ...empresasComInteracoesDeOutros ]

		// Retornar empresas sem ordenação aqui - a ordenação será aplicada no useMemo localmente
		return todasEmpresas
	}, [ processarInteracao ] )

	// Carregar vendedores
	const carregarVendedores = useCallback( async () => {
		try {
			const res = await axios.get( '/api/db/user/getGeral' )
			setVendedores( res.data || [] )
		} catch ( error ) {
			console.error( "Erro ao carregar vendedores:", error )
		}
	}, [] )

	// Carregar empresas com vendedor (minha carteira)
	const carregarEmpresasComVendedor = useCallback( async ( pagina = 1 ) => {
		if ( !session?.user.id ) return

		setCarregandoVendedor( true )
		try {
			const userId = filtroVendedorId || ( isAdmin ? '' : session.user.id )
			const endpoint = `/api/db/empresas/empresalist/vendedor?userId=${ userId }&page=${ pagina }&filtro=${ encodeURIComponent( filtroTexto ) }&filtroCNAE=${ encodeURIComponent( filtroCNAE ) }&sort=${ ordemClassificacao }`

			const res = await axios( endpoint )
			const dataAtual = startOfDay( new Date() )
			const processados = processarEmpresasComVendedor( res.data.data, session.user.name, dataAtual, isAdmin )

			const novoTotal = Math.ceil( res.data.meta.pagination.total / res.data.meta.pagination.pageSize )
			
			setEmpresasComVendedor( processados )
			// Atualizar total de páginas apenas após atualizar os dados
			setTotalPaginasComVendedor( novoTotal )
		} catch ( error ) {
			console.error( "Erro ao carregar empresas com vendedor:", error )
			toast( {
				title: 'Erro',
				description: 'Erro ao carregar sua carteira de empresas',
				status: 'error',
				duration: 5000,
				isClosable: true,
			} )
		} finally {
			setCarregandoVendedor( false )
		}
	}, [ session?.user.id, session?.user.name, processarEmpresasComVendedor, toast, isAdmin, filtroTexto, filtroCNAE, filtroVendedorId, ordemClassificacao ] )

	// Carregar empresas sem vendedor (carteira ausente)
	const carregarEmpresasSemVendedor = useCallback( async ( pagina = 1, filtro = "" ) => {
		if ( !session?.user.id ) return

		setCarregandoSemVendedor( true )
		try {
			const res = await axios( `/api/db/empresas/empresalist/ausente?page=${ pagina }&filtro=${ encodeURIComponent( filtro ) }&filtroCNAE=${ encodeURIComponent( filtroCNAE ) }&sort=${ ordemClassificacao }` )
			const dataAtual = startOfDay( new Date() )
			const isAdmin = session.user.pemission === 'Adm'

			const processados = processarEmpresasSemVendedor( res.data.data, session.user.name, isAdmin, dataAtual )

			const novoTotal = Math.ceil( res.data.meta.pagination.total / res.data.meta.pagination.pageSize )
			
			setEmpresasSemVendedor( processados )
			setTotalPaginasSemVendedor( novoTotal )
		} catch ( error ) {
			console.error( "Erro ao carregar empresas sem vendedor:", error )
			toast( {
				title: 'Erro',
				description: 'Erro ao carregar empresas sem carteira definida',
				status: 'error',
				duration: 5000,
				isClosable: true,
			} )
		} finally {
			setCarregandoSemVendedor( false )
		}
	}, [ session?.user.id, session?.user.name, session?.user.pemission, processarEmpresasSemVendedor, toast, filtroCNAE, ordemClassificacao ] )

	// Carregar dados iniciais - apenas carregar vendedores e marcar como inicializado
	useEffect( () => {
		if ( session?.user.id && !inicializadoRef.current ) {
			inicializadoRef.current = true
			carregarVendedores()
			// Os carregamentos de empresas serão disparados pelos effects que dependem de paginaAtual e filtros
		}
	}, [ session?.user.id, carregarVendedores ] )

	// Carregar empresas com vendedor quando mudar paginação, filtro de texto, filtro de CNAE ou filtro de vendedor
	// NOTA: ordemClassificacao recarrega da API
	// IMPORTANTE: Ignorar se ainda não foi inicializado para evitar conflito com useEffect inicial
	useEffect( () => {
		if ( session?.user.id && inicializadoRef.current ) {
			carregarEmpresasComVendedor( paginaAtualComVendedor )
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ paginaAtualComVendedor, filtroTexto, filtroCNAE, filtroVendedorId, ordemClassificacao, session?.user.id ] )

	// Carregar empresas sem vendedor quando mudar paginação, filtro de texto ou filtro de CNAE
	// NOTA: ordemClassificacao recarrega da API
	// IMPORTANTE: Ignorar se ainda não foi inicializado para evitar conflito com useEffect inicial
	useEffect( () => {
		if ( session?.user.id && inicializadoRef.current ) {
			carregarEmpresasSemVendedor( paginaAtualSemVendedor, filtroTexto )
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ paginaAtualSemVendedor, filtroTexto, filtroCNAE, ordemClassificacao, session?.user.id ] )

	// Filtrar e ordenar empresas com vendedor localmente
	const empresasComVendedorFiltradas = useMemo( () => {
		if ( !session?.user?.name ) return empresasComVendedor
		// Aplicar ordenação localmente aos dados já carregados
		return ordenarEmpresas( empresasComVendedor, session.user.name, ordemClassificacao )
	}, [ empresasComVendedor, ordemClassificacao, session?.user?.name ] )

	// Aplicar ordenação localmente nas empresas sem vendedor
	const empresasSemVendedorOrdenadas = useMemo( () => {
		if ( !session?.user?.name ) return empresasSemVendedor
		// Aplicar ordenação localmente aos dados já carregados
		return ordenarEmpresas( empresasSemVendedor, session.user.name, ordemClassificacao )
	}, [ empresasSemVendedor, ordemClassificacao, session?.user?.name ] )

	// Garantir que a página atual não seja maior que o total de páginas
	// Só ajustar quando o total mudar E a página atual for maior que o novo total
	// NÃO ajustar quando a página mudar (isso evita loops)
	useEffect( () => {
		// Apenas atualizar o ref para o valor atual do total de páginas
		prevTotalPaginasComVendedor.current = totalPaginasComVendedor
	}, [ totalPaginasComVendedor ] )

	useEffect( () => {
		// Apenas atualizar o ref para o valor atual do total de páginas
		prevTotalPaginasSemVendedor.current = totalPaginasSemVendedor
	}, [ totalPaginasSemVendedor ] )

	// Função para lidar com mudança de ordenação
	const handleOrdemClassificacaoChange = useCallback( ( novaOrdem: "relevancia" | "expiracao" ) => {
		setOrdemClassificacao( novaOrdem )
		// Resetar paginação ao mudar ordenação para começar do início da nova ordenação
		setPaginaAtualComVendedor( 1 )
		setPaginaAtualSemVendedor( 1 )
	}, [] )

	// Função para lidar com mudança de filtro de vendedor
	const handleFiltroVendedorChange = useCallback( ( vendedorId: string ) => {
		setFiltroVendedorId( vendedorId )
		setPaginaAtualComVendedor( 1 )
	}, [] )

	// Função para migrar carteira em massa
	const handleMigrarCarteira = useCallback( async () => {
		if ( !novoVendedorId ) {
			toast( {
				title: 'Atenção',
				description: 'Selecione um vendedor para migrar a carteira',
				status: 'warning',
				duration: 5000,
				isClosable: true,
			} )
			return
		}

		if ( !filtroVendedorId ) {
			toast( {
				title: 'Atenção',
				description: 'Selecione um vendedor para filtrar antes de migrar',
				status: 'warning',
				duration: 5000,
				isClosable: true,
			} )
			return
		}

		if ( filtroVendedorId === novoVendedorId ) {
			toast( {
				title: 'Atenção',
				description: 'O vendedor de origem e destino não podem ser os mesmos',
				status: 'warning',
				duration: 5000,
				isClosable: true,
			} )
			return
		}

		const empresaIds = empresasComVendedorFiltradas.map( emp => emp.id )

		if ( empresaIds.length === 0 ) {
			toast( {
				title: 'Atenção',
				description: 'Nenhuma empresa encontrada para migrar',
				status: 'warning',
				duration: 5000,
				isClosable: true,
			} )
			return
		}

		setMigrando( true )
		try {
			const novoVendedor = vendedores.find( v => v.id === Number( novoVendedorId ) )
			const response = await axios.post( '/api/db/empresas/migrate-vendedor', {
				empresaIds,
				novoVendedorId,
				vendedorName: session?.user.name || 'Sistema',
			} )

			if ( response.data.success ) {
				toast( {
					title: 'Sucesso',
					description: `${ response.data.updated } empresa(s) migrada(s) com sucesso para ${ novoVendedor?.username || 'novo vendedor' }`,
					status: 'success',
					duration: 7000,
					isClosable: true,
				} )

				// Recarregar dados
				carregarEmpresasComVendedor( paginaAtualComVendedor )
				setFiltroVendedorId( "" )
				setNovoVendedorId( "" )
				onCloseMigrate()
			} else {
				toast( {
					title: 'Atenção',
					description: `${ response.data.updated } empresa(s) migrada(s), ${ response.data.failed } falha(s)`,
					status: 'warning',
					duration: 7000,
					isClosable: true,
				} )
			}
		} catch ( error: any ) {
			console.error( "Erro ao migrar carteira:", error )
			toast( {
				title: 'Erro',
				description: error.response?.data?.error || 'Erro ao migrar carteira',
				status: 'error',
				duration: 7000,
				isClosable: true,
			} )
		} finally {
			setMigrando( false )
		}
	}, [ novoVendedorId, filtroVendedorId, empresasComVendedorFiltradas, vendedores, session?.user.name, toast, carregarEmpresasComVendedor, paginaAtualComVendedor, onCloseMigrate ] )

	// Função para lidar com o filtro de empresas
	const handleFiltroEmpresa = useCallback( ( searchText: string ) => {
		setFiltroTexto( prev => {
			if ( prev === searchText ) return prev
			setPaginaAtualSemVendedor( 1 )
			setPaginaAtualComVendedor( 1 )
			return searchText
		} )
	}, [] )

	// Efeito para mostrar aviso para empresas que pertencem a outros vendedores quando o filtro muda
	useEffect( () => {
		if ( filtroTexto && !isAdmin ) {
			const empresasDeOutrosVendedores = [ ...empresasComVendedor, ...empresasSemVendedor ].filter( item =>
				item.attributes.nome.toLowerCase().includes( filtroTexto.toLowerCase() ) &&
				item.attributes.user.data?.attributes.username !== session?.user.name &&
				item.attributes.user.data !== null
			)

			empresasDeOutrosVendedores.forEach( empresa => {
				const vendedor = empresa.attributes.user.data?.attributes.username
				toast( {
					title: 'Opss',
					description: `O cliente ${ empresa.attributes.nome }, pertence ao(à) vendedor(a) ${ vendedor }`,
					status: 'warning',
					duration: 9000,
					isClosable: true,
					position: 'top-right',
				} )
			} )
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ filtroTexto, isAdmin, session?.user.name, toast ] )

	// Função para lidar com o filtro de CNAE
	const handleFiltroCNAE = useCallback( ( cnaeText: string ) => {
		setFiltroCNAE( prev => {
			if ( prev === cnaeText ) return prev
			setPaginaAtualSemVendedor( 1 )
			setPaginaAtualComVendedor( 1 )
			return cnaeText
		} )
		// Atualizar o valor do input quando chamado externamente (ex: ao clicar no badge)
		if ( filtroCNAERef.current ) {
			filtroCNAERef.current.setValue( cnaeText )
		}
	}, [] )

	// Estado local para inputs de paginação (para evitar resets durante digitação)
	const [ inputPaginaComVendedor, setInputPaginaComVendedor ] = useState<string>( "1" )
	const [ inputPaginaSemVendedor, setInputPaginaSemVendedor ] = useState<string>( "1" )

	// Sincronizar inputs locais com estado de paginação
	useEffect( () => {
		setInputPaginaComVendedor( paginaAtualComVendedor.toString() )
	}, [ paginaAtualComVendedor ] )

	useEffect( () => {
		setInputPaginaSemVendedor( paginaAtualSemVendedor.toString() )
	}, [ paginaAtualSemVendedor ] )

	// Função para mudar de página para empresas sem vendedor
	const handlePaginacaoSemVendedor = useCallback( ( novaPagina: number ) => {
		setPaginaAtualSemVendedor( novaPagina )
	}, [] )

	// Função para mudar de página para empresas com vendedor
	const handlePaginacaoComVendedor = useCallback( ( novaPagina: number ) => {
		setPaginaAtualComVendedor( novaPagina )
	}, [] )

	return (
		<>
			<Box w={ '100%' } h={ '100%' } bg={ 'gray.800' } color={ 'white' } px={ 5 } py={ 2 } fontSize={ '0.8rem' } display="flex" flexDirection="column">
				<Heading size={ 'lg' }>Empresas</Heading>
				<Flex w={ '100%' } py={ '1rem' } justifyContent={ 'space-between' } flexDir={ 'row' } alignItems={ 'self-end' } px={ 6 } gap={ 6 } borderBottom={ '1px' } borderColor={ 'white' } mb={ '1rem' }>
					<Flex gap={ 4 } alignItems={ 'flex-end' }>
						<Box>
							<FiltroEmpresa empresa={ handleFiltroEmpresa } />
						</Box>
						<Box>
							<FiltroCNAE ref={ filtroCNAERef } cnae={ handleFiltroCNAE } />
						</Box>
						<Box>
							<FormLabel fontSize="xs" fontWeight="md">
								Ordenar por
							</FormLabel>
							<Select
								size="sm"
								borderColor="white"
								focusBorderColor="white"
								rounded="md"
								value={ ordemClassificacao }
								onChange={ ( e ) => handleOrdemClassificacaoChange( e.target.value as "relevancia" | "expiracao" ) }
								w="150px"
							>
								<option value="relevancia" style={ { backgroundColor: "#1A202C", color: 'white' } }>Relevância</option>
								<option value="expiracao" style={ { backgroundColor: "#1A202C", color: 'white' } }>Data de expiração</option>
							</Select>
						</Box>
						{ isAdmin && (
							<Box>
								<FormLabel fontSize="xs" fontWeight="md">
									Filtrar por Vendedor
								</FormLabel>
								<Select
									size="sm"
									borderColor="white"
									focusBorderColor="white"
									rounded="md"
									value={ filtroVendedorId }
									onChange={ ( e ) => handleFiltroVendedorChange( e.target.value ) }
									placeholder="Todos os vendedores"
									w="200px"
								>
									{ vendedores.map( ( vendedor: any ) => (
										<option key={ vendedor.id } value={ vendedor.id } style={ { backgroundColor: "#1A202C", color: 'white' } }>
											{ vendedor.username }
										</option>
									) ) }
								</Select>
							</Box>
						) }
						{ isAdmin && filtroVendedorId && empresasComVendedorFiltradas.length > 0 && (
							<Button size={ 'sm' } onClick={ onOpenMigrate } colorScheme="orange">
								Migrar Carteira ({ empresasComVendedorFiltradas.length })
							</Button>
						) }
					</Flex>
					<Button size={ 'sm' } onClick={ () => router.push( '/empresas/cadastro' ) } colorScheme="green">+ Nova Empresa</Button>
				</Flex>
				<Tabs colorScheme="blue" w={ '100%' } flex="1" display="flex" flexDirection="column" overflowY="auto" variant="unstyled" index={ tabIndex } onChange={ setTabIndex }>
					<Flex justifyContent="space-between" alignItems="flex-end" mb={ 0 } borderBottom="2px solid #ffffff">
						<TabList flex="1" borderBottom="none">
							<Tab
								fontWeight="semibold"
								bg="transparent"
								borderColor="rgba(255, 255, 255, 0.5)"
								borderBottom="none"
								_selected={ { bg: 'blue.600', color: 'white', borderTop: '2px solid #ffffff', borderLeft: '2px solid #ffffff', borderRight: '2px solid #ffffff', borderBottom: 'none' } }
							>
								Todas as empresas com vendedor
							</Tab>
							<Tab
								fontWeight="semibold"
								bg="transparent"
								borderColor="rgba(255, 255, 255, 0.5)"
								borderBottom="none"
								_selected={ { bg: 'blue.600', color: 'white', borderTop: '2px solid #ffffff', borderLeft: '2px solid #ffffff', borderRight: '2px solid #ffffff', borderBottom: 'none' } }
							>
								Empresas sem carteira definida
							</Tab>
						</TabList>
						<Box pb={ 2 }>
							{ tabIndex === 0 ? (
								totalPaginasComVendedor <= 1 ? null : (
									<Flex alignItems="flex-end" justifyContent="flex-end">
										<HStack spacing={ 2 }>
											<Button
												size="xs"
												bg="#2b6cb0"
												color="white"
												_hover={ { bg: '#2c5282' } }
												_active={ { bg: '#2a4365' } }
												_disabled={ { bg: '#1a365d', opacity: 0.5, cursor: 'not-allowed' } }
												onClick={ () => handlePaginacaoComVendedor( Math.max( 1, paginaAtualComVendedor - 1 ) ) }
												isDisabled={ paginaAtualComVendedor === 1 || carregandoVendedor }
											>
												<FaAngleDoubleLeft />
											</Button>
											<Text fontSize="xs">Ir para página:</Text>
											<Input
												type="number"
												min={ 1 }
												max={ totalPaginasComVendedor }
												size="xs"
												width="50px"
												textAlign="center"
												borderRadius="md"
												value={ inputPaginaComVendedor }
												onChange={ ( e: React.ChangeEvent<HTMLInputElement> ) => {
													const value = e.target.value
													setInputPaginaComVendedor( value )
													const num = parseInt( value, 10 )
													if ( !isNaN( num ) && num >= 1 && num <= totalPaginasComVendedor ) {
														handlePaginacaoComVendedor( num )
													}
												} }
												onKeyPress={ ( e: React.KeyboardEvent<HTMLInputElement> ) => {
													if ( e.key === 'Enter' ) {
														const num = parseInt( ( e.target as HTMLInputElement ).value, 10 )
														if ( !isNaN( num ) && num >= 1 && num <= totalPaginasComVendedor ) {
															handlePaginacaoComVendedor( num )
														} else {
															setInputPaginaComVendedor( paginaAtualComVendedor.toString() )
														}
													}
												} }
												onBlur={ ( e: React.FocusEvent<HTMLInputElement> ) => {
													const num = parseInt( e.target.value, 10 )
													if ( isNaN( num ) || num < 1 || num > totalPaginasComVendedor ) {
														setInputPaginaComVendedor( paginaAtualComVendedor.toString() )
													}
												} }
											/>
											<Text fontSize="xs">de { totalPaginasComVendedor }</Text>
											<Button
												size="xs"
												bg="#2b6cb0"
												color="white"
												_hover={ { bg: '#2c5282' } }
												_active={ { bg: '#2a4365' } }
												_disabled={ { bg: '#1a365d', opacity: 0.5, cursor: 'not-allowed' } }
												onClick={ () => handlePaginacaoComVendedor( Math.min( totalPaginasComVendedor, paginaAtualComVendedor + 1 ) ) }
												isDisabled={ paginaAtualComVendedor === totalPaginasComVendedor || carregandoVendedor }
											>
												<FaAngleDoubleRight />
											</Button>
										</HStack>
									</Flex>
								)
							) : (
								totalPaginasSemVendedor <= 1 ? null : (
									<Flex alignItems="flex-end" justifyContent="flex-end">
										<HStack spacing={ 2 }>
											<Button
												size="xs"
												bg="#2b6cb0"
												color="white"
												_hover={ { bg: '#2c5282' } }
												_active={ { bg: '#2a4365' } }
												_disabled={ { bg: '#1a365d', opacity: 0.5, cursor: 'not-allowed' } }
												onClick={ () => handlePaginacaoSemVendedor( Math.max( 1, paginaAtualSemVendedor - 1 ) ) }
												isDisabled={ paginaAtualSemVendedor === 1 || carregandoSemVendedor }
											>
												<FaAngleDoubleLeft />
											</Button>
											<Text fontSize="xs">Ir para página:</Text>
											<Input
												type="number"
												min={ 1 }
												max={ totalPaginasSemVendedor }
												size="xs"
												width="50px"
												textAlign="center"
												borderRadius="md"
												value={ inputPaginaSemVendedor }
												onChange={ ( e: React.ChangeEvent<HTMLInputElement> ) => {
													const value = e.target.value
													setInputPaginaSemVendedor( value )
													const num = parseInt( value, 10 )
													if ( !isNaN( num ) && num >= 1 && num <= totalPaginasSemVendedor ) {
														handlePaginacaoSemVendedor( num )
													}
												} }
												onKeyPress={ ( e: React.KeyboardEvent<HTMLInputElement> ) => {
													if ( e.key === 'Enter' ) {
														const num = parseInt( ( e.target as HTMLInputElement ).value, 10 )
														if ( !isNaN( num ) && num >= 1 && num <= totalPaginasSemVendedor ) {
															handlePaginacaoSemVendedor( num )
														} else {
															setInputPaginaSemVendedor( paginaAtualSemVendedor.toString() )
														}
													}
												} }
												onBlur={ ( e: React.FocusEvent<HTMLInputElement> ) => {
													const num = parseInt( e.target.value, 10 )
													if ( isNaN( num ) || num < 1 || num > totalPaginasSemVendedor ) {
														setInputPaginaSemVendedor( paginaAtualSemVendedor.toString() )
													}
												} }
											/>
											<Text fontSize="xs">de { totalPaginasSemVendedor }</Text>
											<Button
												size="xs"
												bg="#2b6cb0"
												color="white"
												_hover={ { bg: '#2c5282' } }
												_active={ { bg: '#2a4365' } }
												_disabled={ { bg: '#1a365d', opacity: 0.5, cursor: 'not-allowed' } }
												onClick={ () => handlePaginacaoSemVendedor( Math.min( totalPaginasSemVendedor, paginaAtualSemVendedor + 1 ) ) }
												isDisabled={ paginaAtualSemVendedor === totalPaginasSemVendedor || carregandoSemVendedor }
											>
												<FaAngleDoubleRight />
											</Button>
										</HStack>
									</Flex>
								)
							) }
						</Box>
					</Flex>

					<TabPanels flex="1" overflowY="auto" sx={ {
						'&::-webkit-scrollbar': {
							width: '10px',
						},
						'&::-webkit-scrollbar-track': {
							background: '#1A202C',
						},
						'&::-webkit-scrollbar-thumb': {
							background: '#4A5568',
							borderRadius: '5px',
						},
						'&::-webkit-scrollbar-thumb:hover': {
							background: '#718096',
						},
					} }>
						<TabPanel px={ 0 } py={ 4 }>
							<CarteiraVendedor
								filtro={ empresasComVendedorFiltradas }
								isLoading={ carregandoVendedor }
								showVendedor={ isAdmin }
								paginaAtual={ paginaAtualComVendedor }
								totalPaginas={ totalPaginasComVendedor }
								onChangePagina={ handlePaginacaoComVendedor }
								onFilterByCNAE={ handleFiltroCNAE }
							/>
						</TabPanel>
						<TabPanel px={ 0 } py={ 4 }>
							<CarteiraAusente
								filtro={ empresasSemVendedorOrdenadas }
								isLoading={ carregandoSemVendedor }
								paginaAtual={ paginaAtualSemVendedor }
								totalPaginas={ totalPaginasSemVendedor }
								onChangePagina={ handlePaginacaoSemVendedor }
								onFilterByCNAE={ handleFiltroCNAE }
							/>
						</TabPanel>
					</TabPanels>
				</Tabs>

				{/* Modal de Migração de Carteira */ }
				<Modal isOpen={ isOpenMigrate } onClose={ onCloseMigrate } size="md">
					<ModalOverlay />
					<ModalContent bg="gray.800" color="white">
						<ModalHeader>Migrar Carteira de Vendedor</ModalHeader>
						<ModalBody>
							<Text mb={ 4 }>
								Você está prestes a migrar { empresasComVendedorFiltradas.length } empresa(s) do vendedor selecionado.
							</Text>
							<FormLabel fontSize="sm" fontWeight="md" mt={ 4 }>
								Selecione o novo vendedor:
							</FormLabel>
							<Select
								size="sm"
								borderColor="white"
								focusBorderColor="white"
								rounded="md"
								value={ novoVendedorId }
								onChange={ ( e ) => setNovoVendedorId( e.target.value ) }
								placeholder="Selecione um vendedor"
								mt={ 2 }
							>
								{ vendedores
									.filter( ( v: any ) => v.id !== Number( filtroVendedorId ) )
									.map( ( vendedor: any ) => (
										<option key={ vendedor.id } value={ vendedor.id } style={ { backgroundColor: "#1A202C", color: 'white' } }>
											{ vendedor.username }
										</option>
									) ) }
							</Select>
						</ModalBody>
						<ModalFooter>
							<Button colorScheme="gray" mr={ 3 } onClick={ onCloseMigrate } isDisabled={ migrando }>
								Cancelar
							</Button>
							<Button
								colorScheme="orange"
								onClick={ handleMigrarCarteira }
								isLoading={ migrando }
								isDisabled={ !novoVendedorId }
							>
								Migrar Carteira
							</Button>
						</ModalFooter>
					</ModalContent>
				</Modal>
			</Box>
		</>
	)
}

export default Empresas
