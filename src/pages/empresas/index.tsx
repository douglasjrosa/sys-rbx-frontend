import { useRouter } from "next/router";
import { Box, Button, Flex, Select } from "@chakra-ui/react";
import CardEmpresa from "../../components/empresa/lista/card/card";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { InferGetStaticPropsType } from "next";

export async function getStaticProps() {

  const Token =  process.env.ATORIZZATION_TOKEN
  const data = await fetch(
    process.env.NEXT_PUBLIC_STRAPI_API_URL +
      "/empresas?filters[status][$eq]=true&&fields[0]=nome",{
        headers:{
            Authorization: `Bearer ${Token}`,
        }
      }
  );
  const resposta =  await data.json();
  const ListEmpesa = await resposta.data;

  return {
    props: { ListEmpesa },
  };
}

export default function Empresas({
  ListEmpesa,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  const { data: session } = useSession();
  const [Data, setData] = useState<any[]>([]);
  const [id, setId] = useState("");

  useEffect(() => {
    setData(ListEmpesa);
  }, [ListEmpesa]);

  return (
    <Flex h="100%" w="100%" flexDir={"column"} justifyContent="center">
      <Flex
        h={24}
        w={{ md: "80%", sm: "100%" }}
        borderBottom={"2px"}
        borderColor={"gray.200"}
        m="auto"
        mt={{ md: 5, sm: "1.5rem" }}
        justifyContent={"space-evenly"}
        alignItems={"center"}
        flexDir={{ sm: "column", md: "row" }}
      >
        <Flex gap="1rem" alignItems={"center"}>
          <Select
            borderColor="gray.600"
            focusBorderColor="brand.400"
            size="md"
            w="20rem"
            fontSize="xs"
            rounded="md"
            placeholder="selecine uma opção"
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
          <Button
            colorScheme="blackAlpha"
            onClick={() => router.push(`/empresas/atualizar/${id}`)}
          >
            Editar Empresa
          </Button>
        </Flex>
        <Box
          display={"flex"}
          flexDir={{ md: "column", sm: "row" }}
          h="100%"
          justifyContent={"space-evenly"}
        >
          <Button
            h={{ md: "40%", sm: "70%" }}
            colorScheme="whatsapp"
            onClick={() => router.push("/empresas/cadastro")}
          >
            Cadastrar Empresa
          </Button>
          {session?.user.pemission !== "Adm" ? null : (
            <Button
              h={{ md: "40%", sm: "70%" }}
              colorScheme="telegram"
              onClick={() => router.push("/empresas/ativate/")}
            >
              Ativar Cadastro
            </Button>
          )}
        </Box>
      </Flex>
      <Box h={"95%"} bg="#edf3f8" overflow={"auto"}>
        <Flex py={50} justifyContent={"center"} px={5} w="full">
          {/* <CardEmpresa /> */}
        </Flex>
      </Box>
    </Flex>
  );
}
