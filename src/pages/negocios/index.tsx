import {
  Box,
  Flex,
} from "@chakra-ui/react";

import { PowerBi } from "@/components/negocios/bi";

function Negocios() {

  return (
    <>
      <Flex bg="gray.800" h="100vh" w="100%" flexDir={"column"} justifyContent="center">
        <Box h={"100%"}>
          <Flex
            bg="gray.800"
            w={'100%'}
            p={1}
          >
            <PowerBi />
          </Flex>
        </Box>
      </Flex>
    </>
  );
}

export default Negocios
