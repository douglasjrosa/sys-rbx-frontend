import { SetValue } from "@/function/currenteValor";
import { Box, Flex, chakra } from "@chakra-ui/react"
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
        <Flex key={index} bg={'gray.700'} direction="column" w={part.length === 8? '66rem': part.length === 7? '58rem': part.length === 5? '42rem':part.length === 9? '74rem':'50rem'} alignItems={'center'} pt='3' pb='3'>
          <Box>
            <chakra.span fontSize={'16px'} fontWeight={'medium'} color={'white'}>{index === 0 ? 'Vendas do 1° Decêndio' : index === 1 ? 'Vendas do 2° Decêndio' : 'Vendas do 3° Decêndio'}</chakra.span>
          </Box>
          <Box px={3} pt={'4'}>
            <Flex gap={'1px'}>
              {part?.map((item: any) => {

                const day = parseInt(item.date.slice(-2));

                let lastTwoDigits;
                if (day >= 9) {
                  lastTwoDigits = day.toString();
                } else {
                  lastTwoDigits = day.toString().padStart(2, "0");
                }
                const clientes = item.clientes

                const DateConclusaoFilter = clientes.filter((cliente: any) => cliente.corresponding === "dateConclusao")
                console.log("🚀 ~ file: index.tsx:36 ~ {part?.map ~ DateConclusaoFilter:", DateConclusaoFilter)


                const totalDateConclusao = DateConclusaoFilter.reduce((total: number, cliente: any) => {
                  const budget = cliente.attributes.Budget.replace(/[^0-9,]/g, "").replace(".", "").replace(",", ".");
                  const valor = total + parseFloat(budget);
                  return valor
                }, 0);

                return (
                  <Box key={item.id} w={'8rem'} minH={'6rem'} bg={'white'} p={1}>
                    <Flex pe={2} mb={2} justifyContent={'end'} fontWeight={'semibold'}>{lastTwoDigits}</Flex>
                    <Box hidden={!totalDateConclusao}>
                      <Flex justifyContent={'center'}>
                        <chakra.span fontSize={'15px'} fontWeight={'bold'} color={'green.600'} >{totalDateConclusao.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</chakra.span>
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
