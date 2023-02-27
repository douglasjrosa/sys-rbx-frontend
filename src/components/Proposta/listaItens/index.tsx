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

export const CardList = (props: { url: string }) => {
  const router = useRouter();
  const url = props.url;
  const [Data, setData] = useState([]);
  useEffect(() => {
    (async () => {
      const requeste = await axios(url);
      const response = requeste.data;
      console.table(response);
      setData(response);
    })();
  }, [url]);
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
                        _dark={{
                          bg: 'gray.800',
                        }}
                        w="sm"
                        h={'20rem'}
                        py={5}
                      >
                        <Box p={6}>
                          <Box>
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
                            <Text fontWeight="bold" color="gray.700" mt={3}>
                              Negocio N°:{' '}
                              <Link
                                fontSize="sm"
                                fontWeight="light"
                                textTransform="uppercase"
                                color="brand.600"
                                onClick={() =>
                                  router.push(
                                    '/negocio/' + i.attributes.negocio,
                                  )
                                }
                              >
                                {i.attributes.negocio}
                              </Link>
                            </Text>
                          </Box>
                          <Flex
                            h={20}
                            justifyContent={'center'}
                            alignItems={'center'}
                          >
                            <Link
                              display="block"
                              color="gray.800"
                              _dark={{
                                color: 'white',
                              }}
                              fontWeight="bold"
                              fontSize="2xl"
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
                              Cliente: {''}
                              {!i.attributes.empresa.data
                                ? null
                                : i.attributes.empresa.data.attributes.nome}
                            </Link>
                          </Flex>

                          <Box mt={4}>
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
                            <Box mt={3}>
                              <Button
                                p={7}
                                w={'full'}
                                colorScheme={'whatsapp'}
                                // onClick={() =>
                                //   router.push(
                                //     `/api/db/proposta/pdf/${i.attributes.nPedido}`,
                                //   )
                                // }
                                onClick={() =>
                                  window.open(
                                    `/api/db/proposta/pdf/${i.attributes.nPedido}`,
                                    '_blank',
                                  )
                                }
                              >
                                Gerar PDF
                              </Button>
                            </Box>
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
