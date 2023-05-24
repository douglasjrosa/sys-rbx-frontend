import { useRouter } from "next/router";
import { Box, Button, Flex, Select } from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";


function Empresas() {
  const router = useRouter();
  const { data: session } = useSession();
  const [Data, setData] = useState<any[]>([]);
  const [id, setId] = useState("");

  useEffect(() => {
    (async()=> {
      await fetch("/api/db/empresas/getEmpresamin")
      .then((Response) => Response.json())
      .then((resposta: any) => setData(resposta) )
      .catch((err) => console.log)
    })()
  }, []);

  return (
    <Flex h="100%" w="100%" flexDir={"column"} justifyContent="center">
      <Flex
        w={"100%"}
        borderBottom={"2px"}
        borderColor={"gray.200"}
        py={'1rem'}
        px={'3rem'}
        justifyContent={"space-evenly"}
        alignItems={"center"}
        flexDir={{ sm: "column", md: "row" }}
      >
        <Flex gap="1rem" alignItems={"center"}>
          <Select
            borderColor="gray.600"
            focusBorderColor="brand.400"
            size="md"
            w="18rem"
            fontSize="xs"
            rounded="md"
            placeholder="Selecione uma opção"
            onChange={(e) => setId(e.target.value)}
          >
            {!Data
              ? null
              : Data.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.attributes.nome}
                </option>
              ))}
          </Select>

        </Flex>
        <Box
          display={"flex"}
          gap={3}
          h="100%"
          justifyContent={'center'}
          alignItems="center"
          flexWrap={'wrap'}
        >
          <Button
            fontSize={'0.8rem'}
            colorScheme="blackAlpha"
            onClick={() => router.push(`/empresas/atualizar/${id}`)}
          >
            Editar Empresa
          </Button>
          <Button
            colorScheme="whatsapp"
            fontSize={'0.8rem'}
            onClick={() => router.push("/empresas/cadastro")}
          >
            Cadastrar Empresa
          </Button>
          <Button fontSize={'0.8rem'} colorScheme="cyan" onClick={() => router.push('/pessoas/cadastro')}>Add Nova Pessoa</Button>
          {session?.user.pemission !== "Adm" ? null : (
            <Button
              h={{ md: "40%", sm: "70%" }}
              colorScheme="telegram"
              fontSize={'0.8rem'}
              onClick={() => router.push("/empresas/ativate/")}
            >
              Ativar Cadastro
            </Button>
          )}
        </Box>
      </Flex>
      <Box h={"95%"} bg="#edf3f8" overflow={"auto"}>
        <Flex py={50} justifyContent={"center"} px={5} w="full">
        </Flex>
      </Box>
    </Flex>
  );
}

export default Empresas;
