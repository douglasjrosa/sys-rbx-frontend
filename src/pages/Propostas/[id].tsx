import { Box, Button, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { CardList } from "../../components/Proposta/listaItens";
import { BsArrowLeftCircleFill } from "react-icons/bs";

export default function ListaProposta() {
  const router = useRouter();
  const ID: any = router.query.id;
  console.log("🚀 ~ file: [id].tsx:8 ~ ListaProposta ~ ID:", ID)




  return (
    <>
      <Flex h="100%" w="100%" flexDir={"column"} justifyContent="center">
        <Flex
          w="100%"
          borderBottom={"2px"}
          borderColor={"gray.200"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <Box ms={16}>
            <BsArrowLeftCircleFill
              color="blue"
              cursor={'pointer'}
              size={30}
              onClick={() => router.push('/negocios/' + ID)}
            />
          </Box>
          <Button
            my={'3'}
            me={16}
            colorScheme="whatsapp"
            onClick={() => {
              localStorage.setItem("id", ID);
              router.push("/Propostas/create");
            }}
          >
            Nova Proposta
          </Button>
        </Flex>
        <Box h={"90%"}>
          <Flex
            bg="#edf3f8"
            pt={"1rem"}
            pb={"0.5rem"}
            px={"1rem"}
            h="full"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
            <Box
              h="full"
              border={"1px solid"}
              p={4}
              w="full"
              borderColor={"gray.400"}
              rounded={"1rem"}
              boxShadow={'2xl'}
            >
              <Flex w={"full"} overflowX={"hidden"} >
                <Flex
                  h={"full"}
                  flexWrap={'wrap'}
                  justifyContent={'center'}
                  gap='4'
                  px='4'
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
