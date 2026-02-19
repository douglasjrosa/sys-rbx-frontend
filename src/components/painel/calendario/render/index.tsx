import { Box, Flex, chakra, Tooltip, VStack, Text, useBreakpointValue } from "@chakra-ui/react"
import { useCallback, useEffect, useState } from "react"

export { CalendarSkeleton } from './CalendarSkeleton'

export const RenderCalendar = (props: { data: any }) => {
  const [calendarData, setCalendarData] = useState([]);
  const [openDayId, setOpenDayId] = useState<string | null>(null);
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    setCalendarData(props.data)
  }, [props.data])

  const handleCloseTooltip = useCallback(() => {
    setOpenDayId(null);
  }, []);

  useEffect(() => {
    if (!isMobile || !openDayId) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-day-trigger]') || target.closest('[role="tooltip"]')) return;
      setOpenDayId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobile, openDayId]);

  return (
    <>
      {calendarData.map((part: any, index: number) => {

        return (
        <Flex
          key={index}
          bg="gray.700"
          direction="column"
          w="100%"
          maxW="1200px"
          alignItems="center"
          px={{ base: 3, md: 5 }}
          pt={3}
          pb={3}
          mb={4}
          borderRadius="md"
        >
          <Box w="100%" textAlign="center" mb={2}>
            <chakra.span fontSize={{ base: '14px', md: '16px' }} fontWeight="medium" color="white">
              {index === 0 ? 'Vendas do 1° Decêndio' : index === 1 ? 'Vendas do 2° Decêndio' : 'Vendas do 3° Decêndio'}
            </chakra.span>
          </Box>
          <Box pt={4} w="full">
            <Flex gap={1} flexWrap="wrap" justifyContent="center">
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

                const tooltipLabel = (
                  <VStack align="start" spacing={1} p={1} minW="200px" maxW="300px">
                    <Text fontWeight="bold" fontSize="sm" borderBottom="1px solid" borderColor="gray.600" w="100%" pb={1} mb={1}>
                      Negócios Ganhos
                    </Text>
                    {clientes.map((cliente: any, idx: number) => {
                      const empresaNome = cliente.attributes.empresa?.data?.attributes?.nome || "Empresa não identificada";
                      const budgetStr = cliente.attributes.Budget || "0";
                      const budgetNum = parseFloat(budgetStr.replace(/[^0-9,]/g, "").replace(".", "").replace(",", "."));
                      const formattedBudget = isNaN(budgetNum) ? budgetStr : new Intl.NumberFormat("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(budgetNum);

                      return (
                        <Flex key={idx} justify="space-between" w="100%" gap={4}>
                          <Text fontSize="12px" isTruncated maxW="180px">{empresaNome}</Text>
                          <Text fontSize="12px" fontWeight="bold" color="green.200">{formattedBudget}</Text>
                        </Flex>
                      );
                    })}
                  </VStack>
                );

                return (
                  <Box
                    key={item.id}
                    data-day-trigger
                    w={{ base: '5.5rem', sm: '6rem', md: '7rem' }}
                    minH={{ base: '5rem', md: '6rem' }}
                    bg="gray.800"
                    color="white"
                    p={1}
                    border="1px solid"
                    borderColor="gray.600"
                    onClick={isMobile && totalDateConclusao ? () => setOpenDayId((prev) => (prev === item.id ? null : item.id)) : undefined}
                    cursor={isMobile && totalDateConclusao ? 'pointer' : undefined}
                  >
                    <Flex pe={2} mb={2} justifyContent={'end'} fontWeight={'semibold'} color="gray.400">{lastTwoDigits}</Flex>
                    <Box hidden={!totalDateConclusao}>
                      <Flex justifyContent={'center'}>
                        <Tooltip
                          label={tooltipLabel}
                          hasArrow
                          placement="top"
                          bg="blue.900"
                          color="white"
                          borderRadius="md"
                          boxShadow="2xl"
                          p={2}
                          border="1px solid"
                          borderColor="blue.700"
                          isOpen={isMobile ? openDayId === item.id : undefined}
                          onClose={handleCloseTooltip}
                          openDelay={isMobile ? 0 : 200}
                          closeOnClick={false}
                        >
                          <Box fontSize={'14px'} fontWeight={'bold'} color={'green.200'} cursor="help" textAlign="center" as="span" display="inline-block">
                            {totalDateConclusao.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                            <Text fontSize="xs" color="gray.500" fontWeight="normal">{clientes.length} {clientes.length === 1 ? 'venda' : 'vendas'}</Text>
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
