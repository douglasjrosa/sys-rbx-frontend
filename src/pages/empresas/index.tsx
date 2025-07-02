import { CarteiraAusente } from "@/components/empresa/component/empresas_ausente"
import { CarteiraVendedor } from "@/components/empresa/component/empresas_vendedor"
import { FiltroEmpresa } from "@/components/empresa/component/fitro/empresa"
import { Box, Button, Flex, Heading, useToast } from "@chakra-ui/react"
import axios from "axios"
import { parseISO, startOfDay } from "date-fns"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useCallback, useEffect, useMemo, useState } from "react"

function Empresas () {
	const router = useRouter()
	const { data: session } = useSession()
	const toast = useToast()

	// Estados separados para cada tipo de empresa
	const [ empresasComVendedor, setEmpresasComVendedor ] = useState<any[]>( [] )
	const [ empresasSemVendedor, setEmpresasSemVendedor ] = useState<any[]>( [] )

	// Estados para filtro e paginação
	const [ filtroTexto, setFiltroTexto ] = useState( "" )
	const [ paginaAtual, setPaginaAtual ] = useState( 1 )
	const [ carregandoVendedor, setCarregandoVendedor ] = useState( false )
	const [ carregandoSemVendedor, setCarregandoSemVendedor ] = useState( false )
	const [ totalPaginas, setTotalPaginas ] = useState( 1 )

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

	// Função para processar empresas com vendedor
	const processarEmpresasComVendedor = useCallback( ( empresasData: any[], username: string, dataAtual: Date ) => {
		// Filtrar empresas do vendedor atual
		const filtroVendedor = empresasData.filter( f =>
			f.attributes.user.data?.attributes.username === username
		)

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
						} : []
					},
					diferencaEmDias: infoInteracao.difDias,
				},
			}
		} )

		// Ordenar por data da próxima interação
		processados.sort( ( a, b ) => a.attributes.diferencaEmDias - b.attributes.diferencaEmDias )

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
							},
						},
						diferencaEmDias: infoInteracao.difDias,
					},
				}
			} )

		// Ordenar por data da próxima interação
		empresasComInteracoesDoUsuario.sort( ( a, b ) => a.attributes.diferencaEmDias - b.attributes.diferencaEmDias )

		// Empresas sem interações ou com interações de outros vendedores
		const empresasSemInteracoes = filtroSemVendedor.filter( f =>
			f.attributes.interacaos.data.length === 0
		)

		const empresasComInteracoesDeOutros = filtroSemVendedor
			.filter( empresa => {
				const interacoes = empresa.attributes.interacaos.data
				return interacoes.length > 0 && !interacoes.some( ( interacao: any ) =>
					interacao.attributes.vendedor_name === username
				)
			} )

		// Combinar e ordenar alfabeticamente
		const outrasEmpresas = [ ...empresasSemInteracoes, ...empresasComInteracoesDeOutros ]
		outrasEmpresas.sort( ( a, b ) => {
			const nomeA = a.attributes.nome.toLowerCase()
			const nomeB = b.attributes.nome.toLowerCase()
			if ( nomeA < nomeB ) return -1
			if ( nomeA > nomeB ) return 1
			return 0
		} )

		// Combinar todas as empresas sem vendedor
		return [ ...empresasComInteracoesDoUsuario, ...outrasEmpresas ]
	}, [ processarInteracao ] )

	// Carregar empresas com vendedor (minha carteira)
	const carregarEmpresasComVendedor = useCallback( async () => {
		if ( !session?.user.id ) return

		setCarregandoVendedor( true )
		try {
			const res = await axios( `/api/db/empresas/empresalist/vendedor?userId=${ session.user.id }` )
			const dataAtual = startOfDay( new Date() )
			const processados = processarEmpresasComVendedor( res.data, session.user.name, dataAtual )

			setEmpresasComVendedor( processados )
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
	}, [ session?.user.id, session?.user.name, processarEmpresasComVendedor, toast ] )

	// Carregar empresas sem vendedor (carteira ausente)
	const carregarEmpresasSemVendedor = useCallback( async ( pagina = 1, filtro = "" ) => {
		if ( !session?.user.id ) return

		setCarregandoSemVendedor( true )
		try {
			const res = await axios( `/api/db/empresas/empresalist/ausente?page=${ pagina }&filtro=${ encodeURIComponent( filtro ) }` )
			const dataAtual = startOfDay( new Date() )
			const isAdmin = session.user.pemission === 'Adm'

			const processados = processarEmpresasSemVendedor( res.data.data, session.user.name, isAdmin, dataAtual )

			setEmpresasSemVendedor( processados )
			setTotalPaginas( Math.ceil( res.data.meta.pagination.total / res.data.meta.pagination.pageSize ) )
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
	}, [ session?.user.id, session?.user.name, session?.user.pemission, processarEmpresasSemVendedor, toast ] )

	// Carregar dados iniciais
	useEffect( () => {
		if ( session?.user.id ) {
			carregarEmpresasComVendedor()
			carregarEmpresasSemVendedor( paginaAtual, filtroTexto )
		}
	}, [ session?.user.id, carregarEmpresasComVendedor, carregarEmpresasSemVendedor, paginaAtual, filtroTexto ] )

	// Filtrar empresas com vendedor
	const empresasComVendedorFiltradas = useMemo( () => {
		if ( !filtroTexto ) return empresasComVendedor

		return empresasComVendedor.filter( item =>
			item.attributes.nome.toLowerCase().includes( filtroTexto.toLowerCase() )
		)
	}, [ empresasComVendedor, filtroTexto ] )

	// Função para lidar com o filtro de empresas
	const handleFiltroEmpresa = useCallback( ( searchText: string ) => {
		setFiltroTexto( searchText )
		setPaginaAtual( 1 ) // Resetar paginação ao filtrar

		// Mostrar aviso para empresas que pertencem a outros vendedores
		if ( searchText ) {
			const empresasDeOutrosVendedores = [ ...empresasComVendedor, ...empresasSemVendedor ].filter( item =>
				item.attributes.nome.toLowerCase().includes( searchText.toLowerCase() ) &&
				item.attributes.user.data?.attributes.username !== session?.user.name &&
				item.attributes.user.data !== null
			)

			empresasDeOutrosVendedores.forEach( empresa => {
				const vendedor = empresa.attributes.user.data?.attributes.username
				toast( {
					title: 'Opss',
					description: `O cliente ${ empresa.attributes.nome }, perece a o Vendedor(a) ${ vendedor }`,
					status: 'warning',
					duration: 9000,
					isClosable: true,
					position: 'top-right',
				} )
			} )
		}
	}, [ empresasComVendedor, empresasSemVendedor, session?.user.name, toast ] )

	// Função para mudar de página
	const handlePaginacao = useCallback( ( novaPagina: number ) => {
		setPaginaAtual( novaPagina )
		// Recarregar também a lista de empresas com vendedor quando mudar a página das empresas sem vendedor
		carregarEmpresasComVendedor()
	}, [ carregarEmpresasComVendedor ] )

	return (
		<>
			<Box w={ '100%' } h={ '100%' } bg={ 'gray.800' } color={ 'white' } px={ 5 } py={ 2 } fontSize={ '0.8rem' } display="flex" flexDirection="column">
				<Heading size={ 'lg' }>Empresas</Heading>
				<Flex w={ '100%' } py={ '1rem' } justifyContent={ 'space-between' } flexDir={ 'row' } alignItems={ 'self-end' } px={ 6 } gap={ 6 } borderBottom={ '1px' } borderColor={ 'white' } mb={ '1rem' }>
					<Box>
						<FiltroEmpresa empresa={ handleFiltroEmpresa } />
					</Box>
					<Button size={ 'sm' } onClick={ () => router.push( '/empresas/cadastro' ) } colorScheme="green">+ Nova Empresa</Button>
				</Flex>
				<Box
					display={ 'flex' }
					flexDirection={ { base: 'column', lg: 'row' } }
					w={ '100%' }
					flex="1"
					gap={ 5 }
					overflow="hidden"
				>
					<CarteiraVendedor
						filtro={ empresasComVendedorFiltradas }
						isLoading={ carregandoVendedor }
					/>
					<CarteiraAusente
						filtro={ empresasSemVendedor }
						isLoading={ carregandoSemVendedor }
						paginaAtual={ paginaAtual }
						totalPaginas={ totalPaginas }
						onChangePagina={ handlePaginacao }
					/>
				</Box>
			</Box>
		</>
	)
}

export default Empresas
