import { SelectUser } from '@/components/painel/calendario/select/SelecUser';
import { SelectMonth } from '@/components/painel/calendario/select/SelectMonth';
import { getAllDaysOfMonth } from '@/function/Datearray';
import { Box, Flex, FormLabel, chakra } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

const Painel: React.FC = () => {
  const [date, setDate] = useState<number>();
  const [User, setUser] = useState<string>();
  const [calendar, setCalendar] = useState<string[]>([]);
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {

    const daysOfMonth = getAllDaysOfMonth(date);
    setCalendar(daysOfMonth.Dias);

    (async () => {
      if (daysOfMonth.DataInicio && daysOfMonth.DataFim) {
        setIsLoading(true);
        await axios.get(`/api/db/business/get/calendar?DataIncicio=${daysOfMonth.DataInicio}&DataFim=${daysOfMonth.DataFim}`)
          .then((Response) => {
            console.log("🚀 ~ file: index.tsx:27 ~ .then ~ Response.data:", Response.data)
            setData(Response.data);
          })
          .catch((error) => console.log(error))
      }
    })()

    console.log(daysOfMonth);
    console.log(daysOfMonth.Dias);
  }, [date]);

  function handleDateChange(month: number) {
    setDate(month);
  }
  function handleUserChange(user: string) {
    setUser(user);
  }

  const LowerBusca = User?.toLowerCase()

  // const negocioFilter: any = data?.filter((E: any) => {
  //  console.log("🚀 ~ file: index.tsx:49 ~ constnegocioFilter:any=data.filter ~ E:", E)

  // })
  // console.log("🚀 ~ file: index.tsx:52 ~ constnegocioFilter:any=data.filter ~ negocioFilter:", negocioFilter)


  return (
    <>
      <Flex>
        <Flex px={5} justifyContent={'space-between'} w={'100%'}>
          <Flex gap={16}>
            <Box>
              <SelectMonth onValue={handleDateChange} />
            </Box>
            <Box>
              <SelectUser onValue={handleUserChange} />
            </Box>
          </Flex>
          <Flex alignItems={'center'} gap={5}>
            <Flex w={'8rem'} h={'2rem'} py={1} bg={'orange.500'} color={'white'} justifyContent={'center'} alignItems={'center'} rounded={'1rem'}>
              <chakra.span>R$ 100,00</chakra.span>
            </Flex>
            <Flex w={'8rem'} h={'2rem'} py={1} bg={'green.500'} color={'white'} justifyContent={'center'} alignItems={'center'} rounded={'1rem'}>
              <chakra.span>R$ 100,00</chakra.span>
            </Flex>
            <Flex w={'8rem'} h={'2rem'} py={1} bg={'red.500'} color={'white'} justifyContent={'center'} alignItems={'center'} rounded={'1rem'}>
              <chakra.span>R$ 100,00</chakra.span>
            </Flex>
          </Flex>

        </Flex>
        <Box></Box>
        <Box></Box>
        <Box></Box>

      </Flex>
      {/* Renderizar o restante do componente usando memoizedData */}
    </>
  );
};

export default Painel;
