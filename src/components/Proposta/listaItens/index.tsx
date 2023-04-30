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
      console.table(response);
      setData(response);
    })();
  }, [url]);

  const pedido = async (numero: string) => {

    const url = "/api/query/pedido/" + numero;
    await axios({
      url: url,
      method: "POST",
    })
      .then(() => {})
      .catch((err: any) => {
        console.log(err.response.data);
      });

    // await axios({
    //   url: `/api/db/nLote/${numero}`,
    //   method: "POST",
    // })
    //   .then((res: any) => {
    //     console.log(res.data);
    //     lotes.push(res.data);
    //   })
    //   .catch((err: any) => {
    //     console.log(err.response.data);
    //   });

    // await axios({
    //   url: `/api/ribermax/lote/${numero}`,
    //   method: "POST",
    // })
    //   .then((res) => {
    //     console.log(res.data);
    //   })
    //   .catch((err: any) => {
    //     console.log(err.response.data);
    //   });

    // await axios({
    //   url: `/api/db/trello/${numero}`,
    //   method: "POST",
    // })
    //   .then((res: any) => {
    //     console.log(res.data);
    //   })
    //   .catch(async (err: any) => {
    //     toast({
    //       title: "Opss.",
    //       description: "Entre en contata com o suporte",
    //       status: "error",
    //       duration: 9000,
    //     });
    //   });
  };

 console.log(Data)
  return (
    <>
      <SimpleGrid
        p="1rem"
        columns={{ base: 1, md: 3 }}
        row={{ base: 1, md: 5 }}
        spacing={{ base: 3, md: 36 }}
      >
        {!Data
          ? null
          : Data.map((i: any) => {
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
              const DataPedido = `${dat.getDate() + 1} ${
                meses[dat.getMonth()]
              } ${dat.getFullYear()}`;

              return (
                <>
                  <Box
                    mx="auto"
                    rounded="xl"
                    shadow="md"
                    bg="white"
                    w="sm"
                    h={"auto"}
                    px={5}
                    py={4}
                  >
                    <Box>
                      <Flex w={"fill"} justifyContent={"space-evenly"}>
                        <Text fontWeight="bold" color="gray.700">
                          Proposta N°:{" "}
                          <chakra.span
                            fontSize="sm"
                            fontWeight="light"
                            textTransform="uppercase"
                            color="brand.600"
                          >
                            {i.attributes.nPedido}
                          </chakra.span>
                        </Text>
                        <Text fontWeight="bold" color="gray.700">
                          Negocio N°:{" "}
                          <Link
                            fontSize="sm"
                            fontWeight="light"
                            textTransform="uppercase"
                            color="brand.600"
                            onClick={() =>
                              router.push(
                                "/negocios/" + i.attributes.business.data.id
                              )
                            }
                          >
                            {i.attributes.business.data.attributes.nBusiness}
                          </Link>
                        </Text>
                      </Flex>
                      <Flex
                        h={20}
                        mt={2}
                        justifyContent={"center"}
                        alignItems={"center"}
                        flexDir={"column"}
                      >
                        <Text
                          display="block"
                          color="gray.800"
                          fontWeight="bold"
                          fontSize="xl"
                          mt={2}
                        >
                          Cliente:
                        </Text>
                        <Text
                          display="block"
                          color="gray.800"
                          fontWeight="bold"
                          fontSize="xl"
                          textAlign={"center"}
                          mt={2}
                          _hover={{
                            color: "gray.600",
                            textDecor: "underline",
                          }}
                        >
                          {!i.attributes.empresa
                            ? null
                            : i.attributes.empresa.data.attributes.nome}
                        </Text>
                      </Flex>

                      <Box mt={5}>
                        <Flex alignItems="center">
                          <Flex alignItems="center">
                            <Text
                              mx={2}
                              fontWeight="bold"
                              color="gray.700"
                              _dark={{
                                color: "gray.200",
                              }}
                            >
                              Pedido gerado em :
                            </Text>
                          </Flex>
                          <chakra.span
                            mx={1}
                            fontSize="sm"
                            color="gray.600"
                            _dark={{
                              color: "gray.300",
                            }}
                          >
                            {DataPedido}
                          </chakra.span>
                        </Flex>
                        <Flex flexDir={"column"} gap={5} mt={3}>
                          <Button
                            p={5}
                            w={"full"}
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
                            p={5}
                            w={"full"}
                            colorScheme={"messenger"}
                            onClick={() => pedido(i.attributes.nPedido)}
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
      </SimpleGrid>
    </>
  );
};
