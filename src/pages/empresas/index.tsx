import { CarteiraAusente } from "@/components/empresa/component/empresas_ausente"
import { CarteiraVendedor } from "@/components/empresa/component/empresas_vendedor"
import { FiltroEmpresa } from "@/components/empresa/component/fitro/empresa"
import { Box, Button, Flex, Heading, useToast } from "@chakra-ui/react"
import axios from "axios"
import { parseISO, startOfDay } from "date-fns"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"





function Empresas ( { dataRetorno }: any ) {
	const router = useRouter()
	const { data: session } = useSession()
	const [ Dados, setDados ] = useState<any | null>( [] )
	const [ DataSearch, setDataSearch ] = useState<any | null>( [] )
	const [ DataSearchOriginal, setDataSearchOriginal ] = useState<any | null>( [] )
	const [ DataSearchUser, setDataSearchUser ] = useState<any | null>( [] )
	const [ DataSearchUserOriginal, setDataSearchUserOriginal ] = useState<any | null>( [] )
	const [ DataTotal, setDataTotal ] = useState<any | null>( [] )
	const toast = useToast()

	useEffect( () => {

		( async () => {
			try {
				const userId = session?.user.id 
				const res = await axios( `/api/db/empresas/empresalist?userId=${ userId }` )
				const repo = res.data

				setDados( repo )
				setDataTotal( repo )
			} catch ( error ) {
				console.error( error )
				toast( {
					title: 'Erro',
					description: 'Erro ao buscar dados, ' + JSON.stringify( error ),
					status: 'error',
					duration: 9000,
					isClosable: true,
				} )
			}

		} )()

	}, [ session?.user.id, toast ] )

	useEffect( () => {
		const calcularDiferencaEmDias = ( data1: Date, data2: Date ): number => {
			const umDiaEmMilissegundos = 24 * 60 * 60 * 1000
			const data1UTC = Date.UTC( data1.getFullYear(), data1.getMonth(), data1.getDate() )
			const data2UTC = Date.UTC( data2.getFullYear(), data2.getMonth(), data2.getDate() )
			return Math.floor( ( data2UTC - data1UTC ) / umDiaEmMilissegundos )
		}

		console.log( { calcularDiferencaEmDias } )

		const processarVendedorInteracoes = ( dataAtual: Date, Dados: any ) => {
			const filtroVendedor = Dados.filter( ( f: any ) => f.attributes.user.data?.attributes.username === session?.user.name )

			const VendedorInteracaoMap = filtroVendedor.map( ( i: any ) => {
				const interacoes = i.attributes.interacaos.data
				const interacoesVendedor = interacoes.filter( ( interacao: any ) => interacao.attributes.vendedor_name === session?.user.name )
				const ultimaInteracao = interacoesVendedor[ interacoesVendedor.length - 1 ]

				if ( !ultimaInteracao ) {
					return null
				}

				const proximaData = startOfDay( parseISO( ultimaInteracao.attributes.proxima ) )
				const diferencaEmDias = calcularDiferencaEmDias( dataAtual, proximaData )

				let DifDias
				let RetornoInteracao
				if ( ultimaInteracao.attributes.status_atendimento === false ) {
					RetornoInteracao = { proxima: null, cor: 'gray', info: 'Você não tem interação agendada' }
					DifDias = 500
				} else if ( diferencaEmDias === 0 ) {
					RetornoInteracao = { proxima: proximaData.toISOString(), cor: 'yellow', info: 'Você tem interação agendada para hoje' }
					DifDias = diferencaEmDias
				} else if ( diferencaEmDias < 0 ) {
					RetornoInteracao = { proxima: proximaData.toISOString(), cor: '#FC0707', info: `Você tem interação que já passou, a data agendada era ${ proximaData.toLocaleDateString() }` }
					DifDias = diferencaEmDias
				} else {
					RetornoInteracao = { proxima: proximaData.toISOString(), cor: '#3B2DFF', info: `Você tem interação agendada para ${ proximaData.toLocaleDateString() }` }
					DifDias = diferencaEmDias
				}

				return {
					id: i.id,
					attributes: {
						...i.attributes,
						interacaos: {
							data: {
								id: ultimaInteracao?.id,
								proxima: RetornoInteracao?.proxima,
								cor: RetornoInteracao?.cor,
								info: RetornoInteracao?.info,
							},
						},
						diferencaEmDias: DifDias,
					},
				}
			} ).filter( Boolean )

			VendedorInteracaoMap.sort( ( a: any, b: any ) => {
				return a.attributes.diferencaEmDias - b.attributes.diferencaEmDias
			} )

			const VendedorInteracao0 = filtroVendedor.filter( ( f: any ) => f.attributes.interacaos.data?.length === 0 )
			const DataVendedor: any = [ ...VendedorInteracaoMap, ...VendedorInteracao0 ]

			return DataVendedor
		}


		const processarSemVendedorInteracoes = ( dataAtual: Date, Dados: any ) => {
			const filtroSemVendedor: any = Dados.filter( ( f: any ) => {
				if ( session?.user.pemission !== 'Adm' ) {
					return f.attributes.user.data?.attributes.username == null
				} else {
					return f.attributes.user.data?.attributes.username !== session?.user.name
				}
			} )

			const FiltroInteracaoVendedor = filtroSemVendedor.map( ( i: any ) => {
				const interacoes = i.attributes.interacaos.data
				const filtro = interacoes.filter( ( interacao: any ) => interacao.attributes.vendedor_name == session?.user.name )
				if ( filtro.length > 0 ) return i
			} )

			const valida = FiltroInteracaoVendedor.filter( ( f: any ) => f?.attributes?.interacaos.data?.length > 0 )


			const SemVendedorInteracaoMap = valida.map( ( i: any ) => {
				const interacoes = i.attributes.interacaos.data
				const ultimaInteracao = interacoes[ interacoes.length - 1 ]

				const proximaData = startOfDay( parseISO( ultimaInteracao.attributes.proxima ) )
				const diferencaEmDias = calcularDiferencaEmDias( dataAtual, proximaData )

				let DifDias
				let RetornoInteracao
				if ( ultimaInteracao.attributes.status_atendimento === false ) {
					RetornoInteracao = { proxima: null, cor: 'gray', info: 'Você não tem interação agendada' }
					DifDias = 500
				} else if ( diferencaEmDias === 0 ) {
					RetornoInteracao = { proxima: proximaData.toISOString(), cor: 'yellow', info: 'Você tem interação agendada para hoje' }
					DifDias = diferencaEmDias
				} else if ( diferencaEmDias < 0 ) {
					RetornoInteracao = { proxima: proximaData.toISOString(), cor: '#FC0707', info: `Você tem interação que já passou, a data agendada era ${ proximaData.toLocaleDateString() }` }
					DifDias = diferencaEmDias
				} else {
					RetornoInteracao = { proxima: proximaData.toISOString(), cor: '#3B2DFF', info: `Você tem interação agendada para ${ proximaData.toLocaleDateString() }` }
					DifDias = diferencaEmDias
				}

				return {
					id: i.id,
					attributes: {
						...i.attributes,
						interacaos: {
							data: {
								id: ultimaInteracao?.id,
								proxima: RetornoInteracao?.proxima,
								cor: RetornoInteracao?.cor,
								info: RetornoInteracao?.info,
								vendedor_name: ultimaInteracao.attributes.vendedor_name,
							},
						},
						diferencaEmDias: DifDias,
					},
				}
			} )

			SemVendedorInteracaoMap.sort( ( a: any, b: any ) => {
				return a.attributes.diferencaEmDias - b.attributes.diferencaEmDias
			} )

			const SemVendedorInteracao0 = filtroSemVendedor.filter( ( f: any ) => f.attributes.interacaos.data.length == 0 )

			const FiltroInteracaoVendedor1 = filtroSemVendedor.map( ( i: any ) => {
				const interacoes = i.attributes.interacaos.data
				const filtro = interacoes.filter( ( interacao: any ) => interacao.attributes.vendedor_name !== session?.user.name )
				if ( filtro.length > 0 ) return i
			} )
			const SemVendedorInteracao1 = FiltroInteracaoVendedor1.filter( ( f: any ) => f?.attributes.interacaos.data.length > 0 )

			const mergedArray = [ ...SemVendedorInteracao0, ...SemVendedorInteracao1 ]

			mergedArray.sort( ( a, b ) => {
				const nomeA = a.attributes.nome.toLowerCase()
				const nomeB = b.attributes.nome.toLowerCase()
				if ( nomeA < nomeB ) return -1
				if ( nomeA > nomeB ) return 1
				return 0
			} )


			const DataVendedorSemVendedor: any = [ ...SemVendedorInteracaoMap, ...mergedArray ]


			return DataVendedorSemVendedor
		}
		
		
		( async () => {
			const dataAtual = startOfDay( new Date() )
			
			const DataVendedor = processarVendedorInteracoes( dataAtual, Dados )
			const DataVendedorSemVendedor = processarSemVendedorInteracoes( dataAtual, Dados )


			setDataSearchOriginal( DataVendedorSemVendedor )
			setDataSearchUserOriginal( DataVendedor )
			setDataSearch( DataVendedorSemVendedor )
			setDataSearchUser( DataVendedor )
		} )()

	}, [ Dados, session?.user.name, session?.user.pemission ] )

	function filterEmpresa ( SearchEmpr: React.SetStateAction<any> ): any {
		const filtro = SearchEmpr.toLowerCase()

		const PesqisaArrayVendedor = DataSearchUserOriginal.filter( ( item: any ) => item.attributes.nome.toLowerCase().includes( filtro ) )
		const PesqisaArraySemVendedor = DataSearchOriginal.filter( ( item: any ) => item.attributes.nome.toLowerCase().includes( filtro ) )


		const PesqisaArrayTotal = DataTotal.filter( ( item: any ) => item.attributes.nome.toLowerCase().includes( filtro ) )

		const PesquisaTotal = PesqisaArrayTotal.filter( ( f: any ) => f.attributes.user.data?.attributes.username !== session?.user.name && f.attributes.user.data !== null )

		if ( PesquisaTotal.length > 0 && filtro !== "" ) {
			PesquisaTotal.map( ( i: any ) => {
				const vendedor = i.attributes.user.data?.attributes.username
				toast( {
					title: 'Opss',
					description: `O cliente ${ i.attributes.nome }, perece a o Vendedor(a) ${ vendedor }`,
					status: 'warning',
					duration: 9000,
					isClosable: true,
					position: 'top-right',
				} )
			} )
		}
		setDataSearchUser( PesqisaArrayVendedor )
		setDataSearch( PesqisaArraySemVendedor )
	};

	return (
		<>
			<Box w={ '100%' } h={ '100%' } bg={ 'gray.800' } color={ 'white' } px={ 5 } py={ 2 } fontSize={ '0.8rem' }>
				<Heading size={ 'lg' }>Empresas</Heading>
				<Flex w={ '100%' } py={ '1rem' } justifyContent={ 'space-between' } flexDir={ 'row' } alignItems={ 'self-end' } px={ 6 } gap={ 6 } borderBottom={ '1px' } borderColor={ 'white' } mb={ '1rem' }>
					<Box>
						<FiltroEmpresa empresa={ filterEmpresa } />
					</Box>
					<Button size={ 'sm' } onClick={ () => router.push( '/empresas/cadastro' ) } colorScheme="green">+ Nova Empresa</Button>
				</Flex>
				<Box display={ 'flex' } flexDirection={ { base: 'column', lg: 'row' } } w={ '100%' } h={ '76%' } pt={ 5 } gap={ 5 } >
					<CarteiraVendedor filtro={ DataSearchUser } />
					<CarteiraAusente filtro={ DataSearch } />
				</Box>
			</Box>
		</>
	)
}

export default Empresas
