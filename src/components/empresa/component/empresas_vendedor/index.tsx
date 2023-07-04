import Loading from "@/components/elements/loading";
import { SetValue } from "@/function/currenteValor";
import { Box, Flex, Heading, IconButton, Table, TableContainer, Tbody, Td, Tfoot, Th, Thead, Tr } from "@chakra-ui/react"
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaMoneyBillWaveAlt } from "react-icons/fa";
import { GrEdit } from "react-icons/gr";

export const CarteiraVendedor = (props: { data: any }) => {
  const [Data, setData] = useState<any | null>(null);
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!!props.data) {
      setData(props.data)
    }
  }, [props.data])

  const BodyTabela = !!Data && Data.map((i: any) => {

    const valor = SetValue(i.attributes.valor_ultima_compra)

    const UltimaCompra = i.attributes.ultima_compra
    // Supondo que você tenha a data da última compra armazenada em uma variável chamada 'dataUltimaCompra'
    const dataUltimaCompra: Date = new Date(UltimaCompra); // Exemplo de data da última compra

    // Obtém a data atual
    const dataAtual: Date = new Date();

    // Calcula a diferença em milissegundos entre as duas datas
    const diferencaEmMilissegundos: number = dataAtual.getTime() - dataUltimaCompra.getTime();

    // Converte a diferença em milissegundos para dias
    const diferencaEmDias: number = Math.floor(diferencaEmMilissegundos / (1000 * 60 * 60 * 24));

    const text = !UltimaCompra ? '' : ` - há ${diferencaEmDias} dias`

    return (
      <>
        <tr key={i.id} style={{ borderBottom: '1px solid #ffff', cursor: 'pointer' }} onClick={() => router.push(`/empresas/atualizar/${i.id}`)}>
          <td style={{ padding: '0.9rem 1.2rem' }}>{i.attributes.nome}</td>
          <td style={{ padding: '0.9rem 1.2rem' }}>{valor + text}</td>
        </tr>
      </>
    )
  })

  const Reload = (
    <Flex w={{ base: '100%', lg: '50%' }} mx={'60%'}>
      <Box>
        <Loading mt='-18vh' size="110px">Carregando...</Loading>
      </Box>
    </Flex>
  )

  return (
    <>
      <Box color={'white'} w={{ base: '100%', lg: '50%' }}>
        <Heading>Empresas na minha carteira</Heading>
        <Box
          mt={5}
          maxH={{ base: '23rem', lg: '90%' }}
          overflow={'auto'}
        >
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ background: '#ffffff12', borderBottom: '1px solid #ffff' }}>
                <th style={{ padding: '0.6rem 1.2rem', textAlign: 'start', width: '45%' }}>Nome</th>
                <th style={{ padding: '0.6rem 1.2rem', textAlign: 'start', width: '36%' }}>Última compra</th>
              </tr>
            </thead>
            <tbody>
              {!!Data && BodyTabela}
              {!Data && Reload}
            </tbody>
          </table>
        </Box>
      </Box>
    </>
  )
}
