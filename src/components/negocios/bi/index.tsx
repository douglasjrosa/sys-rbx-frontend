import { EtapasNegocio } from "@/components/data/etapa";
import { SelectUser } from "@/components/painel/calendario/select/SelecUser"
import { Box, Flex, Table, TableContainer, Tbody, Td, Tfoot, Th, Thead, Tr, chakra } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { Ausente } from "./ausente";
import { Presente } from "./presente";
import { useRouter } from "next/router";
import Loading from "@/components/elements/loading";
import { getAllDaysOfMonth } from "@/function/Datearray";
import axios from "axios";
import { useSession } from "next-auth/react";
import { NovoCliente } from "./novo";
import { SelectEmpresas } from "@/components/painel/calendario/select/selectEmpresas";
import { BtCreate } from "../component/butonCreate";
import { SetValue } from "@/function/currenteValor";
import { StatusAndamento } from "@/components/data/status";


export const PowerBi = (props: { reload: boolean; dados: any; user: any; setdados: number }) => {
  const router = useRouter()
  const { data: session } = useSession();
  const [data, setData] = useState([])
  const [User, setUser] = useState('')
  const [load, setLoad] = useState<boolean>(true);

  useEffect(() => {
    setLoad(props.reload)
    const filtro = props.dados.filter((c: any) => c.attributes.etapa !== 6)
    const filtro1 = filtro.filter((c: any) => c.attributes.andamento !== 5)
    setData(filtro1);
  }, [props.dados, props.reload])

  const DateAt = new Date()
  const MesAt = DateAt.getMonth() + 1;

  useEffect(() => {
    (async () => {
      // setLoad(true)
      const usuario: any = session?.user.name
      setUser(usuario);
      const daysOfMonth = await getAllDaysOfMonth(MesAt);

      const dataAtual = new Date();
      const primeiroDiaTresMesesAtras = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 3, 1);
      const ultimoDiaMesAtual = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 3, 0);

      await axios.get(`/api/db/business/get/calendar/list?DataIncicio=${primeiroDiaTresMesesAtras.toISOString()}&DataFim=${ultimoDiaMesAtual.toISOString()}&Vendedor=${User}`)
        .then((response) => {
          const filtro = response.data.filter((c: any) => c.attributes.etapa !== 6)
          const filtro1 = filtro.filter((c: any) => c.attributes.andamento !== 5)
          setData(filtro1);
          setTimeout(() => setLoad(false), 1500)
        })
        .catch((error: any) => {
          console.log(error);
        })
    })();
  }, [MesAt, props, session?.user.name])

  // Função de comparação
  function compararPorNomeEIdade(a: any, b: any) {

    const etapaA = a.attributes.etapa;
    const etapaB = b.attributes.etapa;

    if (etapaA > etapaB) {
      return -1;
    }
    if (etapaA < etapaB) {
      return 1;
    }

    const andaA = a.attributes.andamento;
    const andaB = b.attributes.andamento;

    if (andaA > andaB) {
      return -1;
    }
    if (andaA < andaB) {
      return 1;
    }

    const BudgetA =!a.attributes.Budget? 0.0 : parseFloat(a.attributes.Budget.replace(/[^0-9,]/g, "").replace(".", "").replace(",", "."));
    const BudgetB =!b.attributes.Budget? 0.0 : parseFloat(b.attributes.Budget.replace(/[^0-9,]/g, "").replace(".", "").replace(",", "."));

    return BudgetB - BudgetA;
  }

  // Reorganizar o array por ordem alfabética pelo nome e pelos valores numéricos em ordem decrescente
  data.sort(compararPorNomeEIdade);

  function handleUserChange(user: React.SetStateAction<any>) {
    (async () => {
      const usuario = user
      setUser(usuario)
      const daysOfMonth = await getAllDaysOfMonth(MesAt);
      const dataAtual = new Date();
      const primeiroDiaTresMesesAtras = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 3, 1);
      const ultimoDiaMesAtual = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 3, 0);

      await axios.get(`/api/db/business/get/calendar/list?DataIncicio=${primeiroDiaTresMesesAtras.toISOString()}&DataFim=${ultimoDiaMesAtual.toISOString()}&Vendedor=${User}`)
        .then((response) => {
          const filtro = response.data.filter((c: any) => c.attributes.etapa !== 6)
          const filtro1 = filtro.filter((c: any) => c.attributes.andamento !== 5)
          setData(filtro1);
          setLoad(false);
        })
        .catch((error: any) => {
          console.log(error);
        })
    })();
  }

  function handleEnpresa(enpresa: React.SetStateAction<any>) {
    if (enpresa) {
      setData(enpresa)
    } else {
      (async () => {
        const usuario = User
        const daysOfMonth = await getAllDaysOfMonth(MesAt);
        const dataAtual = new Date();
      const primeiroDiaTresMesesAtras = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 3, 1);
      const ultimoDiaMesAtual = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 3, 0);

      await axios.get(`/api/db/business/get/calendar/list?DataIncicio=${primeiroDiaTresMesesAtras.toISOString()}&DataFim=${ultimoDiaMesAtual.toISOString()}&Vendedor=${User}`)
          .then((response) => {
            const filtro = response.data.filter((c: any) => c.attributes.etapa !== 6)
            const filtro1 = filtro.filter((c: any) => c.attributes.andamento !== 5)
            setData(filtro1);
            setLoad(false);
          })
          .catch((error: any) => {
            console.log(error);
          })
      })();
    }
  }

  function tragetReload(Loading: boolean) {
    // setLoad(Loading);
    if (Loading === true) {
      setLoad(true);
      (async () => {
        const usuario: any = session?.user.name
        setUser(usuario);
        const daysOfMonth = await getAllDaysOfMonth(MesAt);
        const dataAtual = new Date();
      const primeiroDiaTresMesesAtras = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 3, 1);
      const ultimoDiaMesAtual = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 3, 0);

      await axios.get(`/api/db/business/get/calendar/list?DataIncicio=${primeiroDiaTresMesesAtras.toISOString()}&DataFim=${ultimoDiaMesAtual.toISOString()}&Vendedor=${User}`)
          .then((response) => {
            const filtro = response.data.filter((c: any) => c.attributes.etapa !== 6)
            const filtro1 = filtro.filter((c: any) => c.attributes.andamento !== 5)
            setData(filtro1);
            setLoad(false);
          })
          .catch((error: any) => {
            console.log(error);
          })
      })();
    }
  }

  if (load) {
    return (
      <>
        <Box w={'100%'} h={'100%'}>
          <Loading size="200px">Carregando...</Loading>
        </Box>
      </>
    );
  }

  return (
    <>
      <Box w={'100%'}>
        <Flex px={5} mt={5} mb={10} justifyContent={'space-between'} w={'100%'}>
          <Flex gap={16}>
            <Box>
              <SelectUser onValue={handleUserChange} />
            </Box>
            <Box>
              <SelectEmpresas Usuario={User} onValue={handleEnpresa} />
            </Box>
          </Flex>

          <BtCreate onLoading={tragetReload} user={User} />

        </Flex>
        <Box w='100%' display={{ lg: 'flex', sm: 'block' }} p={{ lg: 3, sm: 5 }}>
          <Box w={{ lg: '60%', sm: '100%' }} bg={'#ffffff12'} px={4} rounded={5}>

            <Flex direction={'column'} w={'100%'} my='5'>
              <chakra.span fontSize={'20px'} fontWeight={'medium'} color={'white'}>Funil de vendas</chakra.span>
            </Flex>
            <Box>
              <TableContainer pb='2'>
                <Table variant='simple'>
                  <Thead bg={'gray.600'}>
                    <Tr>
                      <Th color={'white'} borderBottom={'none'} w={'29px'}>Empresa</Th>
                      <Th color={'white'} borderBottom={'none'} w={'13rem'}>Etapa</Th>
                      <Th color={'white'} borderBottom={'none'} w={'9rem'}>Status</Th>
                      <Th color={'white'} borderBottom={'none'} w={'9rem'}>Valor</Th>
                      <Th color={'white'} borderBottom={'none'} w={'9rem'}>Retornar em</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {data.map((itens: any) => {
                      const statusAtual = itens.attributes.andamento
                      const [statusRepresente] = StatusAndamento.filter((i: any) => i.id == statusAtual).map((e: any)=> e.title);
                      const etapa = EtapasNegocio.filter((e: any) => e.id == itens.attributes.etapa).map((e: any) => e.title)

                      const colorLine = itens.attributes.DataRetorno <= new Date().toISOString() ? 'red.600' : '';

                      const dataDed = new Date(itens.attributes.DataRetorno)
                      dataDed.setDate(dataDed.getDate() + 1);
                      const dataFormatada = dataDed.toLocaleDateString('pt-BR');

                      return (
                        <>
                          <Tr key={itens.id} onClick={() => router.push(`/negocios/${itens.id}`)} cursor={'pointer'}>
                            <Td color={'white'} fontSize={'12px'} borderBottom={'1px solid #CBD5E0'}>{itens.attributes.empresa.data?.attributes.nome}</Td>
                            <Td color={'white'} fontSize={'12px'} borderBottom={'1px solid #CBD5E0'}>{etapa}</Td>
                            <Td color={'white'} fontSize={'12px'} borderBottom={'1px solid #CBD5E0'}>{statusRepresente}</Td>
                            <Td color={'white'} fontSize={'12px'} borderBottom={'1px solid #CBD5E0'}>{SetValue(itens.attributes.Budget)}</Td>
                            <Td color={'white'} bg={colorLine} fontSize={'12px'} borderBottom={'1px solid #CBD5E0'}>{dataFormatada}</Td>
                          </Tr>
                        </>
                      )
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>

          </Box>
          <Flex w={{ lg: '50%', sm: '100%' }} p={{ lg: 3, sm: 1 }} gap={{ lg: 3, sm: 1 }} direction={'column'}>
            <Box w={{ lg: '83%', sm: '100%' }} bg={'red.600'} p={2} rounded={5}>
              <Flex direction={'column'} w={'100%'}>
                <chakra.span fontSize={'20px'} fontWeight={'medium'} color={'white'}>Clientes em Inatividade</chakra.span>
              </Flex>
              <Box>
                <TableContainer>
                  <Table>
                    <Thead bg={'red.400'}>
                      <Tr>
                        <Th color='white' border={'none'} w={{ sm: '60%', lg: '40%' }} textAlign={'center'}>Empresa</Th>
                        <Th color='white' border={'none'} textAlign={'center'}>última compra</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Ausente user={User} />
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>

            <Box w={{ lg: '83%', sm: '100%' }} bg={'green.600'} p={2} rounded={5}>
              <Flex direction={'column'} w={'100%'}>
                <chakra.span fontSize={'20px'} fontWeight={'medium'} color={'white'}>Clientes novos</chakra.span>
              </Flex>
              <Box>
                <TableContainer>
                  <Table>
                    <Thead bg={'green.500'}>
                      <Tr>
                        <Th color={'white'} border={'none'} w={{ sm: '60%', lg: '40%' }} textAlign={'center'}>Empresa</Th>
                        <Th color={'white'} border={'none'} textAlign={'center'}>Data de entrada</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <NovoCliente user={User} />
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>

            </Box>
            <Box w={{ lg: '83%', sm: '100%' }} bg={'blue.600'} p={2} rounded={5}>
              <Flex direction={'column'} w={'100%'}>
                <chakra.span fontSize={'20px'} fontWeight={'medium'} color={'white'}>Clientes recuperados</chakra.span>
              </Flex>
              <Box>
                <TableContainer>
                  <Table>
                    <Thead bg={'blue.400'}>
                      <Tr>
                        <Th color={'white'} border={'none'} textAlign={'center'}>Empresa</Th>
                        <Th color={'white'} border={'none'} textAlign={'center'}>valor de compra</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Presente user={User} />
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>

            </Box>
          </Flex>
        </Box>
      </Box>
    </>
  )
}
