import { SelectUser } from '@/components/painel/calendario/select/SelecUser';
import { getAllDaysOfMonth } from '@/function/Datearray';
import { Box, Flex, FormLabel, chakra } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { parseISO, isSameDay } from 'date-fns';
import { RenderCalendar } from '@/components/painel/calendario/render';
import { useSession } from 'next-auth/react';
import { SetValue } from '@/function/currenteValor';

const Painel: React.FC = () => {
  const { data: session } = useSession();
  const [date, setDate] = useState<number>();
  const [User, setUser] = useState<string | any>('');
  const [Fase1, setFase1] = useState<number>(0);
  const [Fase2, setFase2] = useState<number>(0);
  const [Fase3, setFase3] = useState<number>(0);
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

          if (isSameDay(parseISO(cliente.attributes.createdAt), parseISO(dia.date)) && cliente.attributes.andamento !== 5 && cliente.attributes.etapa !== 6) {
            corresponding = 'createdAt';
            correspondingDate = cliente.attributes.createdAt;

          } else if (cliente.attributes.andamento === 5 && cliente.attributes.etapa === 1) {
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

      const filterCreatedAt = diasMesclados.filter((i: any) => {
        const [mapClinet] = i.clientes.map((c: any) => c.corresponding)
        return mapClinet === 'createdAt'
      })

      const filterDeadline = diasMesclados.filter((i: any) => {
        const [mapClinet] = i.clientes.map((c: any) => c.corresponding)
        const [mapClinet1] = i.clientes.map((c: any) => c.attributes.date_conclucao)
        return mapClinet === 'deadline' && mapClinet1 === null
      })
      const filterDateConclusao = diasMesclados.filter((i: any) => {
        const [mapClinet] = i.clientes.map((c: any) => c.corresponding)
        return mapClinet === 'dateConclusao'
      })

      const listaCreatedAt = filterCreatedAt.map((i: any) => {
        const cliente = i.clientes.map((clinete: any) => !clinete.attributes.Budget ? 0.00 : parseFloat(clinete.attributes.Budget.replace(/[^0-9,]/g, "").replace(".", "").replace(",", ".")))
        const soma = cliente.reduce((total: number, item: any) => {
          return total + item
        }, 0)
        return soma
      })

      const listaDeadline = filterDeadline.map((i: any) => {
        const cliente = i.clientes.map((clinete: any) => parseFloat(clinete.attributes.Budget.replace(/[^0-9,]/g, "").replace(".", "").replace(",", ".")))
        const soma = cliente.reduce((total: number, item: any) => {
          return total + item
        }, 0)
        return soma
      })

      const listaDateConclusao = filterDateConclusao.map((i: any) => {
        const cliente = i.clientes.map((clinete: any) => parseFloat(clinete.attributes.Budget.replace(/[^0-9,]/g, "").replace(".", "").replace(",", ".")))
        const soma = cliente.reduce((total: number, item: any) => {
          return total + item
        }, 0)
        return soma
      })


      const somaCreatedAt = listaCreatedAt.reduce((total: number, item: any) => {
        return total + item
      }, 0)

      const somaDeadline = listaDeadline.reduce((total: number, item: any) => {
        return total + item
      }, 0)

      const somaDateConclusao = listaDateConclusao.reduce((total: number, item: any) => {
        return total + item
      }, 0)



      setFase1(somaCreatedAt)
      setFase2(somaDateConclusao)
      setFase3(somaDeadline)


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
    }
  }, [calendar, data, User]);


  function handleDateChange(month: number) {
    setDate(month);
  }
  function handleUserChange(user: string) {
    setUser(user);
  }

  return (
    <>
      <Box h={'100%'} bg={'gray.800'}>
        <Flex px={5} pt={2} justifyContent={'space-between'} w={'100%'}>
          <Flex gap={16}>
            <Box>
              <SelectUser onValue={handleUserChange} />
            </Box>
          </Flex>
          <Flex alignItems={'center'} gap={5}>
            <Flex flexDirection={'column'} justifyContent={'center'}>
              <FormLabel textAlign={'center'} color={'white'}>Em Andamento</FormLabel>
              <Flex w={'8rem'} h={'2rem'} py={1} bg={'orange.400'} color={'white'} justifyContent={'center'} alignItems={'center'} rounded={'1rem'}>
                <chakra.span>{Fase1.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</chakra.span>
              </Flex>
            </Flex>
            <Flex flexDirection={'column'} justifyContent={'center'}>
              <FormLabel textAlign={'center'} color={'white'}>Ganhos</FormLabel>
              <Flex w={'8rem'} h={'2rem'} py={1} bg={'green.500'} color={'white'} justifyContent={'center'} alignItems={'center'} rounded={'1rem'}>
                <chakra.span>{Fase2.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</chakra.span>
              </Flex>
            </Flex>
            <Flex flexDirection={'column'} justifyContent={'center'}>
              <FormLabel textAlign={'center'} color={'white'}>Perdidos</FormLabel>
              <Flex w={'8rem'} h={'2rem'} py={1} bg={'red'} color={'white'} justifyContent={'center'} alignItems={'center'} rounded={'1rem'}>
                <chakra.span>{
                  Fase3.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                }</chakra.span>
              </Flex>
            </Flex>
          </Flex>

        </Flex>
        <Box w='100%' bg="gray.800">
          <Flex direction="column" gap={5} p={5}>
            <RenderCalendar data={calendarData} />
          </Flex>
        </Box>
      </Box>
    </>
  );
};

export default Painel;
