import Loading from "@/components/elements/loading";
import { Box, Flex, Heading, IconButton, Table, TableContainer, Tbody, Td, Tfoot, Th, Thead, Tr, background } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import style from '@/styles/table.module.css'
import { FaMoneyBillWaveAlt } from "react-icons/fa";
import { GrEdit } from "react-icons/gr";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";



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

    const valor = !i.attributes.valor_ultima_compra ? 'R$ 0,00' : i.attributes.valor_ultima_compra

    const UltimaCompra = i.attributes.ultima_compra
    // Supondo que você tenha a data da última compra armazenada em uma variável chamada 'dataUltimaCompra'
    const dataUltimaCompra: Date = new Date(UltimaCompra); // Exemplo de data da última compra

    // Obtém a data atual
    const dataAtual: Date = new Date();

    // Calcula a diferença em milissegundos entre as duas datas
    const diferencaEmMilissegundos: number = dataAtual.getTime() - dataUltimaCompra.getTime();

    // Converte a diferença em milissegundos para dias
    const diferencaEmDias: number = Math.floor(diferencaEmMilissegundos / (1000 * 60 * 60 * 24));

    const text = !UltimaCompra ? '' : `, há ${diferencaEmDias} dias`

    return (
      <>
        <tr key={i.id} style={{ borderBottom: '1px solid #ffff' }}>
          <td style={{ padding: '0.9rem 1.2rem' }}>{i.attributes.nome}</td>
          <td style={{ padding: '0.9rem 1.2rem' }}>{valor + text}</td>
          <td style={{ padding: '0.9rem 1.2rem' }}>
            <Flex gap={3}>
              <IconButton
                colorScheme='facebook'
                aria-label='editar empresa'
                icon={<GrEdit size={'1.5rem'} />}
                onClick={() => router.push(`/empresas/atualizar/${i.id}`)}
              />
              <IconButton
                fontSize={5}
                colorScheme='green'
                aria-label='novo negocio'
                icon={<FaMoneyBillWaveAlt size={'2rem'} />}
                onClick={() => {
                  (async () => {
                    const historico = {
                      vendedor: session?.user.name,
                      date:
                        new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
                      msg: `Vendedor ${session?.user.name}, criou esse Negócio`,
                    };

                    const MSG = {
                      msg: `Vendedor ${session?.user.name}, criou esse Negócio`,
                      date: new Date().toISOString(),
                      user: "Sistema",
                    };

                    const data = {
                      status: true,
                      empresa: i.id,
                      history: historico,
                      vendedor: session?.user.id,
                      DataRetorno: dataAtual.toISOString(),
                      incidentRecord: [MSG],
                      Budget: 'R$ 0,00'
                    };
                    const url = "/api/db/business/post";
                    await axios({
                      method: "POST",
                      url: url,
                      data: data,
                    })
                      .then((res) => {
                        console.log(res.data.nBusiness);
                        router.push(`/negocios/${res.data.nBusiness}`)
                      })
                      .catch((err) => console.error(err));
                  })()
                }}
              />
            </Flex>
          </td>
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
          overflow={'auto'}
        >
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ background: '#ffffff12', borderBottom: '1px solid #ffff' }}>
                <th style={{ padding: '0.6rem 1.2rem', textAlign: 'start', width: '45%' }}>nome</th>
                <th style={{ padding: '0.6rem 1.2rem', textAlign: 'start', width: '36%' }}>Última compra</th>
                <th style={{ padding: '0.6rem 1.2rem', textAlign: 'start' }}></th>
                <th style={{ padding: '0.6rem 1.2rem', textAlign: 'start' }}></th>
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
