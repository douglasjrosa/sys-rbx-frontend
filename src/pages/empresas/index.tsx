import { CarteiraAusente } from "@/components/empresa/component/empresas_ausente"
import { CarteiraOutrosVendedores } from "@/components/empresa/component/empresas_outros_vendedores"
import { CarteiraVendedor } from "@/components/empresa/component/empresas_vendedor"
import { FiltroEmpresa } from "@/components/empresa/component/fitro/empresa"
import { FiltroCNAE, FiltroCNAERef } from "@/components/empresa/component/fitro/cnae"
import { FiltroCidade, FiltroCidadeRef } from "@/components/empresa/component/fitro/cidade"
import { Badge, Box, Button, Flex, Heading, useToast, Select, FormLabel, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Text, Tabs, TabList, TabPanels, Tab, TabPanel, HStack, Input } from "@chakra-ui/react"
import { FaAngleDoubleLeft, FaAngleDoubleRight } from "react-icons/fa"
import axios from "axios"
import { parseISO, startOfDay } from "date-fns"
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
	const [ empresasOutrosVendedores, setEmpresasOutrosVendedores ] = useState<any[]>( [] )

	// Estados para filtro e paginação
	const [ filtroTexto, setFiltroTexto ] = useState( "" )
	const [ filtroCNAE, setFiltroCNAE ] = useState( "" )
	const [ filtroCidade, setFiltroCidade ] = useState( "" )
	const [ filtroVendedorId, setFiltroVendedorId ] = useState<string>( "" )
	const [ ordemClassificacao, setOrdemClassificacao ] = useState<"relevancia" | "expiracao">( "relevancia" )
	const filtroCNAERef = useRef<FiltroCNAERef>( null )
	const filtroCidadeRef = useRef<FiltroCidadeRef>( null )
	const [ paginaAtualSemVendedor, setPaginaAtualSemVendedor ] = useState( 1 )
	const [ paginaAtualComVendedor, setPaginaAtualComVendedor ] = useState( 1 )
	const [ carregandoVendedor, setCarregandoVendedor ] = useState( false )
	const [ carregandoSemVendedor, setCarregandoSemVendedor ] = useState( false )
	const [ totalPaginasSemVendedor, setTotalPaginasSemVendedor ] = useState( 1 )
	const [ totalPaginasComVendedor, setTotalPaginasComVendedor ] = useState( 1 )
	const [ paginaAtualOutrosVendedores, setPaginaAtualOutrosVendedores ] = useState( 1 )
	const [ carregandoOutrosVendedores, setCarregandoOutrosVendedores ] = useState( false )
	const [ totalPaginasOutrosVendedores, setTotalPaginasOutrosVendedores ] = useState( 1 )
	const [ totalEmpresasComVendedor, setTotalEmpresasComVendedor ] = useState( 0 )
	const [ totalEmpresasSemVendedor, setTotalEmpresasSemVendedor ] = useState( 0 )
	const [ totalEmpresasOutrosVendedores, setTotalEmpresasOutrosVendedores ] = useState( 0 )
	const [ tabIndex, setTabIndex ] = useState( 0 )
	const prevTotalPaginasComVendedor = useRef( 1 )
	const prevTotalPaginasSemVendedor = useRef( 1 )
	const inicializadoRef = useRef( false )

	// Estados para vendedores e migração
	const [ vendedores, setVendedores ] = useState<any[]>( [] )
	const [ novoVendedorId, setNovoVendedorId ] = useState<string>( "" )
	const [ migrando, setMigrando ] = useState( false )
	const [ refatorandoPurchaseFrequency, setRefatorandoPurchaseFrequency ] = useState( false )
	const [ checandoExpiradas, setChecandoExpiradas ] = useState( false )
	const [ recalculandoTabelas, setRecalculandoTabelas ] = useState( false )
	const [ sincronizandoProdutos, setSincronizandoProdutos ] = useState( false )
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
		if ( !ultimaInteracao ) {
			return { proxima: null, cor: 'gray', info: 'Você não tem interação agendada', difDias: 500 }
		}

		// Função auxiliar para acessar campos que podem estar em attributes ou diretamente no objeto
		const getField = ( obj: any, field: string ) => {
			if ( !obj ) return undefined
			return obj.attributes ? obj.attributes[ field ] : obj[ field ]
		}

		const proxima = getField( ultimaInteracao, 'proxima' )
		if ( !proxima ) {
			return { proxima: null, cor: 'gray', info: 'Você não tem interação agendada', difDias: 500 }
		}

		try {
			const proximaData = startOfDay( parseISO( proxima ) )
			const diferencaEmDias = calcularDiferencaEmDias( dataAtual, proximaData )

			if ( getField( ultimaInteracao, 'status_atendimento' ) === false ) {
				return { proxima: null, cor: 'gray', info: 'Você não tem interação agendada', difDias: 500 }
			} else if ( diferencaEmDias === 0 ) {
				return { proxima: proximaData.toISOString(), cor: 'yellow', info: 'Você tem interação agendada para hoje', difDias: diferencaEmDias }
			} else if ( diferencaEmDias < 0 ) {
				return { proxima: proximaData.toISOString(), cor: '#FC0707', info: `Você tem interação que já passou, a data agendada era ${ proximaData.toLocaleDateString() }`, difDias: diferencaEmDias }
			} else {
				return { proxima: proximaData.toISOString(), cor: '#3B2DFF', info: `Você tem interação agendada para ${ proximaData.toLocaleDateString() }`, difDias: diferencaEmDias }
			}
		} catch ( error ) {
			console.error( 'Erro ao processar interação:', error, ultimaInteracao )
			return { proxima: null, cor: 'gray', info: 'Erro ao processar interação', difDias: 500 }
		}
	}, [ calcularDiferencaEmDias ] )

	// Função para processar empresas com vendedor
	const processarEmpresasComVendedor = useCallback( ( empresasData: any[], username: string, dataAtual: Date, isAdmin: boolean ) => {
		if ( !empresasData || empresasData.length === 0 ) {
			return []
		}

		// Para admin, mostrar todas as empresas com vendedor
		// Para usuários normais, filtrar apenas suas próprias empresas
		const filtroVendedor = isAdmin
			? empresasData.filter( f => f.attributes?.user?.data !== null )
			: empresasData.filter( f => f.attributes?.user?.data?.attributes?.username === username )

		// Processar interações e ordenar
		const processados = filtroVendedor.map( empresa => {
			const interacoes = empresa.attributes?.interacaos?.data || []
			// Função auxiliar para acessar campos que podem estar em attributes ou diretamente no objeto
			const getInteracaoField = ( interacao: any, field: string ) => {
				if ( !interacao ) return undefined
				return interacao.attributes ? interacao.attributes[ field ] : interacao[ field ]
			}

			// Primeiro, tentar encontrar interações do usuário atual
			const interacoesVendedor = interacoes.filter( ( interacao: any ) =>
				getInteracaoField( interacao, 'vendedor_name' ) === username
			)
			let ultimaInteracao = interacoesVendedor[ interacoesVendedor.length - 1 ]

			// Se não houver interações do usuário, usar a última interação de qualquer vendedor
			// (especialmente útil para admin ver todas as interações)
			if ( !ultimaInteracao && interacoes.length > 0 ) {
				ultimaInteracao = interacoes[ interacoes.length - 1 ]
			}

			// Log para debug
			if ( empresa.id === filtroVendedor[ 0 ]?.id ) {
			}

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
							descricao: getInteracaoField( ultimaInteracao, 'descricao' ) || null,
							tipo: getInteracaoField( ultimaInteracao, 'tipo' ) || null,
							objetivo: getInteracaoField( ultimaInteracao, 'objetivo' ) || null,
							vendedor_name: getInteracaoField( ultimaInteracao, 'vendedor_name' ) || null,
							createdAt: getInteracaoField( ultimaInteracao, 'createdAt' ) || null,
						} : null
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
		// Função auxiliar para acessar campos que podem estar em attributes ou diretamente no objeto
		const getInteracaoField = ( interacao: any, field: string ) => {
			if ( !interacao ) return undefined
			return interacao.attributes ? interacao.attributes[ field ] : interacao[ field ]
		}

		// Confiar no filtro do backend para empresas ausentes
		const filtroSemVendedor = empresasData

		// Encontrar empresas sem vendedor mas com interações do usuário atual
		const empresasComInteracoesDoUsuario = filtroSemVendedor
			.filter( empresa => {
				const interacoes = empresa.attributes?.interacaos?.data || []
				return interacoes.some( ( interacao: any ) =>
					getInteracaoField( interacao, 'vendedor_name' ) === username
				)
			} )
			.map( empresa => {
				const interacoes = empresa.attributes?.interacaos?.data || []
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
								vendedor_name: getInteracaoField( ultimaInteracao, 'vendedor_name' ),
								descricao: getInteracaoField( ultimaInteracao, 'descricao' ) || null,
								tipo: getInteracaoField( ultimaInteracao, 'tipo' ) || null,
								objetivo: getInteracaoField( ultimaInteracao, 'objetivo' ) || null,
								createdAt: getInteracaoField( ultimaInteracao, 'createdAt' ) || null,
							},
						},
						diferencaEmDias: infoInteracao.difDias,
					},
				}
			} )

		// Empresas sem interações ou com interações de outros vendedores
		const empresasSemInteracoes = filtroSemVendedor.filter( f => {
			const interacoes = f.attributes?.interacaos?.data || []
			return interacoes.length === 0
		} ).map( empresa => {
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
				const interacoes = empresa.attributes?.interacaos?.data || []
				return interacoes.length > 0 && !interacoes.some( ( interacao: any ) =>
					getInteracaoField( interacao, 'vendedor_name' ) === username
				)
			} )
			.map( empresa => {
				// Processar interação mesmo que seja de outro vendedor (para ter a cor)
				const interacoes = empresa.attributes?.interacaos?.data || []
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
								vendedor_name: getInteracaoField( ultimaInteracao, 'vendedor_name' ),
								descricao: getInteracaoField( ultimaInteracao, 'descricao' ) || null,
								tipo: getInteracaoField( ultimaInteracao, 'tipo' ) || null,
								objetivo: getInteracaoField( ultimaInteracao, 'objetivo' ) || null,
								createdAt: getInteracaoField( ultimaInteracao, 'createdAt' ) || null,
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
			// Filtrar apenas vendedores confirmados
			const vendedoresConfirmados = ( res.data || [] ).filter( ( v: any ) => v.confirmed === true )
			setVendedores( vendedoresConfirmados )
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
			const endpoint = `/api/db/empresas/empresalist/vendedor?userId=${ userId }&page=${ pagina }&filtro=${ encodeURIComponent( filtroTexto ) }&filtroCNAE=${ encodeURIComponent( filtroCNAE ) }&filtroCidade=${ encodeURIComponent( filtroCidade ) }&sort=${ ordemClassificacao }`

			const res = await axios( endpoint )

			const dataAtual = startOfDay( new Date() )
			const empresasData = Array.isArray( res.data?.data ) ? res.data.data : []

			const processados = processarEmpresasComVendedor( empresasData, session.user.name, dataAtual, isAdmin )

			const pagination = res.data?.meta?.pagination
			const total = pagination?.total ?? empresasData.length
			const pageSizeMeta = pagination?.pageSize ?? 50
			const novoTotal = total > 0 ? Math.ceil( total / pageSizeMeta ) : 1

			setEmpresasComVendedor( processados )
			setTotalEmpresasComVendedor( total )
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
	}, [ session?.user.id, session?.user.name, processarEmpresasComVendedor, toast, isAdmin, filtroTexto, filtroCNAE, filtroCidade, filtroVendedorId, ordemClassificacao ] )

	// Carregar empresas sem vendedor (carteira ausente)
	const carregarEmpresasSemVendedor = useCallback( async ( pagina = 1, filtro = "" ) => {
		if ( !session?.user.id ) return

		setCarregandoSemVendedor( true )
		try {
			const userIdParam = session?.user?.pemission === 'Adm' ? filtroVendedorId : session?.user?.id
			const userIdQuery = userIdParam ? `&userId=${ encodeURIComponent( String( userIdParam ) ) }` : ''

			// Empresas sem vendedor sempre ordenadas por relevância (não usa ordemClassificacao)
			const res = await axios(
				`/api/db/empresas/empresalist/ausente?page=${ pagina }&filtro=${ encodeURIComponent( filtro ) }&filtroCNAE=${ encodeURIComponent( filtroCNAE ) }&filtroCidade=${ encodeURIComponent( filtroCidade ) }&sort=relevancia${ userIdQuery }`
			)

			const dataAtual = startOfDay( new Date() )
			const isAdmin = session.user.pemission === 'Adm'

			const empresasData = Array.isArray( res.data?.data ) ? res.data.data : []

			const processados = processarEmpresasSemVendedor( empresasData, session.user.name, isAdmin, dataAtual )

			const pagination = res.data?.meta?.pagination
			const total = pagination?.total ?? empresasData.length
			const pageSizeMeta = pagination?.pageSize ?? 50
			const novoTotal = total > 0 ? Math.ceil( total / pageSizeMeta ) : 1

			setEmpresasSemVendedor( processados )
			setTotalEmpresasSemVendedor( total )
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
	}, [ session?.user.id, session?.user.name, session?.user.pemission, processarEmpresasSemVendedor, toast, filtroCNAE, filtroCidade, filtroVendedorId ] )

	// Carregar empresas de outros vendedores (apenas para vendedores, não admin)
	const carregarEmpresasOutrosVendedores = useCallback( async ( pagina = 1 ) => {
		if ( !session?.user.id || isAdmin ) return

		setCarregandoOutrosVendedores( true )
		try {
			const res = await axios.get(
				`/api/db/empresas/empresalist/outros-vendedores?page=${ pagina }&filtro=${ encodeURIComponent( filtroTexto ) }&filtroCNAE=${ encodeURIComponent( filtroCNAE ) }&filtroCidade=${ encodeURIComponent( filtroCidade ) }`
			)
			const empresasData = Array.isArray( res.data?.data ) ? res.data.data : []
			const pagination = res.data?.meta?.pagination
			const total = pagination?.total ?? empresasData.length
			const pageSizeMeta = pagination?.pageSize ?? 50
			const novoTotal = total > 0 ? Math.ceil( total / pageSizeMeta ) : 1

			setEmpresasOutrosVendedores( empresasData )
			setTotalEmpresasOutrosVendedores( total )
			setTotalPaginasOutrosVendedores( novoTotal )
		} catch ( error ) {
			console.error( "Erro ao carregar empresas de outros vendedores:", error )
			toast( {
				title: "Erro",
				description: "Erro ao carregar empresas de outros vendedores",
				status: "error",
				duration: 5000,
				isClosable: true,
			} )
		} finally {
			setCarregandoOutrosVendedores( false )
		}
	}, [ session?.user.id, isAdmin, toast, filtroTexto, filtroCNAE, filtroCidade ] )

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
	}, [ paginaAtualComVendedor, filtroTexto, filtroCNAE, filtroCidade, filtroVendedorId, ordemClassificacao, session?.user.id ] )

	// Carregar empresas sem vendedor quando mudar paginação, filtro de texto, filtro de CNAE ou filtro de vendedor
	// NOTA: ordemClassificacao NÃO afeta empresas sem vendedor (apenas ordenação local por nome)
	// IMPORTANTE: Ignorar se ainda não foi inicializado para evitar conflito com useEffect inicial
	useEffect( () => {
		if ( session?.user.id && inicializadoRef.current ) {
			carregarEmpresasSemVendedor( paginaAtualSemVendedor, filtroTexto )
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ paginaAtualSemVendedor, filtroTexto, filtroCNAE, filtroCidade, filtroVendedorId, session?.user.id ] )

	// Carregar empresas de outros vendedores (apenas para vendedores)
	// Lista vazia no carregamento inicial - só reage quando o campo de pesquisa é alterado
	useEffect( () => {
		if ( !session?.user.id || isAdmin ) return

		const hasFilter = Boolean(
			( filtroTexto && filtroTexto.trim() ) ||
			( filtroCNAE && filtroCNAE.trim() ) ||
			( filtroCidade && filtroCidade.trim() )
		)

		if ( hasFilter ) {
			carregarEmpresasOutrosVendedores( paginaAtualOutrosVendedores )
		} else {
			setEmpresasOutrosVendedores( [] )
			setTotalEmpresasOutrosVendedores( 0 )
			setTotalPaginasOutrosVendedores( 1 )
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ paginaAtualOutrosVendedores, filtroTexto, filtroCNAE, filtroCidade, session?.user.id, isAdmin ] )

	// Usar dados diretamente da API - ordenação já aplicada no backend
	const empresasComVendedorFiltradas = useMemo( () => {
		return empresasComVendedor
	}, [ empresasComVendedor ] )

	// Usar dados diretamente da API - ordenação já aplicada no backend
	const empresasSemVendedorOrdenadas = useMemo( () => {
		return empresasSemVendedor
	}, [ empresasSemVendedor ] )

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
		// Resetar paginação apenas para empresas com vendedor (ordenação só afeta essa aba)
		setPaginaAtualComVendedor( 1 )
	}, [] )

	// Função para lidar com mudança de filtro de vendedor
	const handleFiltroVendedorChange = useCallback( ( vendedorId: string ) => {
		setFiltroVendedorId( vendedorId )
		// Resetar paginação para ambas as abas quando o filtro mudar
		setPaginaAtualComVendedor( 1 )
		setPaginaAtualSemVendedor( 1 )
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
			setPaginaAtualOutrosVendedores( 1 )
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
			setPaginaAtualOutrosVendedores( 1 )
			return cnaeText
		} )
		// Atualizar o valor do input quando chamado externamente (ex: ao clicar no badge)
		if ( filtroCNAERef.current ) {
			filtroCNAERef.current.setValue( cnaeText )
		}
	}, [] )

	// Função para lidar com o filtro de cidade
	const handleFiltroCidade = useCallback( ( cidadeText: string ) => {
		setFiltroCidade( prev => {
			if ( prev === cidadeText ) return prev
			setPaginaAtualSemVendedor( 1 )
			setPaginaAtualComVendedor( 1 )
			setPaginaAtualOutrosVendedores( 1 )
			return cidadeText
		} )
		// Atualizar o valor do input quando chamado externamente (ex: ao clicar no badge)
		if ( filtroCidadeRef.current ) {
			filtroCidadeRef.current.setValue( cidadeText )
		}
	}, [] )

	// Função para mudar de página para empresas de outros vendedores
	const handlePaginacaoOutrosVendedores = useCallback( ( novaPagina: number ) => {
		setPaginaAtualOutrosVendedores( novaPagina )
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

	// Função para refatorar purchaseFrequency
	const handleRefatorarPurchaseFrequency = useCallback( async () => {
		setRefatorandoPurchaseFrequency( true )
		try {
			const PAGE_SIZE = 50
			let currentPage = 1
			let totalProcessed = 0
			let totalUpdated = 0
			let hasMore = true

			toast( {
				id: 'refactor-progress',
				title: 'Refatorando frequência',
				description: 'Iniciando processamento...',
				status: 'info',
				duration: null,
				isClosable: false,
			} )

			while ( hasMore ) {
				const response = await axios.post( `/api/refactory/companies/purchase-frequency?pageSize=${ PAGE_SIZE }&page=${ currentPage }` )
				const data = response.data

				totalProcessed += data.summary.processed
				totalUpdated += data.summary.updated

				const totalToProcess = data.summary.totalCompanies || totalProcessed

				toast.update( 'refactor-progress', {
					description: `Processando: ${ totalProcessed } de ${ totalToProcess } empresas... (${ totalUpdated } atualizadas)`,
				} )

				if ( data.summary.count < PAGE_SIZE || totalProcessed >= totalToProcess ) {
					hasMore = false
				} else {
					currentPage++
				}
			}

			toast.close( 'refactor-progress' )
			toast( {
				title: 'Refatoração concluída',
				description: `Sucesso: ${ totalProcessed } empresas processadas e ${ totalUpdated } atualizadas.`,
				status: 'success',
				duration: 10000,
				isClosable: true,
			} )

			// Recarregar dados das empresas
			if ( tabIndex === 0 ) {
				carregarEmpresasComVendedor( paginaAtualComVendedor )
			} else {
				carregarEmpresasSemVendedor( paginaAtualSemVendedor, filtroTexto )
			}
		} catch ( error: any ) {
			console.error( 'Erro ao refatorar purchase frequency:', error )
			toast.close( 'refactor-progress' )
			toast( {
				title: 'Erro',
				description: error.response?.data?.error || 'Erro ao refatorar frequência de compra',
				status: 'error',
				duration: 7000,
				isClosable: true,
			} )
		} finally {
			setRefatorandoPurchaseFrequency( false )
		}
	}, [ toast, tabIndex, paginaAtualComVendedor, paginaAtualSemVendedor, filtroTexto, carregarEmpresasComVendedor, carregarEmpresasSemVendedor ] )

	// Função para checar empresas expiradas
	const handleChecarExpiradas = useCallback( async () => {
		setChecandoExpiradas( true )
		try {
			const PAGE_SIZE = 100
			let currentPage = 1
			let totalProcessed = 0
			let totalUpdated = 0
			let hasMore = true

			toast( {
				id: 'check-progress',
				title: 'Checando expiradas',
				description: 'Iniciando verificação...',
				status: 'info',
				duration: null,
				isClosable: false,
			} )

			while ( hasMore ) {
				const response = await axios.get( `/api/db/empresas/check-expiration?pageSize=${ PAGE_SIZE }&page=${ currentPage }` )
				const data = response.data

				totalProcessed += data.count
				totalUpdated += data.updated

				const totalToProcess = data.total || totalProcessed

				toast.update( 'check-progress', {
					description: `Verificando: ${ totalProcessed } de ${ totalToProcess } empresas... (${ totalUpdated } expiradas)`,
				} )

				if ( data.count < PAGE_SIZE || totalProcessed >= totalToProcess ) {
					hasMore = false
				} else {
					currentPage++
				}
			}

			toast.close( 'check-progress' )
			toast( {
				title: 'Verificação concluída',
				description: `Sucesso: ${ totalProcessed } empresas verificadas e ${ totalUpdated } atualizadas (vendedor removido).`,
				status: 'success',
				duration: 10000,
				isClosable: true,
			} )

			// Recarregar dados das empresas
			if ( tabIndex === 0 ) {
				carregarEmpresasComVendedor( paginaAtualComVendedor )
			} else {
				carregarEmpresasSemVendedor( paginaAtualSemVendedor, filtroTexto )
			}
		} catch ( error: any ) {
			console.error( 'Erro ao checar empresas expiradas:', error )
			toast.close( 'check-progress' )
			toast( {
				title: 'Erro',
				description: error.response?.data?.error || 'Erro ao verificar empresas expiradas',
				status: 'error',
				duration: 7000,
				isClosable: true,
			} )
		} finally {
			setChecandoExpiradas( false )
		}
	}, [ toast, tabIndex, paginaAtualComVendedor, paginaAtualSemVendedor, filtroTexto, carregarEmpresasComVendedor, carregarEmpresasSemVendedor ] )

	// Função para recalcular tabelas de margem
	const handleRecalcularTabelas = useCallback( async () => {
		setRecalculandoTabelas( true )
		try {
			const BATCH_SIZE = 50
			let currentStart = 0
			let totalProcessed = 0
			let totalUpdated = 0
			let hasMore = true

			toast( {
				id: 'recalc-progress',
				title: 'Iniciando recálculo',
				description: 'Aguarde o processamento de todas as empresas...',
				status: 'info',
				duration: null,
				isClosable: false,
			} )

			while ( hasMore ) {
				const response = await axios.get( `/api/db/empresas/update-tablecalc?limit=${ BATCH_SIZE }&start=${ currentStart }` )
				const data = response.data

				totalProcessed += data.total
				totalUpdated += data.updated

				const totalToProcess = data.totalCount || totalProcessed

				toast.update( 'recalc-progress', {
					description: `Processando: ${ totalProcessed } de ${ totalToProcess } empresas... (${ totalUpdated } atualizadas)`,
				} )

				if ( data.total < BATCH_SIZE || totalProcessed >= totalToProcess ) {
					hasMore = false
				} else {
					currentStart += BATCH_SIZE
				}
			}

			toast.close( 'recalc-progress' )
			toast( {
				title: 'Recálculo concluído',
				description: `Sucesso: ${ totalProcessed } empresas processadas e ${ totalUpdated } atualizadas.`,
				status: 'success',
				duration: 10000,
				isClosable: true,
			} )

			// Recarregar dados das empresas
			if ( tabIndex === 0 ) {
				carregarEmpresasComVendedor( paginaAtualComVendedor )
			} else {
				carregarEmpresasSemVendedor( paginaAtualSemVendedor, filtroTexto )
			}
		} catch ( error: any ) {
			console.error( 'Erro ao recalcular tabelas:', error )
			const errorMsg = error.response?.data?.error?.message ||
				( typeof error.response?.data?.error === 'string' ? error.response.data.error : null ) ||
				( typeof error.message === 'string' ? error.message : null ) ||
				'Erro ao recalcular margens das empresas'

			const finalMsg = typeof errorMsg === 'object' ? JSON.stringify( errorMsg ) : errorMsg

			toast( {
				title: 'Erro',
				description: finalMsg,
				status: 'error',
				duration: 7000,
				isClosable: true,
			} )
		} finally {
			setRecalculandoTabelas( false )
		}
	}, [ toast, tabIndex, paginaAtualComVendedor, paginaAtualSemVendedor, filtroTexto, carregarEmpresasComVendedor, carregarEmpresasSemVendedor ] )

	// Função para sincronizar produtos da API externa para o Strapi
	const handleSincronizarProdutos = useCallback( async () => {
		setSincronizandoProdutos( true )
		try {
			const PAGE_SIZE = 50
			let currentStart = 0
			let totalProcessed = 0
			let totalCreated = 0
			let totalUpdated = 0
			let hasMore = true

			toast( {
				id: 'sync-prod-progress',
				title: 'Sincronizando Produtos',
				description: 'Iniciando sincronização para todas as empresas...',
				status: 'info',
				duration: null,
				isClosable: false,
			} )

			while ( hasMore ) {
				// 1. Obter lote de empresas do Strapi via proxy
				const companiesRes = await axios.get( `/api/db/empresas/sync-list?limit=${ PAGE_SIZE }&start=${ currentStart }` )
				const companies = companiesRes.data.data
				const totalToProcess = companiesRes.data.meta?.pagination?.total || totalProcessed

				if ( !companies || companies.length === 0 ) {
					hasMore = false
					break
				}

				// 2. Para cada empresa no lote, buscar produtos na Ribermax e salvar no Strapi
				for ( const company of companies ) {
					const cnpj = company.attributes.CNPJ
					const empresaId = company.id
					const nomeEmpresa = company.attributes.nome

					totalProcessed++

					toast.update( 'sync-prod-progress', {
						description: `Empresa ${ totalProcessed }/${ totalToProcess }: ${ nomeEmpresa }...`,
					} )

					try {
						// Buscar produtos na API externa via proxy - limite alto para pegar todos os produtos da empresa
						const prodRes = await axios.get( `/api/rbx/${ session?.user?.email }/produtos?CNPJ=${ cnpj }&limit=1000` )
						const allProducts = prodRes.data || []

						// Filtrar apenas ativos
						const activeProducts = allProducts.filter( ( p: any ) => p.ativo === "1" )

						if ( activeProducts.length > 0 ) {
							// Enviar para sincronização no Strapi via proxy
							const syncRes = await axios.post( `/api/db/produtos/sync`, {
								empresaId,
								produtos: activeProducts
							} )

							totalCreated += syncRes.data.created
							totalUpdated += syncRes.data.updated
						}
					} catch ( err ) {
						console.error( `Erro ao sincronizar empresa ${ nomeEmpresa }:`, err )
					}
				}

				if ( companies.length < PAGE_SIZE || totalProcessed >= totalToProcess ) {
					hasMore = false
				} else {
					currentStart += PAGE_SIZE
				}
			}

			toast.close( 'sync-prod-progress' )
			toast( {
				title: 'Sincronização concluída',
				description: `Sucesso: ${ totalCreated } criados e ${ totalUpdated } atualizados. Total de empresas processadas: ${ totalProcessed }.`,
				status: 'success',
				duration: 10000,
				isClosable: true,
			} )

		} catch ( error: any ) {
			console.error( 'Erro ao sincronizar produtos:', error )
			toast.close( 'sync-prod-progress' )
			toast( {
				title: 'Erro',
				description: error.response?.data?.error || error.message || 'Erro ao sincronizar produtos',
				status: 'error',
				duration: 7000,
				isClosable: true,
			} )
		} finally {
			setSincronizandoProdutos( false )
		}
	}, [ session?.user?.email, toast ] )

	return (
		<>
			<Box w={ '100%' } h={ '100%' } bg={ 'gray.800' } color={ 'white' } px={ 5 } py={ 2 } fontSize={ '0.8rem' } display="flex" flexDirection="column">
				<Heading size={ 'lg' }>Empresas</Heading>
				<Flex w={ '100%' } py={ '1rem' } justifyContent={ 'space-between' } flexDir={ 'row' } alignItems={ 'self-end' } px={ 6 } gap={ 6 } borderBottom={ '1px' } borderColor={ 'white' } mb={ '1rem' } flexWrap="wrap">
					<Flex gap={ 4 } alignItems={ 'flex-end' } flexWrap="wrap">
						<Box minW="150px" flexShrink={ 0 }>
							<FiltroEmpresa empresa={ handleFiltroEmpresa } />
						</Box>
						<Box minW="150px" flexShrink={ 0 }>
							<FiltroCNAE ref={ filtroCNAERef } cnae={ handleFiltroCNAE } />
						</Box>
						<Box minW="150px" flexShrink={ 0 }>
							<FiltroCidade ref={ filtroCidadeRef } cidade={ handleFiltroCidade } />
						</Box>
						{ tabIndex === 0 && (
							<Box minW="150px" flexShrink={ 0 }>
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
									minW="150px"
								>
									<option value="relevancia" style={ { backgroundColor: "#1A202C", color: 'white' } }>Relevância</option>
									<option value="expiracao" style={ { backgroundColor: "#1A202C", color: 'white' } }>Data de expiração</option>
								</Select>
							</Box>
						) }
						{ isAdmin && (
							<Box minW="200px" flexShrink={ 0 }>
								<FormLabel fontSize="xs" fontWeight="md">
									Filtrar por Vendedor
								</FormLabel>
								<Select
									size="sm"
									borderColor="white"
									focusBorderColor="white"
									rounded="md"
									value={ filtroVendedorId || '' }
									onChange={ ( e ) => handleFiltroVendedorChange( e.target.value ) }
									w="200px"
									minW="200px"
									sx={ {
										'& option': {
											backgroundColor: '#1A202C !important',
											color: 'white !important',
										},
										'& option:hover': {
											backgroundColor: '#2D3748 !important',
											color: 'white !important',
										},
										'& option:checked': {
											backgroundColor: '#2D3748 !important',
											color: 'white !important',
										}
									} }
								>
									<option value="" style={ { backgroundColor: "#1A202C", color: 'white' } }>
										Todos os vendedores
									</option>
									{ vendedores.map( ( vendedor: any ) => (
										<option key={ vendedor.id } value={ vendedor.id } style={ { backgroundColor: "#1A202C", color: 'white' } }>
											{ vendedor.username }
										</option>
									) ) }
								</Select>
							</Box>
						) }
						{ isAdmin && tabIndex === 0 && filtroVendedorId && empresasComVendedorFiltradas.length > 0 && (
							<Button
								size={ 'sm' }
								onClick={ onOpenMigrate }
								colorScheme="orange"
								whiteSpace="normal"
								wordBreak="break-word"
								minW="fit-content"
								flexShrink={ 0 }
							>
								Migrar Carteira ({ empresasComVendedorFiltradas.length })
							</Button>
						) }
					</Flex>
					<Flex gap={ 2 } alignItems={ 'flex-end' } flexWrap="wrap">
						{ isAdmin && (
							<>
								<Button
									size={ 'sm' }
									onClick={ handleRefatorarPurchaseFrequency }
									colorScheme="purple"
									whiteSpace="normal"
									wordBreak="break-word"
									minW="fit-content"
									flexShrink={ 0 }
									isLoading={ refatorandoPurchaseFrequency }
									loadingText="Refatorando..."
								>
									Refatorar Frequência
								</Button>
								<Button
									size={ 'sm' }
									onClick={ handleChecarExpiradas }
									colorScheme="orange"
									whiteSpace="normal"
									wordBreak="break-word"
									minW="fit-content"
									flexShrink={ 0 }
									isLoading={ checandoExpiradas }
									loadingText="Verificando..."
								>
									Checar Expiradas
								</Button>
								<Button
									size={ 'sm' }
									onClick={ handleRecalcularTabelas }
									colorScheme="blue"
									whiteSpace="normal"
									wordBreak="break-word"
									minW="fit-content"
									flexShrink={ 0 }
									isLoading={ recalculandoTabelas }
									loadingText="Recalculando..."
								>
									Recalcular Tabelas
								</Button>
								<Button
									size={ 'sm' }
									onClick={ handleSincronizarProdutos }
									colorScheme="teal"
									whiteSpace="normal"
									wordBreak="break-word"
									minW="fit-content"
									flexShrink={ 0 }
									isLoading={ sincronizandoProdutos }
									loadingText="Sincronizando..."
								>
									Sincronizar Produtos
								</Button>
							</>
						) }
						<Button
							size={ 'sm' }
							onClick={ () => router.push( '/empresas/cadastro' ) }
							colorScheme="green"
							whiteSpace="normal"
							wordBreak="break-word"
							minW="fit-content"
							flexShrink={ 0 }
						>
							+ Nova Empresa
						</Button>
					</Flex>
				</Flex>
				<Tabs colorScheme="blue" w={ '100%' } flex="1" display="flex" flexDirection="column" overflowY="auto" variant="unstyled" index={ tabIndex } onChange={ setTabIndex }>
					<Flex justifyContent="space-between" alignItems="flex-end" mb={ 0 } borderBottom="2px solid #ffffff">
						<TabList pt={2} flex="1" borderBottom="none">
							<Tab
								fontWeight="semibold"
								bg="transparent"
								borderColor="rgba(255, 255, 255, 0.5)"
								borderBottom="none"
								_selected={ { bg: 'blue.600', color: 'white', borderTop: '2px solid #ffffff', borderLeft: '2px solid #ffffff', borderRight: '2px solid #ffffff', borderBottom: 'none' } }
								position="relative"
							>
								Todas as empresas com vendedor
								{ totalEmpresasComVendedor > 0 && (
									<Badge
										position="absolute"
										top="-5px"
										right="-5px"
										bg="orange.500"
										color="white"
										borderRadius="full"
										border="1px solid white"
										fontSize="xs"
										minW="18px"
										h="18px"
										display="flex"
										alignItems="center"
										justifyContent="center"
									>
										{ totalEmpresasComVendedor }
									</Badge>
								) }
							</Tab>
							<Tab
								fontWeight="semibold"
								bg="transparent"
								borderColor="rgba(255, 255, 255, 0.5)"
								borderBottom="none"
								_selected={ { bg: 'blue.600', color: 'white', borderTop: '2px solid #ffffff', borderLeft: '2px solid #ffffff', borderRight: '2px solid #ffffff', borderBottom: 'none' } }
								position="relative"
							>
								Empresas sem carteira definida
								{ totalEmpresasSemVendedor > 0 && (
									<Badge
										position="absolute"
										top="-5px"
										right="-5px"
										bg="orange.500"
										color="white"
										borderRadius="full"
										border="1px solid white"
										fontSize="xs"
										minW="18px"
										h="18px"
										display="flex"
										alignItems="center"
										justifyContent="center"
									>
										{ totalEmpresasSemVendedor }
									</Badge>
								) }
							</Tab>
							{ !isAdmin && (
								<Tab
									fontWeight="semibold"
									bg="transparent"
									borderColor="rgba(255, 255, 255, 0.5)"
									borderBottom="none"
									_selected={ { bg: 'blue.600', color: 'white', borderTop: '2px solid #ffffff', borderLeft: '2px solid #ffffff', borderRight: '2px solid #ffffff', borderBottom: 'none' } }
									position="relative"
								>
									Outros vendedores
									{ totalEmpresasOutrosVendedores > 0 && (
										<Badge
											position="absolute"
											top="-5px"
											right="-5px"
											bg="orange.500"
											color="white"
											borderRadius="full"
											border="1px solid white"
											fontSize="xs"
											minW="18px"
											h="18px"
											display="flex"
											alignItems="center"
											justifyContent="center"
										>
											{ totalEmpresasOutrosVendedores }
										</Badge>
									) }
								</Tab>
							) }
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
							) : tabIndex === 2 ? (
								totalPaginasOutrosVendedores <= 1 ? null : (
									<Flex alignItems="flex-end" justifyContent="flex-end">
										<HStack spacing={ 2 }>
											<Button
												size="xs"
												bg="#2b6cb0"
												color="white"
												_hover={ { bg: '#2c5282' } }
												_active={ { bg: '#2a4365' } }
												_disabled={ { bg: '#1a365d', opacity: 0.5, cursor: 'not-allowed' } }
												onClick={ () => handlePaginacaoOutrosVendedores( Math.max( 1, paginaAtualOutrosVendedores - 1 ) ) }
												isDisabled={ paginaAtualOutrosVendedores === 1 || carregandoOutrosVendedores }
											>
												<FaAngleDoubleLeft />
											</Button>
											<Text fontSize="xs">Página { paginaAtualOutrosVendedores } de { totalPaginasOutrosVendedores }</Text>
											<Button
												size="xs"
												bg="#2b6cb0"
												color="white"
												_hover={ { bg: '#2c5282' } }
												_active={ { bg: '#2a4365' } }
												_disabled={ { bg: '#1a365d', opacity: 0.5, cursor: 'not-allowed' } }
												onClick={ () => handlePaginacaoOutrosVendedores( Math.min( totalPaginasOutrosVendedores, paginaAtualOutrosVendedores + 1 ) ) }
												isDisabled={ paginaAtualOutrosVendedores === totalPaginasOutrosVendedores || carregandoOutrosVendedores }
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

					<TabPanels flex="1" display="flex" flexDirection="column" minH={ 0 } sx={ {
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
						<TabPanel px={ 0 } py={ 4 } flex="1" display="flex" flexDirection="column" minH={ 0 }>
							<CarteiraVendedor
								filtro={ empresasComVendedorFiltradas }
								isLoading={ carregandoVendedor }
								showVendedor={ isAdmin }
								paginaAtual={ paginaAtualComVendedor }
								totalPaginas={ totalPaginasComVendedor }
								onChangePagina={ handlePaginacaoComVendedor }
								onFilterByCNAE={ handleFiltroCNAE }
								onFilterByCidade={ handleFiltroCidade }
							/>
						</TabPanel>
						<TabPanel px={ 0 } py={ 4 } flex="1" display="flex" flexDirection="column" minH={ 0 }>
							<CarteiraAusente
								filtro={ empresasSemVendedorOrdenadas }
								isLoading={ carregandoSemVendedor }
								paginaAtual={ paginaAtualSemVendedor }
								totalPaginas={ totalPaginasSemVendedor }
								onChangePagina={ handlePaginacaoSemVendedor }
							/>
						</TabPanel>
						{ !isAdmin && (
							<TabPanel px={ 0 } py={ 4 } flex="1" display="flex" flexDirection="column" minH={ 0 }>
								<CarteiraOutrosVendedores
									filtro={ empresasOutrosVendedores }
									isLoading={ carregandoOutrosVendedores }
									paginaAtual={ paginaAtualOutrosVendedores }
									totalPaginas={ totalPaginasOutrosVendedores }
									onChangePagina={ handlePaginacaoOutrosVendedores }
									hasSearched={ Boolean( filtroTexto?.trim() || filtroCNAE?.trim() || filtroCidade?.trim() ) }
								/>
							</TabPanel>
						) }
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
