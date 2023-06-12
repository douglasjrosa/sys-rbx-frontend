import {
  Box,
  Flex,
} from "@chakra-ui/react";
import { useState } from "react";
import { BtCreate } from "../../components/negocios/component/butonCreate";
import { PowerBi } from "@/components/negocios/bi";


export default function Negocios() {
  const [load, setLoad] = useState<boolean>(false);

  function tragetReload(Loading: boolean | ((prevState: boolean) => boolean)) {
    setLoad(Loading);
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

          <BtCreate onLoading={tragetReload} />
        </Flex>
        <Box h={"95%"}>
          <Flex
            bg="yellow.50"
            h="100%"
            w={'100%'}
          >
            <PowerBi  reload={load}/>
          </Flex>
        </Box>
      </Flex>
    </>
  );
}
