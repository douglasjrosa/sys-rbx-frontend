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
import { BeatLoader } from "react-spinners";
import Loading from "@/components/elements/loading";



export const CardList = (props: { id: string; onloading: any }) => {
  const [load, setLoad] = useState<boolean>(false)
  const [LoadGeral, setLoadGeral] = useState<boolean>(false)
  const [IdLoad, setIdLoad] = useState('')
  const router = useRouter();
  const toast = useToast();
  const url = "/api/db/proposta/get/business/" + props.id;
  const [Data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      setLoadGeral(true)
      const requeste = await axios(url);
      const response = requeste.data;
      setData(response);
      setLoadGeral(false)
    })();
  }, [props, url]);

  const pedido = async (numero: string) => {
    setLoad(true)
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
      setLoad(false)
      setIdLoad('')
      router.push("/negocios/" + props.id);

    } catch (err: any) {
      console.log(err.response.data.message);
      if (err.response.data.message) {
        toast({
          title: "Opss.",
          description: err.response.data.message,
          status: "info",
          duration: 5000,
          position: 'top-right',
          isClosable: true,
        });
        setLoad(false)
        setIdLoad('')
        router.push("/negocios/" + props.id);
      } else {
        toast({
          title: "Opss.",
          description: "Entre en contata com o suporte",
          status: "error",
          duration: 3000,
          position: 'top-right',
          isClosable: true,
        });
        setLoad(false)
        setIdLoad('')
      }
    }
  };

  if (LoadGeral) {
    return <Loading size="200px">Carregando...</Loading>;
  }

  return (
    <>
      <Box
        h="full"
        border={"1px solid"}
        p={4}
        w="full"
        borderColor={"gray.400"}
        rounded={"1rem"}
        boxShadow={'2xl'}
      >
        <Flex w={"full"} overflowX={"hidden"} flexWrap={'wrap'} gap={4}>

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
                    w="25rem"
                    px={4}
                    py={4}
                    key={i.id}
                  >
                    <Box>
                      <Flex w={"fill"} flexWrap={'wrap'} gap={1}>
                        <Text mx={2} fontSize="0.8rem" fontWeight="bold" color="gray.700">
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
                      <Flex hidden={i.attributes.itens.length < 1 ? false : true}>
                        <Box mx={2} bg={'yellow'} w={4} h={4} rounded={10} />
                        <Text
                          mx={1}
                          fontWeight="bold"
                          color="gray.700"
                          fontSize="0.8rem"
                        >
                          Verifique a Proposta antes de de gerar o Pedido
                        </Text>
                      </Flex>

                      <Box hidden={i.attributes.Bpedido !== null ? false : true}>
                        <Text
                          mx={2}
                          fontWeight="bold"
                          color="gray.700"
                          fontSize="0.8rem"
                        >
                          N° Bling : {''}
                          <chakra.span
                            mx={1}
                            fontSize="0.8rem"
                            color="gray.600"
                            fontWeight="light"
                          >
                            {i.attributes.Bpedido}
                          </chakra.span>
                        </Text>
                      </Box>
                      <Flex
                        mt={1}
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
                                "/propostas/update/" + i.attributes.nPedido
                              )
                            }
                            isDisabled={i.attributes.Bpedido !== null ? true : false}
                          >
                            Editar Proposta
                          </Button>
                          <BTMPdf nPedido={i.attributes.nPedido} empresa={i.attributes.empresa.data.attributes.nome} />
                          <Button
                            isLoading={load && IdLoad == i.id}
                            spinner={<BeatLoader size={8} color="white" />}
                            fontSize={'0.8rem'}
                            p={3}
                            colorScheme={"messenger"}
                            onClick={() => {
                              setIdLoad(i.id)
                              pedido(i.attributes.nPedido)
                            }}
                            isDisabled={i.attributes.business.data.attributes.andamento !== 5 ? true : i.attributes.Bpedido !== null ? true : i.attributes.itens.length < 1 ? true : false}
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
        </Flex>
      </Box>
    </>
  );
};
