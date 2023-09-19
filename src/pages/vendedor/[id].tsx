import { ConfigVendedor } from "@/components/vendedor/componente/form/configVendedor";
import { DadosVendedor } from "@/components/vendedor/componente/form/dadosVendedor";
import { TabelaVendasVendedor } from "@/components/vendedor/componente/form/tabelaVendedor";
import { Divider, Flex} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";



export default function VendedorId() {
  const router = useRouter()
  const [Reset, setReset] = useState(false)
  const { id } = router.query

  const hendlerUpdate = (update: any) => {
    console.log('teste',update)
    setReset(update)
  }

  return (
    <>
      <Flex w={'100%'} h={'100%'} flexDir={'column'} justifyContent={'space-between'} p={1}>

        {/* dados do vendedor */}
        <DadosVendedor id={id} />
        <Divider />

        {/* configuração de vendas */}
        <ConfigVendedor id={id} update={hendlerUpdate} />
        <Divider />

        {/* historico de vendas */}
        <TabelaVendasVendedor id={id} update={Reset} />

      </Flex>
    </>
  )
}
