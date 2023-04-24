import { Search2Icon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Flex,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  useToast,
} from "@chakra-ui/react";
import CardEmpresa from "../../components/empresa/lista/card/card";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Empresas() {
  const router = useRouter();
  const { data: session } = useSession();
  const [Data, setData] = useState<any[]>([]);
  const [id, setId] = useState('')
  const toast = useToast();

  useEffect(() => {
    (async () => {
      await fetch("/api/db/empresas/getEmpresaMin")
        .then((resp: any) => resp.json())
        .then((result: any) => {
          console.log("🚀 ~ file: index.tsx:29 ~ .then ~ result:", result);
          setData(result);
        })
        .catch((err) => {
          toast({
            title: "Ops!.. Não tem empresa?.",
            description:
              "Algo de errado esta acontecendo, entre em contato com o adm do sistema.",
            status: "warning",
            duration: 12000,
          });
        });
    })();
  }, [toast]);

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
        <Flex gap='1rem' alignItems={'center'}>
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
