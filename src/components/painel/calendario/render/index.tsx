import { Box, Flex, chakra, Tooltip, VStack, Text, Divider } from "@chakra-ui/react"
import { useEffect, useState } from "react";


export const RenderCalendar = (props: { data: any }) => {
  const [calendarData, setCalendarData] = useState([]);
  useEffect(() => {
    setCalendarData(props.data)
  }, [props.data])

  return (
    <>
      {calendarData.map((part: any, index: number) => {

        return (
        <Flex key={index} bg={'gray.700'} direction="column" w={'100%'} alignItems={'flex-start'} px={5} pt='3' pb='3' mb={4} borderRadius="md">
          <Box>
            <chakra.span fontSize={'16px'} fontWeight={'medium'} color={'white'}>{index === 0 ? 'Vendas do 1° Decêndio' : index === 1 ? 'Vendas do 2° Decêndio' : 'Vendas do 3° Decêndio'}</chakra.span>
          </Box>
          <Box pt={'4'} w="full">
            <Flex gap={'1px'} flexWrap="wrap">
              {part?.map((item: any) => {

                const day = parseInt(item.date.slice(-2));

                const lastTwoDigits = day.toString().padStart(2, "0");
                const clientes = item.clientes

                const DateConclusaoFilter = clientes



                const totalDateConclusao = DateConclusaoFilter.reduce((total: number, cliente: any) => {
                  const budget = cliente.attributes.Budget.replace(/[^0-9,]/g, "").replace(".", "").replace(",", ".");
                  const valor = total + parseFloat(budget);
                  return valor
                }, 0);

                return (
                  <Box key={item.id} w={'7rem'} minH={'6rem'} bg={'gray.800'} color="white" p={1} border="1px solid" borderColor="gray.600">
                    <Flex pe={2} mb={2} justifyContent={'end'} fontWeight={'semibold'} color="gray.400">{lastTwoDigits}</Flex>
                    <Box hidden={!totalDateConclusao}>
                      <Flex justifyContent={'center'}>
                        <Tooltip
                          label={
                            <VStack align="start" spacing={1} p={1} minW="200px" maxW="300px">
                              <Text fontWeight="bold" fontSize="sm" borderBottom="1px solid" borderColor="gray.600" w="100%" pb={1} mb={1}>
                                Negócios Ganhos
                              </Text>
                              {clientes.map((cliente: any, idx: number) => {
                                const empresaNome = cliente.attributes.empresa?.data?.attributes?.nome || "Empresa não identificada";
                                const budget = cliente.attributes.Budget;
                                return (
                                  <Flex key={idx} justify="space-between" w="100%" gap={4}>
                                    <Text fontSize="12px" isTruncated maxW="180px">{empresaNome}</Text>
                                    <Text fontSize="12px" fontWeight="bold" color="green.300">{budget}</Text>
                                  </Flex>
                                );
                              })}
                            </VStack>
                          }
                          hasArrow
                          placement="top"
                          bg="blue.900"
                          color="white"
                          borderRadius="md"
                          boxShadow="2xl"
                          p={2}
                          border="1px solid"
                          borderColor="blue.700"
                        >
                          <Box fontSize={'14px'} fontWeight={'bold'} color={'green.400'} cursor="help" textAlign="center">
                            <Text fontSize="xs" color="gray.500" fontWeight="normal">{clientes.length} {clientes.length === 1 ? 'venda' : 'vendas'}</Text>
                            {totalDateConclusao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </Box>
                        </Tooltip>
                      </Flex>
                    </Box>
                  </Box>
                )
              })}
            </Flex>
          </Box>
        </Flex>
      )})}
    </>
  )
}
