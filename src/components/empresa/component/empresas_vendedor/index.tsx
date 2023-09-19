import Loading from "@/components/elements/loading";
import { encontrarObjetoMaisProximoComCor } from "@/function/aviso";
import { Box, Flex, Heading } from "@chakra-ui/react"
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { HiChatBubbleLeftRight } from "react-icons/hi2";
import { FaMoneyBillAlt } from "react-icons/fa";


export const CarteiraVendedor = (props: {filtro: any }) => {
  const [Data, setData] = useState<any | null>(null);
  const [Interacao, setInteracao] = useState<any | null>(null);
  const { data: session } = useSession()
  const router = useRouter()
  


  useEffect(() => {
    if (props.filtro.status === 1) {
      setData(props.filtro.data)
    } else {
      (async () => {
        try {
          const request = await fetch(`/api/db/empresas/getEmpresamin/vendedor?EMPRESAS=true&Vendedor=${session?.user.name}`);
          const dados = await request.json();
          setData(dados)
          const requestInt = await fetch(`/api/db/empresas/interacoes`);
          const dadosInt = await requestInt.json();
          setInteracao(dadosInt)
        } catch (error) {
          console.error("Erro ao buscar dados:", error);
        }
      })()
    }
  }, [props.filtro, session?.user.name])



  const filter = (empresa: string) => {
    const interacaolist = !Interacao ? [] : Interacao?.filter((f: any) => f.attributes?.vendedor.data?.attributes.username === session?.user?.name && f.attributes?.empresa.data?.attributes.nome === empresa)
    return interacaolist
  }

  const BodyTabela = !!Data && Data.map((i: any) => {
    const empresa = i.attributes.nome

    const negocio = i.attributes.businesses.data.length > 0 ? i.attributes.businesses.data : []

    const iconeTest = negocio.filter((n: any) => {
      if (n.attributes.andamento === 3 && n.attributes.etapa !== 6) {
        return true
      } else {
        return false
      }
    });

    const interacaolist = filter(empresa)
    const interacao = encontrarObjetoMaisProximoComCor(interacaolist)
    

    return (
      <>
        <tr key={i.id} style={{ borderBottom: '1px solid #ffff', cursor: 'pointer' }} onClick={() => {
          router.push(`/empresas/CNPJ/${i.id}`)
        }}>
          <td style={{ padding: '0.3rem 1.2rem' }}>{i.attributes.nome}</td>
          <td style={{ padding: '0.3rem 1.2rem' }}>{!!interacao && (
            <Flex w={'100%'} justifyContent={'center'}>
              {i.attributes.interacaos.data.length === 0 ? null : (<HiChatBubbleLeftRight color={interacao.cor} fontSize={'1.5rem'} />)}
            </Flex>
          )}</td>
          <td style={{ padding: '0.3rem 1.2rem' }}>{iconeTest.length > 0 && (
            <Flex w={'100%'} justifyContent={'center'}>
              <FaMoneyBillAlt color={'green'} fontSize={'1.5rem'} />
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
      <Box color={'white'} w={{ base: '100%', lg: '50%' }} >
        <Heading size={'lg'}>Empresas na minha carteira</Heading>
        <Box
          mt={5}
          pe={3}
          maxH={{ base: '23rem', lg: '90%' }}
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

