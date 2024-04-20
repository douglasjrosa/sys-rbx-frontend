import { RenderCalendar } from '@/components/painel/calendario/render';
import { SelectUser } from '@/components/painel/calendario/select/SelecUser';
import { SelectMonth } from '@/components/painel/calendario/select/selectMont';
import { getAllDaysOfMonth } from '@/function/Datearray';
import { Box, Flex, FormLabel, Heading, chakra } from '@chakra-ui/react';
import axios from 'axios';
import { isSameDay, parseISO } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const Painel: React.FC = () => {
  const { data: session } = useSession();
  const [date, setDate] = useState<number>();
  const [User, setUser] = useState<string>('');
  const [Andamento, setAndamento] = useState<string>('');
  const [Perdido, setPerdido] = useState<string>('');
  const [Concluido, setConcluido] = useState<string>('');
  const [Mes, setMes] = useState<any>();
  const [Year, setYear] = useState<any>();
  const [calendar, setCalendar] = useState<any>([]);
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [calendarData, setCalendarData] = useState([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const DateAtual = new Date();

  if (!User && session?.user.name) {
    setUser(session?.user.name)
    setMes(DateAtual.getMonth() + 1)
    setYear(DateAtual.getFullYear())
  }


  useEffect(() => {
    (async () => {
      const daysOfMonth = await getAllDaysOfMonth(Mes, Year);
      setCalendar(daysOfMonth.Dias);

      if (daysOfMonth.DataInicio && daysOfMonth.DataFim) {
        setIsLoading(true);
        try {
          // `http://localhost:3000/api/db/business/get/calendar?DataIncicio=2023-08-01T03:00:00.000Z&DataFim=2023-08-31T03:00:00.000Z&Vendedor=Virginia`
          const response = await axios.get(`/api/db/business/get/calendar?DataIncicio=${daysOfMonth.DataInicio}&DataFim=${daysOfMonth.DataFim}&Vendedor=${User}`);
          setData(response.data.data);
          setAndamento(response.data.em_aberto)
          setPerdido(response.data.perdido)
          setConcluido(response.data.conclusao)

        } catch (error) {
          console.log(error);
        } finally {
          setIsLoading(false);
        }
      }
    })();
  }, [Mes, User, Year, date]);



  useEffect(() => {
    if (data && Array.isArray(data)) {
      const diasMesclados = calendar.map((dia: any) => {
        const clientesCorrespondentes = data.filter((c: any) => {
          const dateConclusao = parseISO(c.attributes.date_conclucao);

          if (isSameDay(dateConclusao, parseISO(dia.date))) {
            return true;
          }

          return false;
        }).map((cliente: any) => {
          return {
            ...cliente,
            correspondingDate: parseISO(dia.date)
          };
        });

        return {
          id: dia.id,
          date: dia.date,
          clientes: clientesCorrespondentes
        };
      });

      const parts: any = diasMesclados.reduce(
        (accumulator: any, item: any) => {
          const day = parseInt(item.date.slice(-2));

          if (day >= 1 && day <= 10) {
            accumulator[0].push(item);
          } else if (day >= 11 && day <= 20) {
            accumulator[1].push(item);
          } else {
            accumulator[2].push(item);
          }

          return accumulator;
        },
        [[], [], []]
      );

      setCalendarData(parts);
    }
  }, [calendar, data]);

  function handleDateChange(month: any) {
    const data = month
    setMes(data.month)
    setYear(data.year)
  }

  function handleUserChange(user: string) {
    setUser(user);
  }

  return (
    <>
      <Box h={'100%'} bg={'gray.800'}>
        <Flex px={5} pt={2} justifyContent={'space-between'} w={'100%'}>
          <Flex gap={16}>
            {session?.user.pemission === 'Adm' && (
              <>
                <Box>
                  <SelectUser onValue={handleUserChange} user={User} />
                </Box>
              </>
            )}
            {session?.user.pemission !== 'Adm' && (
              <>
                <Box>
                  <Heading pt={5} size={'lg'}>{session?.user.name}</Heading>
                </Box>
              </>
            )}
            <Box>
              <SelectMonth onValue={handleDateChange} />
            </Box>
          </Flex>
          <Flex alignItems={'center'} gap={5}>
            <Flex flexDirection={'column'} justifyContent={'center'}>
              <FormLabel textAlign={'center'} color={'white'}>Em Andamento</FormLabel>
              <Flex w={'8rem'} h={'2rem'} py={1} bg={'orange.400'} color={'white'} justifyContent={'center'} alignItems={'center'} rounded={'1rem'}>
                {/* <chakra.span>{somaCreate.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</chakra.span> */}
                <chakra.span>{Andamento}</chakra.span>

              </Flex>
            </Flex>
            <Flex flexDirection={'column'} justifyContent={'center'}>
              <FormLabel textAlign={'center'} color={'white'}>Ganhos</FormLabel>
              <Flex w={'8rem'} h={'2rem'} py={1} bg={'green.500'} color={'white'} justifyContent={'center'} alignItems={'center'} rounded={'1rem'}>
                {/* <chakra.span>{somaConcluido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</chakra.span> */}
                <chakra.span>{Concluido}</chakra.span>
              </Flex>
            </Flex>
            <Flex flexDirection={'column'} justifyContent={'center'}>
              <FormLabel textAlign={'center'} color={'white'}>Perdidos</FormLabel>
              <Flex w={'8rem'} h={'2rem'} py={1} bg={'red'} color={'white'} justifyContent={'center'} alignItems={'center'} rounded={'1rem'}>
                {/* <chakra.span>{
                    somaPerca.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                  }</chakra.span> */}
                <chakra.span>{Perdido}</chakra.span>
              </Flex>
            </Flex>
          </Flex>

        </Flex>
        <Box w='100%' bg="gray.800" color={'gray.800'}>
          <Flex direction="column" gap={5} p={5}>
            <RenderCalendar data={calendarData} />
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default Painel;
