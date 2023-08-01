import Loading from "@/components/elements/loading";
import { Box, Flex, Heading, IconButton, Table, TableContainer, Tbody, Td, Tfoot, Th, Thead, Tr, background } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import style from '@/styles/table.module.css'
import { FaMoneyBillAlt, FaMoneyBillWaveAlt } from "react-icons/fa";
import { GrEdit } from "react-icons/gr";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SetValue } from "@/function/currenteValor";
import { encontrarObjetoMaisProximoComCor } from "@/function/aviso";
import { HiChatBubbleLeftRight } from "react-icons/hi2";



export const CarteiraAusente = (props: { data: any }) => {
  const [Data, setData] = useState<any | null>(null);
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!!props.data) {
      setData(props.data)
    }
  }, [props.data])

  const BodyTabela = !!Data && Data.map((i: any) => {

    const negocio = i.attributes.businesses.data.length > 0 ? i.attributes.businesses.data : []

    const iconeTest = negocio.filter((n: any) => {
      if(n.attributes.andamento === 3 && n.attributes.etapa === 1) {
        return 'true'
      } else {
        return 'false'
      }
    });

    const interacao = encontrarObjetoMaisProximoComCor(i.attributes.interacaos.data)

    console.log('teste', iconeTest.length > 0)

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
        <tr key={i.id} style={{ borderBottom: '1px solid #ffff', cursor: 'pointer' }} onClick={() => router.push(`/empresas/CNPJ/${i.id}`)}>
          <td style={{ padding: '0.9rem 1.2rem' }}>{i.attributes.nome}</td>
          <td style={{ padding: '0.9rem 1.2rem' }}>{!!interacao && (
            <Flex w={'100%'} justifyContent={'center'}>
              <HiChatBubbleLeftRight color={interacao.cor} fontSize={'2rem'} />
            </Flex>
          )}</td>
          <td style={{ padding: '0.9rem 1.2rem' }}>{iconeTest.length > 0 && (
            <Flex w={'100%'} justifyContent={'center'}>
            <FaMoneyBillAlt color={'green'} fontSize={'2rem'} />
          </Flex>
          )}</td>
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
        <Heading>Empresas sem carteira definida</Heading>
        <Box
          mt={5}
          maxH={{ base: '23rem', lg: '90%' }}
          pe={3}
          overflow={'auto'}
        >
          <table style={{ width: '100%' }}>
            <thead>
            <tr style={{ background: '#ffffff12', borderBottom: '1px solid #ffff' }}>
                <th style={{ padding: '0.6rem 1.2rem', textAlign: 'start', width: '45%' }}>Nome</th>
                <th style={{ padding: '0.6rem 1.2rem', textAlign: 'start', width: '6%' }}>Interações</th>
                <th style={{ padding: '0.6rem 1.2rem', textAlign: 'start', width: '6%' }}>Negocios</th>
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
