/* import { Flex, useToast } from "@chakra-ui/react"
import axios from "axios"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Loading from "@/components/elements/loading"
import { FormProposta } from "@/components/Proposta/form/formProposta"
import { useSession } from "next-auth/react"

export default function Proposta () {
	const router = useRouter()
	const businessId = router.query.negocio
	const { data: session } = useSession()
	const [ loadingGeral, setLoadingGeral ] = useState<boolean>( false )
	const [ businessData, setBusinessData ] = useState<any | null>( null )
	const [ orderData, setOrderData ] = useState<any | null>( null )
	const [ Bpedido, setBpedido ] = useState<string | null>( null )
	const [ Produtos, setProdutos ] = useState<any | null>( null )
	const [ Itens, setItens ] = useState<any | null>( null )

	const toast = useToast()

	useEffect( () => {
		( async () => {
			setLoadingGeral( true )
			try {
				const business = await axios( `/api/db/business/get/id/${ businessId }` )
				setBusinessData( business.data )

				const email = session?.user.email
				const CNPJ = business.data.attributes.empresa.data.attributes.CNPJ
				const getProdutos = await axios( `/api/query/get/produto/cnpj/${ CNPJ }`, { method: "POST", data: email } )
				const RespProduto = getProdutos.data

				const orderDataRequest = await fetch( `/api/strapi/pedidos?filters[businessId]=${ businessId }` ).then( r => r.json() )
				const [ orderData ] = orderDataRequest.data

				setOrderData( orderData )

				const ItensList = orderData?.attributes?.itens
				setItens( ItensList )
				setBpedido( business.data.attributes.Bpedido )
				if ( RespProduto.length > 0 ) {
					setProdutos( RespProduto )
				} else {
					toast( {
						title: "ops.",
						description: "Esta empresa não possui produtos.",
						status: "warning",
						duration: 9000,
						isClosable: true,
					} )
					router.push( `/negocios/${ businessId }` )
				}
				setLoadingGeral( false )

				if ( Bpedido ) {
					const nPedido = orderData.attributes.nPedido
					router.push( "/propostas/update/" + nPedido )
				}

			} catch ( error: any ) {
				console.error( error )
				toast( {
					title: "Erro.",
					description: error.businessData?.data,
					status: "error",
					duration: 9000,
					isClosable: true,
				} )
				router.push( `/negocios/${ businessId }` )
			}
		} )()
	}, [ businessId, router, toast, session?.user.email ] )


	if ( loadingGeral ) {
		return <Loading size="200px">Carregando...</Loading>
	}

	return (
		<>
			<Flex h="100vh" w="100%">
				<FormProposta ondata={ businessData } produtos={ Produtos } ITENS={ Itens } envio={ "POST" } />
			</Flex>
		</>
	)
}
 */

export default function Proposta(){ return <></> }