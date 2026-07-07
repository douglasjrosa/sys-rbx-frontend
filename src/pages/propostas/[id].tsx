import { Box, Button, Flex, IconButton } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { CardList } from "../../components/Proposta/listaItens";
import { BsArrowLeftCircleFill } from "react-icons/bs";
import { useState } from "react";

export default function ListaProposta() {
  const router = useRouter();
  const ID: any = router.query.id;
  const [Load, setLoad] = useState(false)
  const [Disble, setDisble] = useState(false)

  function getLoading(Loading: boolean | ((prevState: boolean) => boolean)) {
    setLoad(Loading);
  }
  function getDisable(disable: boolean | ((prevState: boolean) => boolean)) {
    setDisble(disable);
  }

  return (
    <>
      <Flex h="100%" w="100%" flexDir={"column"} justifyContent="center" bg={'gray.800'}>
        <Flex
          w="100%"
          justifyContent={"space-between"}
          alignItems={"center"}
          px='10'
          h={"8%"}
        >
          <Box>
             <IconButton aria-label='voltar' rounded={'3xl'} onClick={() => router.push('/negocios/' + ID)} icon={<BsArrowLeftCircleFill size={30} color="#136dcc" />} />
          </Box>
          <Button
            mb={'3'}
            colorScheme="whatsapp"
            isDisabled={Disble}
            onClick={() => {
              localStorage.setItem("id", ID);
              router.push("/propostas/create");
            }}
          >
            Nova Proposta
          </Button>
        </Flex>
        <Box h={"92%"} py='3'>
          <Flex
            bg="gray.800"
            pb={"0.5rem"}
            px={"1rem"}
            h="full"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
          >
              <CardList id={ID} onloading={getLoading} desbilitar={getDisable} />
          </Flex>
        </Box>
      </Flex>
    </>
  );
}
