import { Box, Button, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { CardList } from "../../components/Proposta/listaItens";

export default function ListaProposta() {
  const router = useRouter();
  const ID: any = router.query.id;
  console.log("🚀 ~ file: [id].tsx:8 ~ ListaProposta ~ ID:", ID)




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
          <Box
            display={"flex"}
            flexDir={{ md: "column", sm: "row" }}
            h="100%"
            justifyContent={"space-evenly"}
          >
            <Button
              h={{ md: "40%", sm: "70%" }}
              colorScheme="whatsapp"
              onClick={() => {
                localStorage.setItem("id", ID);
                router.push("/Propostas/create");
              }}
            >
              Nova Proposta
            </Button>
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
            h="full"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            gap={5}
          >
            <Box
              h="full"
              border={"1px solid"}
              borderColor={"gray.400"}
              rounded={"5rem"}
            >
              <Flex mx={"10rem"} w={"full"} p={10}>
                <Flex
                  h={"full"}
                  overflowX={"hidden"}
                  justifyContent="center"
                >
                  <CardList id={ID} />
                </Flex>
              </Flex>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </>
  );
}
