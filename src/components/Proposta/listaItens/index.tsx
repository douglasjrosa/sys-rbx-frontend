import {
  Box,
  Button,
  chakra,
  Flex,
  Link,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export const CardList = (props: { id: string }) => {
  const router = useRouter();
  const url = '/api/db/proposta/get/business/' + props.id;
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
    const url = '/api/query/pedido/' + numero;
    await axios({
      url: url,
      method: 'POST',
    })
      .then((res: any) => {})
      .catch((err: any) => {
        console.log(err);
      });
  };

  return (
    <>
      <Flex
        mx={'10rem'}
        w={'full'}
        h={'full'}
        border={'1px solid'}
        borderColor={'gray.400'}
        rounded={'5rem'}
        p={10}
      >
        <Flex
          h={'full'}
          w={'full'}
          overflowX={'hidden'}
          justifyContent="center"
        >
          <SimpleGrid
            p="1rem"
            columns={{ base: 1, md: 3 }}
            row={{ base: 1, md: 5 }}
            spacing={{ base: 3, md: 10 }}
          >
            {!Data
              ? null
              : Data.map((i, x) => {
                  console.log(i);
                  const dat = new Date(i.attributes.dataPedido);
                  const meses = [
                    'Jan',
                    'Fev',
                    'Mar',
                    'Abr',
                    'Mai',
                    'Jun',
                    'Jul',
                    'Ago',
                    'Set',
                    'Out',
                    'Nov',
                    'Dez',
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
                        h={'20rem'}
                        px={5}
                        py={4}
                      >
                        <Box>
                          <Flex w={'fill'} justifyContent={'space-evenly'}>
                            <Text fontWeight="bold" color="gray.700">
                              Pedido N°:{' '}
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
                              Negocio N°:{' '}
                              <Link
                                fontSize="sm"
                                fontWeight="light"
                                textTransform="uppercase"
                                color="brand.600"
                                onClick={() =>
                                  router.push(
                                    '/negocios/' +
                                      i.attributes.business.data.id,
                                  )
                                }
                              >
                                {
                                  i.attributes.business.data.attributes
                                    .nBusiness
                                }
                              </Link>
                            </Text>
                          </Flex>
                          <Flex
                            h={20}
                            mt={5}
                            justifyContent={'center'}
                            alignItems={'center'}
                            flexDir={'column'}
                          >
                            <Link
                              display="block"
                              color="gray.800"
                              fontWeight="bold"
                              fontSize="xl"
                              mt={2}
                            >
                              Cliente:
                            </Link>
                            <Link
                              display="block"
                              color="gray.800"
                              fontWeight="bold"
                              fontSize="xl"
                              textAlign={'center'}
                              mt={2}
                              _hover={{
                                color: 'gray.600',
                                textDecor: 'underline',
                              }}
                              onClick={() =>
                                router.push(
                                  '/Propostas/update/' + i.attributes.nPedido,
                                )
                              }
                            >
                              {!i.attributes.empresa
                                ? null
                                : i.attributes.empresa.data.attributes.nome}
                            </Link>
                          </Flex>

                          <Box mt={5}>
                            <Flex alignItems="center">
                              <Flex alignItems="center">
                                <Text
                                  mx={2}
                                  fontWeight="bold"
                                  color="gray.700"
                                  _dark={{
                                    color: 'gray.200',
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
                                  color: 'gray.300',
                                }}
                              >
                                {DataPedido}
                              </chakra.span>
                            </Flex>
                            <Flex flexDir={'column'} gap={5} mt={3}>
                              <Button
                                p={5}
                                w={'full'}
                                colorScheme={'whatsapp'}
                                onClick={() =>
                                  window.open(
                                    `/api/db/proposta/pdf/${i.attributes.nPedido}`,
                                    '_blank',
                                  )
                                }
                              >
                                Gerar PDF
                              </Button>
                              <Button
                                p={5}
                                w={'full'}
                                colorScheme={'messenger'}
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
        </Flex>
      </Flex>
    </>
  );
};
