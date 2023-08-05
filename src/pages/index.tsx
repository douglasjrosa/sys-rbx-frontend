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
  const [User, setUser] = useState<string | any>('');
  const [calendar, setCalendar] = useState<any>([]);
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [calendarData, setCalendarData] = useState([]);

  useEffect(() => {
    setUser(session?.user.name)
  }, [session?.user.name])

  const DateAt = new Date()
  const MesAt = DateAt.getMonth() + 1;

  useEffect(() => {
    (async () => {
      const daysOfMonth = await getAllDaysOfMonth(MesAt);
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
  }, [MesAt, date]);

  useEffect(() => {
    const lowerBusca = User?.toLowerCase();
    const negocioFilter = data?.filter((E: any) => {
      const nome = E.attributes.vendedor.data?.attributes.username;
      return nome?.toLowerCase().includes(lowerBusca);
    });

    if (data && negocioFilter) {
      const diasMesclados = calendar.map((dia: any) => {
        const clientesCorrespondentes = negocioFilter.filter((c: any) => {
          const createdAt = parseISO(c.attributes.createdAt);
          const deadline = parseISO(c.attributes.deadline);
          const dateConclusao = parseISO(c.attributes.date_conclucao);

          // Verifica se a data de criação do projeto corresponde à dia.date atual
          if (isSameDay(createdAt, parseISO(dia.date))) {
            if (c.attributes.andamento !== 5 && c.attributes.etapa !== 6 || c.attributes.andamento === 1 && c.attributes.etapa === 6) {
              return true; // Inclui em clientesCorrespondentes
            }
          }

          // Verifica se a data de conclusão do projeto corresponde à dia.date atual
          if (isSameDay(dateConclusao, parseISO(dia.date))) {
            if (c.attributes.andamento === 5 && c.attributes.etapa === 6) {
              return true; // Inclui em clientesCorrespondentes
            }
          }

          // Verifica se a data do prazo do projeto corresponde à dia.date atual
          if (c.attributes.andamento === 1 && c.attributes.etapa === 6) {
            // Inclua em clientesCorrespondentes (se necessário)
            // Você pode aplicar condições adicionais, se necessário, para este caso
            // return true
            if (isSameDay(dateConclusao, parseISO(dia.date))) {
              return true; // Inclui em clientesCorrespondentes
            }
          }

          return false; // Exclui de clientesCorrespondentes
        }).map((cliente: any) => {
          let corresponding;
          let correspondingDate;

          if (
            isSameDay(parseISO(cliente.attributes.createdAt), parseISO(dia.date)) &&
            cliente.attributes.andamento !== 5 &&
            cliente.attributes.etapa !== 6 || isSameDay(parseISO(cliente.attributes.createdAt), parseISO(dia.date)) &&
            cliente.attributes.andamento !== 1 &&
            cliente.attributes.etapa !== 6
          ) {
            corresponding = 'createdAt';
            correspondingDate = cliente.attributes.createdAt;
          } else if (
            cliente.attributes.andamento === 1 &&
            cliente.attributes.etapa === 6
          ) {
            // console.log(cliente)
            corresponding = 'Perca';
            correspondingDate = cliente.attributes.date_conclucao;
          } else if (
            isSameDay(parseISO(cliente.attributes.date_conclucao), parseISO(dia.date)) ||
            cliente.attributes.andamento === 5 &&
            cliente.attributes.etapa === 6
          ) {
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
  }, [calendar, data, User]);

  const arrayclienteConcluido = calendarData
    .flatMap((i: any) => {
      const listaCliente = i.map((l: any) => {
        const listCliente = l.clientes;
        const resultado: any = [];
        listCliente.forEach((item: any) => {
          const cerrenponde = item.corresponding;
          if (cerrenponde === 'dateConclusao') {
            resultado.push(item);
          }
        });
        return resultado;
      });
      return listaCliente;
    })
    .filter((arr: any) => arr.length > 0)
    .flat();


  const somaConcluido = arrayclienteConcluido.reduce((total: number, item: any) => {
    if (item && item.attributes && item.attributes.Budget) {
      const budget = parseFloat(item.attributes.Budget.replace(/[^0-9,]/g, '').replace('.', '').replace(',', '.'));
      return total + (isNaN(budget) ? 0 : budget);
    } else {
      return total;
    }
  }, 0);


  const arrayclienteCreat = calendarData
    .flatMap((i: any) => {
      const listaCliente = i.map((l: any) => {
        const listCliente = l.clientes;
        const resultado: any = [];
        listCliente.forEach((item: any) => {
          const cerrenponde = item.corresponding;
          if (cerrenponde === 'createdAt') {
            resultado.push(item);
          }
        });
        return resultado;
      });
      return listaCliente;
    })
    .filter((arr: any) => arr.length > 0)
    .flat();

  const somaCreate = arrayclienteCreat.reduce((total: number, item: any) => {
    if (item && item.attributes && item.attributes.Budget) {
      const budget = parseFloat(item.attributes.Budget.replace(/[^0-9,]/g, '').replace('.', '').replace(',', '.'));
      return total + (isNaN(budget) ? 0 : budget);
    } else {
      return total;
    }
  }, 0);

  const arrayclienteDedline = calendarData
    .flatMap((i: any) => {
      const listaCliente = i.map((l: any) => {
        const listCliente = l.clientes;
        const resultado: any = [];
        listCliente.forEach((item: any) => {
          const cerrenponde = item.corresponding;
          if (cerrenponde === 'Perca') {
            resultado.push(item);
          }
        });
        return resultado;
      });
      return listaCliente;
    })
    .filter((arr: any) => arr.length > 0)
    .flat();


  const somaPerca = arrayclienteDedline.reduce((total: number, item: any) => {
    if (item && item.attributes && item.attributes.Budget) {
      const budget = parseFloat(item.attributes.Budget.replace(/[^0-9,]/g, '').replace('.', '').replace(',', '.'));
      return total + (isNaN(budget) ? 0 : budget);
    } else {
      return total;
    }
  }, 0);


  function handleDateChange(month: any) {
    (async () => {
      const data = month
      const daysOfMonth = await getAllDaysOfMonth(data.month, data.year);
      setCalendar(daysOfMonth.Dias);
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/db/business/get/calendar?DataIncicio=${data.start}&DataFim=${data.end}`);
        setData(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    })()
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
                <chakra.span>{somaCreate.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</chakra.span>
              </Flex>
            </Flex>
            <Flex flexDirection={'column'} justifyContent={'center'}>
              <FormLabel textAlign={'center'} color={'white'}>Ganhos</FormLabel>
              <Flex w={'8rem'} h={'2rem'} py={1} bg={'green.500'} color={'white'} justifyContent={'center'} alignItems={'center'} rounded={'1rem'}>
                <chakra.span>{somaConcluido.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</chakra.span>
              </Flex>
            </Flex>
            <Flex flexDirection={'column'} justifyContent={'center'}>
              <FormLabel textAlign={'center'} color={'white'}>Perdidos</FormLabel>
              <Flex w={'8rem'} h={'2rem'} py={1} bg={'red'} color={'white'} justifyContent={'center'} alignItems={'center'} rounded={'1rem'}>
                <chakra.span>{
                  somaPerca.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                }</chakra.span>
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
