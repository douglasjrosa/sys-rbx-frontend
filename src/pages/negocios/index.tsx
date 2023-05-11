import {
  Box,
  Flex,
} from "@chakra-ui/react";
import { useState } from "react";
import { BodyCard } from "../../components/negocios/component/boduCard";
import { BtCreate } from "../../components/negocios/component/butonCreate";


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
        <Box h={"95%"} overflow={"auto"}>
          <Flex
            bg="#edf3f8"
            pt={"1.5rem"}
            pb={"2rem"}
            px={"0.8rem"}
            h="100%"
            alignItems="center"
            justifyContent="center"
          >
            <BodyCard reload={load} />
          </Flex>
        </Box>
      </Flex>
    </>
  );
}
