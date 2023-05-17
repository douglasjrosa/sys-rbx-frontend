import {
  Box,
  Button,
  chakra,
  Flex,
  Link,
  SimpleGrid,
  Text,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BTMPdf } from "../BTMPdf";



export const CardList = (props: { id: string }) => {
  const router = useRouter();
  const toast = useToast();
  const url = "/api/db/proposta/get/business/" + props.id;
  const [Data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      const requeste = await axios(url);
      const response = requeste.data;
      setData(response);
    })();
  }, [url]);

  const pedido = async (numero: string) => {
    toast({
      title: "Só um momento estou processando!",
      status: "warning",
      isClosable: true,
      position: 'top-right',
    });

    try {
      const requests = [
        axios({
          url: `/api/db/nLote/${numero}`,
          method: "POST",
        }),
        axios({
          url: `/api/ribermax/lote/${numero}`,
          method: "POST",
        }),
        axios({
          url: `/api/db/trello/${numero}`,
          method: "POST",
        }),
        axios({
          url: "/api/query/pedido/" + numero,
          method: "POST",
        })
      ];

      // Executa todas as requisições em paralelo
      const [res1, res2, res3] = await Promise.all(requests.slice(0, 3));
      const res4 = await requests[3];

      console.log(res1.data);
      console.log(res2.data);
      console.log(res3.data);

      toast({
        title: "Pedido realizado com sucesso!",
        status: "success",
        duration: 5000,
        position: 'top-right',
      });

      setTimeout(() => router.push("/negocios/" + props.id), 1500);

    } catch (err: any) {
      console.log(err.response.data);

      toast({
        title: "Opss.",
        description: "Entre en contata com o suporte",
        status: "error",
        duration: 9000,
        position: 'top-right',
      });
    }
  };

  return (
    <>

      {!Data
        ? null
        : Data.map((i: any) => {
          console.log("🚀 ~ file: index.tsx:111 ~ CardList ~ i:", i)
          const dat = new Date(i.attributes.dataPedido);
          const meses = [
            "Jan",
            "Fev",
            "Mar",
            "Abr",
            "Mai",
            "Jun",
            "Jul",
            "Ago",
            "Set",
            "Out",
            "Nov",
            "Dez",
          ];
          const DataPedido = `${dat.getDate() + 1} ${meses[dat.getMonth()]
            } ${dat.getFullYear()}`;

          return (
            <>
              <Box
                rounded="xl"
                shadow="md"
                bg="white"
                w="24rem"
                px={4}
                py={4}
              >
                <Box>
                  <Flex w={"fill"} flexWrap={'wrap'} gap={3}>
                    <Text fontSize="0.8rem" fontWeight="bold" color="gray.700">
                      Proposta N°:{" "}
                      <chakra.span
                        fontSize="0.8rem"
                        fontWeight="light"
                        textTransform="uppercase"
                        color="brand.600"
                      >
                        {i.attributes.nPedido}
                      </chakra.span>
                    </Text>
                    <Text fontSize="0.8rem" fontWeight="bold" color="gray.700">
                      Negocio N°:{" "}
                      <chakra.span
                        fontSize="0.8rem"
                        fontWeight="light"
                        textTransform="uppercase"
                        color="brand.600"
                      >
                        {i.attributes.business.data.attributes.nBusiness}
                      </chakra.span>
                    </Text>
                    <Text
                      mx={2}
                      fontWeight="bold"
                      color="gray.700"
                      fontSize="0.8rem"
                    >
                      Pedido gerado em : {''}
                      <chakra.span
                        mx={1}
                        fontSize="0.8rem"
                        color="gray.600"
                        fontWeight="light"
                      >
                        {DataPedido}
                      </chakra.span>
                    </Text>
                  </Flex>
                  <Flex
                    mt={2}
                    justifyContent={"center"}
                    alignItems={"center"}
                    flexDir={"column"}
                  >
                    <Text
                      display="block"
                      color="gray.800"
                      fontWeight="bold"
                      fontSize="lg"
                      mt={2}
                      textAlign={"center"}
                    >
                      {!i.attributes.empresa
                        ? null
                        : i.attributes.empresa.data.attributes.nome}
                    </Text>
                  </Flex>

                  <Box mt={3}>
                    <Flex flexWrap={'wrap'} gap={3}>
                      <Button
                        fontSize={'0.8rem'}
                        p={3}
                        colorScheme={"blackAlpha"}
                        onClick={() =>
                          router.push(
                            "/Propostas/update/" + i.attributes.nPedido
                          )
                        }
                      >
                        Editar Proposta
                      </Button>
                      <BTMPdf nPedido={i.attributes.nPedido} empresa={i.attributes.empresa.data.attributes.nome} />
                      <Button
                        fontSize={'0.8rem'}
                        p={3}
                        colorScheme={"messenger"}
                        onClick={() => pedido(i.attributes.nPedido)}
                        isDisabled={i.attributes.business.data.attributes.andamento === 5 ? false : true}
                      >
                        Gerar Pedido
                      </Button>
                    </Flex>
                  </Box>
                </Box>
              </Box>
            </>
          );
        })}
    </>
  );
};
