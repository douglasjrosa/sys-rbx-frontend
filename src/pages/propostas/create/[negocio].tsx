import { Flex, useToast } from "@chakra-ui/react"
import axios from "axios"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Loading from "@/components/elements/loading"
import { FormProposta } from "@/components/Proposta/form/formProposta"
import { useSession } from "next-auth/react"

export default function Proposta () {
	const router = useRouter()
	const NNegocio = router.query.negocio
	const { data: session } = useSession()
	const [ loadingGeral, setLoadingGeral ] = useState<boolean>( false )
	const [ Data, setData ] = useState<any | null>( null )
	const [ Bling, setBling ] = useState<string | null>( null )
	const [ Produtos, setProdutos ] = useState<any | null>( null )
	const [ Itens, setItens ] = useState<any | null>( null )

	const toast = useToast()

	useEffect( () => {
		( async () => {
			setLoadingGeral( true )
			try {
				const request = await axios( `/api/db/business/get/id/${ NNegocio }` )
				const response = request.data

				const email = session?.user.email
				const CNPJ = response.attributes.empresa.data.attributes.CNPJ
				const getProdutos = await axios( `/api/query/get/produto/cnpj/${ CNPJ }`, { method: "POST", data: email } )
				const RespProduto = getProdutos.data

				const [ pedido ] = response.attributes.pedidos.data
				const ItensList = pedido?.attributes?.itens
				setItens( ItensList )
				setData( response )
				setBling( response.attributes.Bpedido )
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
					router.push( `/negocios/${ NNegocio }` )
				}
				setLoadingGeral( false )
			} catch ( error: any ) {
				console.error( error )
				toast( {
					title: "Erro.",
					description: error.response?.data,
					status: "error",
					duration: 9000,
					isClosable: true,
				} )
				router.push( `/negocios/${ NNegocio }` )
			}
		} )()
	}, [ NNegocio, router, toast, session?.user.email ] )

	if ( Bling ) {
		const [ pedidos ] = Data.attributes.pedidos.data
		const nPedido = pedidos?.attributes.nPedido
		router.push( "/propostas/update/" + nPedido )
	}

	if ( loadingGeral ) {
		return <Loading size="200px">Carregando...</Loading>
	}

	return (
		<>
			<Flex h="100vh" w="100%">
				<FormProposta ondata={ Data } produtos={ Produtos } ITENS={ Itens } envio={ "POST" } />
			</Flex>
		</>
	)
}
