import { EtapasNegocio } from "@/components/data/etapa";
import { SelectUser } from "@/components/painel/calendario/select/SelecUser"
import { SelectMonth } from "@/components/painel/calendario/select/SelectMonth"
import { getAllDaysOfMonth } from "@/function/Datearray";
import { Box, Flex, IconButton, Table, TableCaption, TableContainer, Tbody, Td, Tfoot, Th, Thead, Tr, chakra } from "@chakra-ui/react"
import axios from "axios";
import { useEffect, useState } from "react";
import { Ausente } from "./ausente";
import { Presente } from "./presente";
import { BsBoxArrowUpRight } from "react-icons/bs";
import { useRouter } from "next/router";
import Loading from "@/components/elements/loading";
import { useSession } from "next-auth/react";

export const PowerBi = (props: { reload: boolean }) => {

  const [date, setDate] = useState<number>();
  const [User, setUser] = useState<string | any>();
  const [data, setData] = useState<any>([]);
  const [calendar, setCalendar] = useState<any>([]);
  const [Negocios, setNegocios] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReload, setIsReload] = useState(false);
  const router = useRouter()

  const DateAt = new Date()
  const MesAt = DateAt.getMonth() + 1

  useEffect(() => {
    if(props.reload){
      setIsReload(props.reload)
    }

  }, [props.reload]);


  if (isReload === true) {
    (async () => {
      setIsLoading(true);
      try {
        const daysOfMonth = await getAllDaysOfMonth(MesAt);
        setCalendar(daysOfMonth.Dias);
        const response = await axios.get(`/api/db/business/get/calendar/list?DataIncicio=${daysOfMonth.DataInicio}&DataFim=${daysOfMonth.DataFim}&Vendedor=${User}`);
        setData(response.data);
        setIsReload(false)
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    })();
  }

  function handleUserChange(user: React.SetStateAction<string>) {
    setUser(user)
  }

  if (isLoading) {
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

                      return (
                        <>
                          <Tr key={itens.id} fontSize={'10px'}>
                            <Td p={2} fontSize={'10px'} borderEnd={'2px'} borderBottom={'1px solid #afafaf'}>{itens.attributes.empresa.data?.attributes.nome}</Td>
                            <Td p={2} fontSize={'10px'} borderEnd={'2px'} borderBottom={'1px solid #afafaf'}>{etapa}</Td>
                            <Td p={2} fontSize={'10px'} borderEnd={'2px'} borderBottom={'1px solid #afafaf'}>{statusRepresente}</Td>
                            <Td p={2} fontSize={'10px'} borderEnd={'2px'} borderBottom={'1px solid #afafaf'}>{itens.attributes.Budget}</Td>
                            <Td p={2} borderBottom={'1px solid #afafaf'}>
                              <IconButton
                                mx={5}
                                aria-label="Negocio"
                                colorScheme='teal'
                                onClick={() => router.push(`/negocios/${itens.id}`)}
                                icon={<BsBoxArrowUpRight />}
                              />
                            </Td>
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
                <chakra.span fontSize={'16px'} fontWeight={'medium'}>Clientes que não compram há mais de um mês</chakra.span>
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
                <chakra.span fontSize={'16px'} fontWeight={'medium'}>Clientes novos ou recuperados neste mês</chakra.span>
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
