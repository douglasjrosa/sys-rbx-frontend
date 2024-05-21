import { Box } from '@chakra-ui/react'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import { parseISO, startOfDay } from "date-fns"
import React from 'react'


export const getServerSideProps: GetServerSideProps<{ dataRetorno: any }> = async ( context ) => {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL as string || `https://${ process.env.NEXT_PUBLIC_VERCEL_URL }`
	const res = await fetch( `${ baseUrl }/api/db/empresas/empresalist` )
	const repo = await res.json()
	const session = await getSession( { req: context.req } )

	const calcularDiferencaEmDias = ( data1: Date, data2: Date ): number => {
		const umDiaEmMilissegundos = 24 * 60 * 60 * 1000
		const data1UTC = Date.UTC( data1.getFullYear(), data1.getMonth(), data1.getDate() )
		const data2UTC = Date.UTC( data2.getFullYear(), data2.getMonth(), data2.getDate() )
		return Math.floor( ( data2UTC - data1UTC ) / umDiaEmMilissegundos )
	}

	const dataAtual = startOfDay( new Date() )
	const filtroVendedor = repo.filter( ( f: any ) => f.attributes.user.data?.attributes.username === session?.user.name )
	const VendedorInteracao = filtroVendedor.filter( ( f: any ) => f.attributes.interacaos.data?.length > 0 )

	const VendedorInteracaoMap = VendedorInteracao.map( ( i: any ) => {
		const interacao = i.attributes.interacaos.data
		const ultimaInteracao = interacao[ interacao.length - 1 ]
		const proximaData = startOfDay( parseISO( ultimaInteracao.attributes.proxima ) )
		const diferencaEmDias = calcularDiferencaEmDias( dataAtual, proximaData )

		let RetornoInteracao
		if ( diferencaEmDias === 0 ) {
			RetornoInteracao = { proxima: proximaData.toISOString(), cor: 'yellow', info: 'Você tem interação agendada para hoje' }
		} else if ( diferencaEmDias < 0 ) {
			RetornoInteracao = { proxima: proximaData.toISOString(), cor: '#FC0707', info: `Você tem interação que já passou, a data agendada era ${ proximaData.toLocaleDateString() }` }
		} else {
			RetornoInteracao = { proxima: proximaData.toISOString(), cor: '#3B2DFF', info: `Você tem interação agendada para ${ proximaData.toLocaleDateString() }` }
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
					}
				},
				diferencaEmDias: diferencaEmDias
			}
		}
	} )

	VendedorInteracaoMap.sort( ( a: any, b: any ) => {
		return a.attributes.diferencaEmDias - b.attributes.diferencaEmDias
	} )

	const VendedorInteracao0 = filtroVendedor.filter( ( f: any ) => f.attributes.interacaos.data?.length === 0 )

	const DataVendedor: any = [ ...VendedorInteracaoMap, ...VendedorInteracao0 ]





	const filtroSemVendedor = repo.filter( ( f: any ) => f.attributes.user.data?.attributes.username == null )
	const SemVendedorInteracao = filtroSemVendedor.filter( ( f: any ) => f.attributes.interacaos.data?.length > 0 )

	const SemVendedorInteracaoMap = SemVendedorInteracao.map( ( i: any ) => {
		const interacao = i.attributes.interacaos.data
		const ultimaInteracao = interacao[ interacao.length - 1 ]
		const proximaData = startOfDay( parseISO( ultimaInteracao.attributes.proxima ) )
		const diferencaEmDias = calcularDiferencaEmDias( dataAtual, proximaData )

		let RetornoInteracao
		if ( diferencaEmDias === 0 ) {
			RetornoInteracao = { proxima: proximaData.toISOString(), cor: 'yellow', info: 'Você tem interação agendada para hoje' }
		} else if ( diferencaEmDias < 0 ) {
			RetornoInteracao = { proxima: proximaData.toISOString(), cor: '#FC0707', info: `Você tem interação que já passou, a data agendada era ${ proximaData.toLocaleDateString() }` }
		} else {
			RetornoInteracao = { proxima: proximaData.toISOString(), cor: '#3B2DFF', info: `Você tem interação agendada para ${ proximaData.toLocaleDateString() }` }
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
					}
				},
				diferencaEmDias: diferencaEmDias
			}
		}
	} )

	SemVendedorInteracaoMap.sort( ( a: any, b: any ) => {
		return a.attributes.diferencaEmDias - b.attributes.diferencaEmDias
	} )

	const SemVendedorInteracao0 = filtroVendedor.filter( ( f: any ) => f.attributes.interacaos.data?.length === 0 )

	const DataVendedorSemVendedor: any = [ ...SemVendedorInteracaoMap, ...SemVendedorInteracao0 ]

	const dataRetorno = { DataVendedor, DataVendedorSemVendedor }

	return { props: { dataRetorno } }
}


export default function Tarefas ( { dataRetorno }: any ) {
	return (
		<>
			<Box> Ola </Box>
			<Box> total de empresas:{ dataRetorno.length } </Box>
			<pre>{ JSON.stringify( dataRetorno, null, 2 ) }</pre>
		</>
	)
}
