import {
  Box,
  Flex,
} from "@chakra-ui/react";
import { memo, useEffect, useMemo, useState } from "react";
import { BtCreate } from "../../components/negocios/component/butonCreate";
import { PowerBi } from "@/components/negocios/bi";
import { getAllDaysOfMonth } from "@/function/Datearray";
import axios from "axios";
import { useSession } from "next-auth/react";
import Loading from "@/components/elements/loading";


function Negocios() {
  const { data: session } = useSession();
  const [load, setLoad] = useState<boolean>(false);
  const [User, setUser] = useState<string | any>('');
  const [data, setData] = useState<any>([]);


  const DateAt = new Date()
  const MesAt = DateAt.getMonth() + 1;

  useEffect(() => {
    setUser(session?.user.name)
  }, [session?.user.name])

  function tragetReload(Loading: boolean) {
    if (Loading === true) {
      (async () => {
        setLoad(true);
        try {
          const daysOfMonth = await getAllDaysOfMonth(MesAt);
          const dataAtual = new Date();
          const primeiroDiaTresMesesAtras = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 3, 1);
          
          const ultimoDiaMesAtual = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);

          const response = await axios.get(`/api/db/business/get/calendar/list?DataIncicio=${primeiroDiaTresMesesAtras.toISOString()}&DataFim=${ultimoDiaMesAtual.toISOString()}&Vendedor=${User}`);
          setData(response.data);
          setTimeout(() => setLoad(false), 1500)
        } catch (error) {
          console.log(error);
        }
      })();
    }
  }

  function handleUserChange(user: React.SetStateAction<string>) {
    setUser(user)
  }

  if (load) {
    return (
      <Box w={'100%'} h={'100%'}>
        <Loading size="200px">Carregando...</Loading>
      </Box>
    );
  }


  return (
    <>
      <Flex bg="gray.800" h="100vh" w="100%" flexDir={"column"} justifyContent="center">
        <Box h={"100%"}>
          <Flex
            bg="gray.800"
            w={'100%'}
            p={1}
          >
            <PowerBi reload={load} dados={data} user={handleUserChange} setdados={data.length} />
          </Flex>
        </Box>
      </Flex>
    </>
  );
}

export default memo(Negocios)
