import { EtapasNegocio } from "@/components/data/etapa";
import { SelectUser } from "@/components/painel/calendario/select/SelecUser"
import { Box, Flex, IconButton, Table, TableContainer, Tbody, Td, Tfoot, Th, Thead, Tr, chakra } from "@chakra-ui/react"
import { useEffect, useState } from "react";
import { Ausente } from "./ausente";
import { Presente } from "./presente";
import { BsBoxArrowUpRight } from "react-icons/bs";
import { useRouter } from "next/router";
import Loading from "@/components/elements/loading";
import { getAllDaysOfMonth } from "@/function/Datearray";
import axios from "axios";
import { useSession } from "next-auth/react";
import { NovoCliente } from "./novo";
import { SelectEmpresas } from "@/components/painel/calendario/select/selectEmpresas";


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
      const usuario: any = session?.user.name
      const daysOfMonth = await getAllDaysOfMonth(MesAt);
      setUser(usuario)
      await axios.get(`/api/db/business/get/calendar/list?DataIncicio=${daysOfMonth.DataInicio}&DataFim=${daysOfMonth.DataFim}&Vendedor=${usuario}`)
        .then((response) => {
          const filtro = response.data.filter((c: any) => c.attributes.etapa !== 6)
          console.log("🚀 ~ file: index.tsx:39 ~ .then ~ response.data:", response.data)
          const filtro1 = filtro.filter((c: any) => c.attributes.andamento !== 5)
          setData(filtro1);
          setLoad(false);
        })
        .catch((error: any) => {
          console.log(error);
        })
    })();
  }, [MesAt, session?.user.name])


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

    const BudgetA = parseFloat(a.attributes.Budget.replace(/[^0-9,]/g, "").replace(".", "").replace(",", "."));
    const BudgetB = parseFloat(b.attributes.Budget.replace(/[^0-9,]/g, "").replace(".", "").replace(",", "."));

    return BudgetB - BudgetA;
  }

  // Reorganizar o array por ordem alfabética pelo nome e pelos valores numéricos em ordem decrescente
  data.sort(compararPorNomeEIdade);

  function handleUserChange(user: React.SetStateAction<string>) {
    // setUser(user)
    // props.user(user)
    (async () => {
      const usuario = user
      setUser(usuario)
      const daysOfMonth = await getAllDaysOfMonth(MesAt);
      await axios.get(`/api/db/business/get/calendar/list?DataIncicio=${daysOfMonth.DataInicio}&DataFim=${daysOfMonth.DataFim}&Vendedor=${usuario}`)
        .then((response) => {
          const filtro = response.data.filter((c: any) => c.attributes.etapa !== 6)
          console.log("🚀 ~ file: index.tsx:92 ~ .then ~ response.data:", response.data)
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
    if(enpresa){
      setData(enpresa)
    } else {
      (async () => {
        const usuario = User
        const daysOfMonth = await getAllDaysOfMonth(MesAt);
        await axios.get(`/api/db/business/get/calendar/list?DataIncicio=${daysOfMonth.DataInicio}&DataFim=${daysOfMonth.DataFim}&Vendedor=${usuario}`)
          .then((response) => {
            const filtro = response.data.filter((c: any) => c.attributes.etapa !== 6)
            console.log("🚀 ~ file: index.tsx:92 ~ .then ~ response.data:", response.data)
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
        <Box w={'100%'}>
          <Loading size="200px">Carregando...</Loading>
        </Box>
      </>
    );
  }

  return (
    <>
      <Box w={'100%'}>
        <Flex px={5} pt={2} justifyContent={'space-between'} w={'100%'}>
          <Flex gap={16}>
            <Box>
              <SelectUser onValue={handleUserChange} />
            </Box>
            <Box>
              <SelectEmpresas onValue={handleEnpresa} />
            </Box>
          </Flex>

        </Flex>
        <Box w='100%' display={{ lg: 'flex', sm: 'block' }} p={{ lg: 3, sm: 5 }}>
          <Box w={{ lg: '60%', sm: '100%' }} bg={'gray.700'} p={2} rounded={5}>

            <Flex direction={'column'} w={'100%'} alignItems={'center'}>
              <chakra.span fontSize={'16px'} fontWeight={'medium'} color={'white'}>Funil de vendas</chakra.span>
            </Flex>
            <Box bg={'gray.200'}>
              <TableContainer>
                <Table>
                  <Thead bg={'green.200'}>
                    <Tr>
                      <Th p={2} border={'2px'} w={'29px'}>Empresa</Th>
                      <Th p={2} border={'2px'} w={'13rem'}>Etapa</Th>
                      <Th p={2} border={'2px'} w={'9rem'}>Status</Th>
                      <Th p={2} border={'2px'} w={'9rem'}>Valor</Th>
                      <Th p={2} border={'2px'} w={'9rem'}>Negocio</Th>
                    </Tr>
                  </Thead>
                  <Tbody border={'2px'}>
                    {data.map((itens: any) => {
                      const statusAtual = itens.attributes.andamento
                      const statusRepresente = statusAtual === 1 ? '⭐' : statusAtual === 2 ? '⭐⭐' : statusAtual === 3 ? '⭐⭐⭐' : statusAtual === 4 ? '⭐⭐⭐⭐' : '⭐⭐⭐⭐⭐';
                      const etapa = EtapasNegocio.filter((e: any) => e.id == itens.attributes.etapa).map((e: any) => e.title)

                      const colorLine = itens.attributes.deadline >= new Date().toISOString() ? 'red.400' : ''


                      const dataDed = new Date(itens.attributes.deadline)
                      dataDed.setDate(dataDed.getDate() + 1);
                      const dataFormatada = dataDed.toLocaleDateString('pt-BR');

                      return (
                        <>
                          <Tr key={itens.id} fontSize={'10px'} bg={colorLine} onClick={() => router.push(`/negocios/${itens.id}`)} cursor={'pointer'}>
                            <Td p={2} fontSize={'10px'} borderEnd={'2px'} borderBottom={'1px solid #969696'}>{itens.attributes.empresa.data?.attributes.nome}</Td>
                            <Td p={2} fontSize={'10px'} borderEnd={'2px'} borderBottom={'1px solid #969696'}>{etapa}</Td>
                            <Td p={2} fontSize={'10px'} borderEnd={'2px'} borderBottom={'1px solid #969696'}>{statusRepresente}</Td>
                            <Td p={2} fontSize={'10px'} borderEnd={'2px'} borderBottom={'1px solid #969696'}>{itens.attributes.Budget}</Td>
                            <Td p={2} fontSize={'10px'} borderBottom={'1px solid #969696'}>{dataFormatada}</Td>
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
            <Box w={{ lg: '83%', sm: '100%' }} bg={'orange.500'} p={2} rounded={5}>

              <Flex direction={'column'} w={'100%'} alignItems={'center'}>
                <chakra.span fontSize={'16px'} fontWeight={'medium'}>Clientes em Inatividade</chakra.span>
              </Flex>
              <Box bg={'gray.200'}>
                <TableContainer>
                  <Table>
                    <Thead bg={'green.200'}>
                      <Tr>
                        <Th p={2} border={'2px'} w={{ sm: '60%', lg: '40%' }} textAlign={'center'}>Empresa</Th>
                        <Th p={2} border={'2px'} textAlign={'center'}>última compra</Th>
                      </Tr>
                    </Thead>
                    <Tbody border={'2px'}>
                      <Ausente />
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>

            </Box>

            <Box w={{ lg: '83%', sm: '100%' }} bg={'blue.600'} p={2} rounded={5}>
              <Flex direction={'column'} w={'100%'} alignItems={'center'}>
                <chakra.span fontSize={'16px'} fontWeight={'medium'}>Clientes novos</chakra.span>
              </Flex>
              <Box bg={'gray.200'}>
                <TableContainer>
                  <Table>
                    <Thead bg={'green.200'}>
                      <Tr>
                        <Th p={2} border={'2px'} w={{ sm: '60%', lg: '40%' }}  textAlign={'center'}>Empresa</Th>
                        <Th p={2} border={'2px'} textAlign={'center'}>Data de entrada</Th>
                      </Tr>
                    </Thead>
                    <Tbody border={'2px'}>
                      <NovoCliente />
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>

            </Box>
            <Box w={{ lg: '83%', sm: '100%' }} bg={'blue.600'} p={2} rounded={5}>
              <Flex direction={'column'} w={'100%'} alignItems={'center'}>
                <chakra.span fontSize={'16px'} fontWeight={'medium'}>Clientes recuperados</chakra.span>
              </Flex>
              <Box bg={'gray.200'}>
                <TableContainer>
                  <Table>
                    <Thead bg={'green.200'}>
                      <Tr>
                        <Th p={2} border={'2px'} textAlign={'center'}>Empresa</Th>
                        <Th p={2} border={'2px'} textAlign={'center'}>valor de compra</Th>
                      </Tr>
                    </Thead>
                    <Tbody border={'2px'}>
                      <Presente />
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
