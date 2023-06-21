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
    // setLoad(Loading);
    console.log('aki')
    if (Loading === true) {
      (async () => {
        setLoad(true);
        try {
          const daysOfMonth = await getAllDaysOfMonth(MesAt);
          const response = await axios.get(`/api/db/business/get/calendar/list?DataIncicio=${daysOfMonth.DataInicio}&DataFim=${daysOfMonth.DataFim}&Vendedor=${User}`);
          setData(response.data);
          setLoad(false);
        } catch (error) {
          console.log(error);
        }
      })();
    }
  }

  function handleUserChange(user: React.SetStateAction<string>) {
    setUser(user)
  }



  return (
    <>
      <Flex h="100%" w="100%" flexDir={"column"} justifyContent="center">
        <Flex
          h={12}
          w='100%'
          borderBottom={"2px"}
          borderColor={"gray.200"}
          m="auto"
          my='0.5rem'
          alignItems={"center"}
          justifyContent={'end'}
        >

          <BtCreate onLoading={tragetReload} user={User} />
        </Flex>
        <Box h={"95%"}>
          <Flex
            bg="yellow.50"
            h="100%"
            w={'100%'}
          >
            <PowerBi reload={load} dados={data} user={handleUserChange} setdados={data.length} />
          </Flex>
        </Box>
      </Flex>
    </>
  );
}

export default memo(Negocios)
