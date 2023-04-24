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
          h={28}
          w={{ md: "80%", sm: "100%" }}
          borderBottom={"2px"}
          borderColor={"gray.200"}
          m="auto"
          mt={{ md: 5, sm: "1.5rem" }}
          justifyContent={"space-evenly"}
          alignItems={"center"}
          flexDir={{ sm: "column", md: "row" }}
        >
          <Box></Box>
          <Box
            display={"flex"}
            flexDir={{ md: "column", sm: "row" }}
            h="100%"
            justifyContent={"space-evenly"}
          >
            <BtCreate onLoading={tragetReload} />
          </Box>
        </Flex>
        <Box h={"85%"} overflow={"auto"}>
          <Flex
            bg="#edf3f8"
            _dark={{
              bg: "#3e3e3e",
            }}
            pt={"3rem"}
            pb={"2rem"}
            px={"2rem"}
            h="100%"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            gap={5}
          >
            <BodyCard reload={load} />
          </Flex>
        </Box>
      </Flex>
    </>
  );
}
