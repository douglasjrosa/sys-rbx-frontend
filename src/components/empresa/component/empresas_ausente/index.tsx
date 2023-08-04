import Loading from "@/components/elements/loading";
import { Box, Flex, Heading } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { FaMoneyBillAlt } from "react-icons/fa";
import { useRouter } from "next/router";
import { encontrarObjetoMaisProximoComCor } from "@/function/aviso";
import { HiChatBubbleLeftRight } from "react-icons/hi2";



export const CarteiraAusente = (props: { data: any }) => {
  const [Data, setData] = useState<any | null>(null);
  const router = useRouter()

  if (!!props.data && !Data) {
    setData(props.data)
  }
  useEffect(() => {
  }, [props.data])

  const BodyTabela = !!Data && Data.map((i: any) => {

    const negocio = i.attributes.businesses.data.length > 0 ? i.attributes.businesses.data : []

    const iconeTest = negocio.filter((n: any) => {
      if(n.attributes.andamento === 3 && n.attributes.etapa === 1 ) {
        return true
      } else {
        return false
      }
    });

    const interacao = encontrarObjetoMaisProximoComCor(i.attributes.interacaos.data)

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
        <Heading size={'lg'}>Empresas sem carteira definida</Heading>
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
