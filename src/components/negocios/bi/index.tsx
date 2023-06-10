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

export const PowerBi = () => {
  const [date, setDate] = useState<number>();
  const [User, setUser] = useState<string>();
  const [data, setData] = useState<any>([]);
  console.log("🚀 ~ file: index.tsx:12 ~ PowerBi ~ data:", data)
  const [calendar, setCalendar] = useState<any>([]);
  const [Negocios, setNegocios] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    (async () => {
      const daysOfMonth = await getAllDaysOfMonth(date);
      setCalendar(daysOfMonth.Dias);

      if (daysOfMonth.DataInicio && daysOfMonth.DataFim) {
        setIsLoading(true);
        try {
          const response = await axios.get(`/api/db/business/get/calendar?DataIncicio=${daysOfMonth.DataInicio}&DataFim=${daysOfMonth.DataFim}`);
          setData(response.data);
        } catch (error) {
          console.log(error);
        } finally {
          setIsLoading(false);
        }
      }
    })();
  }, [date]);

  useEffect(() => {
    const lowerBusca = User?.toLowerCase();
    const negocioFilter = data?.filter((E: any) => {
      const nome = E.attributes.vendedor.data?.attributes.username;
      return nome?.toLowerCase().includes(lowerBusca);
    });
    setNegocios(negocioFilter)
  }, [data, User]);

  ///api/db/empresas/search/powerbi/ausente
  function handleDateChange(month: number) {
    setDate(month);
  }
  function handleUserChange(user: string) {
    setUser(user);
  }

  return (
    <>
      <Box w={'100%'}>
        <Flex px={5} pt={2} justifyContent={'space-between'} w={'100%'}>
          <Flex gap={16}>
            <Box>
              <SelectMonth onValue={handleDateChange} />
            </Box>
            <Box>
              <SelectUser onValue={handleUserChange} />
            </Box>
          </Flex>

        </Flex>
        <Box w='100%' display={{ lg: 'flex', sm: 'block' }} p={{ lg: 3, sm: 5 }}>
          <Box w={{ lg: '53%', sm: '100%' }} bg={'gray.700'} p={2} rounded={5}>

            <Flex direction={'column'} w={'100%'} alignItems={'center'}>
              <chakra.span fontSize={'16px'} fontWeight={'medium'} color={'white'}>Funil de vendas</chakra.span>
            </Flex>
            <Box bg={'gray.200'}>
              <TableContainer>
                <Table>
                  <Thead bg={'green.200'}>
                    <Tr>
                      <Th border={'2px'} w={'17rem'}>Empresa</Th>
                      <Th border={'2px'} w={'13rem'}>Etapa</Th>
                      <Th border={'2px'} w={'9rem'}>Status</Th>
                      <Th border={'2px'} w={'9rem'}>Valor</Th>
                      <Th border={'2px'} w={'8px'}>Negocio</Th>
                    </Tr>
                  </Thead>
                  <Tbody border={'2px'}>
                    {Negocios.map((itens: any) => {
                      console.log("🚀 ~ file: index.tsx:87 ~ {Negocios.map ~ itens:", itens)
                      const statusAtual = itens.attributes.andamento
                      const statusRepresente = statusAtual === 1 ? '⭐' : statusAtual === 2 ? '⭐⭐' : statusAtual === 3 ? '⭐⭐⭐' : statusAtual === 4 ? '⭐⭐⭐⭐' : '⭐⭐⭐⭐⭐';
                      const etapa = EtapasNegocio.filter((e: any) => e.id == itens.attributes.etapa).map((e: any) => e.title)

                      return (
                        <>
                          <Tr key={itens.id}>
                            <Td borderEnd={'2px'} borderBottom={'1px solid #afafaf'}>{itens.attributes.empresa.data?.attributes.nome}</Td>
                            <Td borderEnd={'2px'} borderBottom={'1px solid #afafaf'}>{etapa}</Td>
                            <Td borderEnd={'2px'} borderBottom={'1px solid #afafaf'}>{statusRepresente}</Td>
                            <Td borderEnd={'2px'} borderBottom={'1px solid #afafaf'}>{itens.attributes.Budget}</Td>
                            <Td borderBottom={'1px solid #afafaf'}>
                              <IconButton
                                aria-label="Negocio"
                                colorScheme='teal'
                                me={'5rem'}
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
            <Box w={{ lg: '70%', sm: '100%' }} bg={'orange.500'} p={2} rounded={5}>

              <Flex direction={'column'} w={'100%'} alignItems={'center'}>
                <chakra.span fontSize={'16px'} fontWeight={'medium'}>Clientes que não compram há mais de um mês</chakra.span>
              </Flex>
              <Box bg={'gray.200'}>
                <TableContainer>
                  <Table>
                    <Thead bg={'green.200'}>
                      <Tr>
                        <Th border={'2px'} w={{ sm: '60%', lg: '40%' }} textAlign={'center'}>Empresa</Th>
                        <Th border={'2px'} textAlign={'center'}>última compra</Th>
                      </Tr>
                    </Thead>
                    <Tbody border={'2px'}>
                      <Ausente />
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>

            </Box>
            <Box w={{ lg: '70%', sm: '100%' }} bg={'blue.600'} p={2} rounded={5}>

              <Flex direction={'column'} w={'100%'} alignItems={'center'}>
                <chakra.span fontSize={'16px'} fontWeight={'medium'}>Clientes novos ou recuperados neste mês</chakra.span>
              </Flex>
              <Box bg={'gray.200'}>
                <TableContainer>
                  <Table>
                    <Thead bg={'green.200'}>
                      <Tr>
                        <Th border={'2px'} textAlign={'center'}>Empresa</Th>
                        <Th border={'2px'} textAlign={'center'}>valor de compra</Th>
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
