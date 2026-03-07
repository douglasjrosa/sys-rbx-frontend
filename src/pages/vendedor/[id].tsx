import { ConfigComissao } from "@/components/vendedor/componente/form/configComissao"
import { DadosVendedor } from "@/components/vendedor/componente/form/dadosVendedor"
import { TabelaComissao } from "@/components/vendedor/componente/form/tabelaComissao"
import { Divider, Flex } from "@chakra-ui/react"
import { useRouter } from "next/router"
import { useState } from "react"

export default function VendedorId () {
	const router = useRouter()
	const [ Reset, setReset ] = useState( false )
	const { id } = router.query

	const hendlerUpdate = () => {
		setReset( ( prev ) => !prev )
	}

	return (
		<>
			<Flex w={ '100%' } h={ '100%' } flexDir={ 'column' } justifyContent={ 'space-between' } p={ 1 }>
				<DadosVendedor id={ id } />
				<Divider />
				<ConfigComissao id={ id } update={ hendlerUpdate } />
				<Divider />
				<TabelaComissao id={ id } update={ Reset } />
			</Flex>
		</>
	)
}
