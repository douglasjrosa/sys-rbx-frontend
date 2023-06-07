import { SelectUser } from '@/components/painel/calendario/select/SelecUser';
import { SelectMonth } from '@/components/painel/calendario/select/SelectMonth';
import { getAllDaysOfMonth } from '@/function/Datearray';
import { Box, Flex, FormLabel, chakra } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { parseISO, isSameDay } from 'date-fns';

const Painel: React.FC = () => {
  const [date, setDate] = useState<number>();
  const [User, setUser] = useState<string>();
  const [calendar, setCalendar] = useState<any>([]);
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [calendarData, setCalendarData] = useState([]);

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

  const negocioFilter = useMemo(() => {
    const lowerBusca = User?.toLowerCase();
    return data?.filter((E: any) => {
      const nome = E.attributes.vendedor.data?.attributes.username;
      return nome?.toLowerCase().includes(lowerBusca);
    });
  }, [data, User]);


  useEffect(() => {
    const diasMesclados = calendar.map((dia: any) => {
      const clientesCorrespondentes = negocioFilter.filter((c: any) => {
        const createdAt = parseISO(c.attributes.createdAt);
        const deadline = parseISO(c.attributes.deadline);
        const dateConclusao = parseISO(c.attributes.date_conclucao);

        if (isSameDay(createdAt, parseISO(dia.date))) {
          return true;
        }

        if (isSameDay(deadline, parseISO(dia.date))) {
          return true;
        }

        if (isSameDay(dateConclusao, parseISO(dia.date))) {
          return true;
        }

        return false;
      }).map((cliente: any) => {
        let corresponding;
        let correspondingDate;

        if (isSameDay(parseISO(cliente.attributes.createdAt), parseISO(dia.date))) {
          corresponding = 'createdAt';
          correspondingDate = cliente.attributes.createdAt;
        } else if (isSameDay(parseISO(cliente.attributes.deadline), parseISO(dia.date))) {
          corresponding = 'deadline';
          correspondingDate = cliente.attributes.deadline;
        } else if (isSameDay(parseISO(cliente.attributes.date_conclucao), parseISO(dia.date))) {
          corresponding = 'dateConclusao';
          correspondingDate = cliente.attributes.date_conclucao;
        }

        return {
          ...cliente,
          corresponding,
          correspondingDate
        };
      });

      return {
        id: dia.id,
        date: dia.date,
        clientes: clientesCorrespondentes
      };
    });

    const parts: any = diasMesclados.reduce((accumulator: any, item: any) => {
      const day = parseInt(item.date.slice(-2));

      if (day >= 1 && day <= 10) {
        accumulator[0].push(item);
      } else if (day >= 11 && day <= 20) {
        accumulator[1].push(item);
      } else {
        accumulator[2].push(item);
      }

      return accumulator;
    }, [[], [], []]);

    setCalendarData(parts);
  }, [calendar, negocioFilter]);

  function handleDateChange(month: number) {
    setDate(month);
  }
  function handleUserChange(user: string) {
    setUser(user);
  }

  return (
    <>
      <Box>
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
            <Flex w={'8rem'} h={'2rem'} py={1} bg={'orange.400'} color={'white'} justifyContent={'center'} alignItems={'center'} rounded={'1rem'}>
              <chakra.span>R$ 100,00</chakra.span>
            </Flex>
            <Flex w={'8rem'} h={'2rem'} py={1} bg={'green'} color={'white'} justifyContent={'center'} alignItems={'center'} rounded={'1rem'}>
              <chakra.span>R$ 100,00</chakra.span>
            </Flex>
            <Flex w={'8rem'} h={'2rem'} py={1} bg={'red'} color={'white'} justifyContent={'center'} alignItems={'center'} rounded={'1rem'}>
              <chakra.span>R$ 100,00</chakra.span>
            </Flex>
          </Flex>

        </Flex>
        <Box>
          <Flex direction="column" gap={5} p={5}>
            {calendarData.map((part: any, index: number) => (
              <Flex key={index} bg={'gray.700'} w={'100%'} direction="column" alignItems={'center'} pt='3' pb='10' rounded={20}>
                <Box>
                  <chakra.span fontSize={'16px'} fontWeight={'medium'} color={'white'}>{index === 0 ? 'Vendas do 1° Decêndio' : index === 0 ? 'Vendas do 2° Decêndio' : 'Vendas do 3° Decêndio'}</chakra.span>
                </Box>
                <Box w={'100%'} px={10} pt={'4'}>
                  <Flex flexWrap={'wrap'} gap={3} >
                    {part?.map((item: any) => {
                      console.log(item.clientes)
                      const cliente = item.clientes
                      return (
                        <Box key={item.id} w={'11rem'} minH={'6rem'} rounded={'15px'} bg={'white'} p={1}>
                          <Flex justifyContent={'center'}>{new Date(item.date).toLocaleDateString()}</Flex>
                          <Box>{cliente?.map((i: any) => {
                            const Colortext = i.corresponding === 'createdAt' ? 'orange' : i.corresponding === 'dateConclusao' ? 'green' : 'red'
                            const Valor = i.attributes.pedidos.data.length === 0? i.attributes.Budget : i.attributes.pedidos.data.attributes?.totalGeral
                            return (
                              <>
                                <Flex gap={1} fontSize={'9px'} mx={1} px={1} bg={Colortext}>
                                  <chakra.span fontSize={'9px'} color={'white'} >{i.attributes.nBusiness}</chakra.span>
                                  <chakra.span fontSize={'9px'} color={'white'}>{i.attributes.empresa.data.attributes.nome}</chakra.span>
                                  <chakra.span fontSize={'9px'} color={'white'}>{Valor}</chakra.span>
                                </Flex>
                              </>
                            )
                          })}</Box>

                        </Box>
                      )
                    })}
                  </Flex>
                </Box>
              </Flex>
            ))}
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default Painel;
