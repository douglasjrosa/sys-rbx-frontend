/* import {
	Flex,
	useToast,
} from "@chakra-ui/react"
import axios from "axios"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { FormProposta } from "@/components/Proposta/form/formProposta"
import Loading from "@/components/elements/loading"

export default function Proposta () {
	const { data: session } = useSession()
	const router = useRouter()
	const Email = session?.user.email
	const PEDIDO = router.query.pedido
	const [ loadingGeral, setLoadingGeral ] = useState<boolean>( false )
	const [ businessDataAttrs, setBusinessDataAttrs ] = useState<any | null>( null )
	const [ Bling, setBling ] = useState<string | null>( null )
	const [ prodList, setProdList ] = useState<any | null>( null )
	const [ Itens, setItens ] = useState<any | null>( null )


	const toast = useToast()


	useEffect( () => {
		( async () => {
			setLoadingGeral( true )
			try {
				const requestBusiness = await axios( `/api/db/business/get/id/${ PEDIDO }` )
				const businessDataAttrs = requestBusiness.data.attributes
				setBusinessDataAttrs( businessDataAttrs )
				
				const CNPJ = businessDataAttrs.empresa.data.attributes.CNPJ
				const getProdutos = await axios( `/api/query/get/produto/cnpj/${ CNPJ }`, { method: "POST", data: Email } )
				const RespProduto = getProdutos.data
				const [ pedido ] = businessDataAttrs.pedidos.data
				const ItensList = pedido.attributes.itens
				setItens( ItensList )
				setBling( businessDataAttrs.Bpedido )
				if ( RespProduto.length > 0 ) {
					setProdList( RespProduto )
				} else {
					toast( {
						title: "ops.",
						description: "Esta empresa não possui produtos.",
						status: "warning",
						duration: 9000,
						isClosable: true,
					} )
					router.push( `/negocios/${ PEDIDO }` )
				}
				setLoadingGeral( false )
			} catch ( error: any ) {
				toast( {
					title: "Erro.",
					description: error.response.data,
					status: "error",
					duration: 9000,
					isClosable: true,
				} )
				router.push( `/negocios/${ PEDIDO }` )
			}
		} )()
	}, [ Email, PEDIDO, router, toast ] )

	if ( Bling ) {
		router.push( `/negocios/${ PEDIDO }` )
	}

	if ( loadingGeral ) {
		return <Loading size="200px">Carregando...</Loading>
	}

	return (
		<>
			<Flex h="100vh" w="100%">
				<FormProposta businessDataAttrs={ businessDataAttrs } prodList={ prodList } ITENS={ Itens } />
			</Flex>
		</>
	)
}
 */

export default function Proposta () { return <></> }