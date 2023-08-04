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
            <PowerBi reload={load} dados={data} setdados={data.length} />
          </Flex>
        </Box>
      </Flex>
    </>
  );
}

export default Negocios
