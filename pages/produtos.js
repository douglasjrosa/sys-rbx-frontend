import { Box, SimpleGrid } from "@chakra-ui/react";

const Produtos = () => {
  return (
    <SimpleGrid bg="gray.200" h="500px" w="400px" m="20px" p="20px" >
      <SimpleGrid pos="relative">
        <Box
          pos="absolute"
          border="1px solid gray"
          bg="rgba(200,200,20,0.75)"
          h="10px"
          w="100%"
          left="0%"
          />
        <Box
          pos="absolute"
          border="1px solid gray"
          bg="rgba(200,200,20,0.75)"
          h="200px"
          w="10px"
          top="10px"
          left="0%"
          />
        <Box
          pos="absolute"
          border="1px solid gray"
          bg="rgba(200,200,20,0.75)"
          h="200px"
          w="10px"
          top="10px"
          left="33%"
          />
        <Box
          pos="absolute"
          border="1px solid gray"
          bg="rgba(200,200,20,0.75)"
          h="200px"
          w="10px"
          top="10px"
          left="66%"
        />
        <Box
          pos="absolute"
          border="1px solid gray"
          bg="rgba(200,200,20,0.75)"
          h="200px"
          w="10px"
          top="10px"
          right="0"
        />
        <Box
          pos="absolute"
          border="1px solid gray"
          bg="rgba(200,200,20,0.75)"
          h="10px"
          w="100%"
          bottom="0"
          left="0"
        />
      </SimpleGrid>
    </SimpleGrid>
  );
};

export default Produtos;
