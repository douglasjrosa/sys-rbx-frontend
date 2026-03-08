import { ConfigComissao } from "@/components/vendedor/componente/form/configComissao"
import { DadosVendedor } from "@/components/vendedor/componente/form/dadosVendedor"
import { TabelaComissao } from "@/components/vendedor/componente/form/tabelaComissao"
import { formatCompanyDisplayName } from "@/utils/formatCompanyName"
import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Box,
	Flex,
	Heading,
} from "@chakra-ui/react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import Head from "next/head"
import axios from "axios"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"

export const getServerSideProps: GetServerSideProps = async ( context ) => {
	const session = await getServerSession(
		context.req,
		context.res,
		authOptions as any
	)
	const id = context.params?.id
	const intendedUrl = `/vendedor/${ id }`

	if ( !session?.user ) {
		return {
			redirect: {
				destination: `/auth/signin?callbackUrl=${ encodeURIComponent( intendedUrl ) }`,
				permanent: false,
			},
		}
	}
	const userId = ( session.user as any )?.id
	const isAdmin = ( session.user as any )?.pemission === "Adm"
	if ( id && userId && !isAdmin && String( id ) !== String( userId ) ) {
		return { redirect: { destination: `/vendedor/${ userId }`, permanent: false } }
	}
	return { props: {} }
}

export default function VendedorId () {
	const router = useRouter()
	const { data: session } = useSession()
	const [ Reset, setReset ] = useState( false )
	const [ VendedorNome, setVendedorNome ] = useState( "" )
	const { id } = router.query
	const isAdmin = ( session?.user as any )?.pemission === "Adm"

	useEffect( () => {
		if ( !id ) return
		axios
			.get( `/api/db/user/getId/${ id }` )
			.then( ( r ) => {
				const nome = r.data?.nome || r.data?.username || ""
				const sobrenome = r.data?.sobrenome || ""
				const full = [ nome, sobrenome ].filter( Boolean ).join( " " ).trim()
				setVendedorNome( full || "Vendedor" )
			} )
			.catch( () => setVendedorNome( "" ) )
	}, [ id ] )

	const hendlerUpdate = () => {
		setReset( ( prev ) => !prev )
	}

	const pageTitle = VendedorNome
		? `Vendedor: ${ formatCompanyDisplayName( VendedorNome ) }`
		: "Vendedor"

	return (
		<>
			<Head>
				<title>{ pageTitle }</title>
			</Head>
			<Flex w="100%" minH="min-content" flexDir="column" p={ 5 } gap={ 5 }>
				<Box
					bg="whiteAlpha.50"
					borderRadius="lg"
					px={ 5 }
					py={ 3 }
					borderWidth="1px"
					borderColor="whiteAlpha.100"
				>
					<Heading size="md" flexShrink={ 0 } color="gray.200" fontWeight="semibold">
						{ pageTitle }
					</Heading>
				</Box>
				{ isAdmin && (
					<Box
						my={ 4 }
						bg="whiteAlpha.50"
						borderRadius="lg"
						borderWidth="1px"
						borderColor="whiteAlpha.100"
					>
						<Accordion
							allowMultiple
							defaultIndex={ [] }
							flexShrink={ 0 }
							reduceMotion={ false }
							sx={{ ".chakra-collapse": { overflow: "visible" } }}
						>
							<AccordionItem border="none" bg="transparent">
								<AccordionButton
									color="gray.300"
									_hover={{ bg: "whiteAlpha.80", color: "gray.100" }}
									py={ 4 }
									px={ 5 }
								>
									Dados do vendedor
									<AccordionIcon ml="auto" />
								</AccordionButton>
								<AccordionPanel pb={ 4 } px={ 5 } pt={ 0 } overflow="visible">
									<DadosVendedor id={ id } />
								</AccordionPanel>
							</AccordionItem>
							<AccordionItem border="none" borderTop="1px" borderColor="whiteAlpha.100" bg="transparent">
								<AccordionButton
									color="gray.300"
									_hover={{ bg: "whiteAlpha.80", color: "gray.100" }}
									py={ 4 }
									px={ 5 }
								>
									Configurações de comissões
									<AccordionIcon ml="auto" />
								</AccordionButton>
								<AccordionPanel pb={ 4 } px={ 5 } pt={ 0 } overflow="visible">
									<ConfigComissao id={ id } update={ hendlerUpdate } />
								</AccordionPanel>
							</AccordionItem>
						</Accordion>
					</Box>
				) }
				<Box
					bg="whiteAlpha.50"
					borderRadius="lg"
					borderWidth="1px"
					borderColor="whiteAlpha.100"
				>
					<TabelaComissao id={ id } update={ Reset } isAdmin={ isAdmin } />
				</Box>
			</Flex>
		</>
	)
}
