/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import { Box, chakra, Flex, Link, Toast } from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function CardBusiness(props: {
  id: string;
  nBusiness: string;
  deadline: string;
  Budget: string;
  empresa: any;
  criateed: any;
  pedidos: string;
  pedidosQtd: any;
  onloading: any;
  andamento: string;
}) {
  const router = useRouter();
  const empresa = !props.empresa
    ? ''
    : props.empresa.data === null
    ? ''
    : props.empresa.data.attributes.nome;

  const soma = () => {
    const valores = props.pedidosQtd.map((i: any) =>
      parseFloat(
        i.attributes.totalGeral
          .replace('R$', '')
          .replace('.', '')
          .replace(',', '.'),
      ),
    );
    const soma = valores.reduce((acc: any, curr: any) => acc + curr, 0);
    return soma.toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <>
      <Box
        mx="auto"
        px={8}
        py={5}
        mb={5}
        rounded="lg"
        shadow="lg"
        boxShadow="dark-lg"
        bg="white"
        _dark={{
          bg: 'gray.900',
        }}
        w={'100%'}
        key={props.id}
        fontSize="sm"
      >
        <Flex justifyContent="space-between" alignItems="center">
          <chakra.span
            fontSize="sm"
            color="gray.600"
            _dark={{
              color: 'gray.400',
            }}
          >
            <b>Crieate:</b> {new Date(props.criateed).toLocaleString()}
          </chakra.span>
          <chakra.span
            fontSize="sm"
            color="gray.600"
            _dark={{
              color: 'gray.400',
            }}
          >
            <b>Deadline:</b> {new Date(props.deadline).toLocaleDateString()}
          </chakra.span>
          <Flex
            justifyContent="space-between"
            alignItems="center"
            flexDirection={['column', 'row', 'row']}
            w={36}
            gap={5}
          >
            <Link
              px={3}
              py={1}
              bg="gray.600"
              color="gray.100"
              fontSize="sm"
              fontWeight="700"
              rounded="md"
              _hover={{
                bg: 'gray.500',
              }}
              onClick={async () => {
                props.onloading(true);
                await axios('/api/db/business/delete/' + props.id)
                  .then((res: any) => {
                    Toast({
                      title: 'Business Deleted',
                      description: res.data,
                      status: 'info',
                      duration: 3000,
                      isClosable: true,
                    });
                    props.onloading(false);
                  })
                  .catch((err: any) => {
                    console.error(err);
                    props.onloading(false);
                  });
              }}
            >
              Delete
            </Link>
            <Link
              px={3}
              py={1}
              bg="gray.600"
              color="gray.100"
              fontSize="sm"
              fontWeight="700"
              rounded="md"
              _hover={{
                bg: 'gray.500',
              }}
              onClick={async () => {
                await router.push('/negocios/' + props.id);
              }}
            >
              History
            </Link>
          </Flex>
        </Flex>

        <Box mt={2}>
          <Flex>
            <Box w={'15rem'}>
              <Link
                fontSize="2xl"
                color="gray.700"
                _dark={{
                  color: 'white',
                }}
                fontWeight="700"
                _hover={{
                  color: 'gray.600',
                  _dark: {
                    color: 'gray.200',
                  },
                  textDecor: 'underline',
                }}
              >
                {props.nBusiness}
              </Link>
            </Box>
            <Flex>
              <chakra.p
                mt={2}
                color="gray.600"
                ms={5}
                _dark={{
                  color: 'gray.300',
                }}
              >
                Andamento:
              </chakra.p>
              <chakra.p
                mt={2}
                color="gray.600"
                ms={2}
                _dark={{
                  color: 'gray.300',
                }}
              >
                {props.andamento}
              </chakra.p>
            </Flex>
          </Flex>

          <Box
            mt={2}
            display={'flex'}
            flexDirection={['column', 'column', 'row', 'row']}
          >
            <Flex w={'12rem'}>
              <chakra.p
                mt={2}
                color="gray.600"
                _dark={{
                  color: 'gray.300',
                }}
              >
                Estimativa:
              </chakra.p>
              <chakra.p
                mt={2}
                color="gray.600"
                ms={2}
                _dark={{
                  color: 'gray.300',
                }}
              >
                {props.Budget}
              </chakra.p>
            </Flex>
            <Flex>
              <chakra.p
                mt={2}
                color="gray.600"
                ms={5}
                _dark={{
                  color: 'gray.300',
                }}
              >
                Total do Pedido:
              </chakra.p>
              <chakra.p
                mt={2}
                color="gray.600"
                ms={2}
                _dark={{
                  color: 'gray.300',
                }}
              >
                {soma()}
              </chakra.p>
            </Flex>
          </Box>
          <Box
            display={'flex'}
            alignItems={'center'}
            justifyContent={'space-between'}
          >
            <Flex alignItems="center">
              <chakra.p
                mt={2}
                color="gray.600"
                _dark={{
                  color: 'gray.300',
                }}
              >
                Empresa:
              </chakra.p>
              <chakra.p
                mt={2}
                color="gray.600"
                ms={2}
                _dark={{
                  color: 'gray.300',
                }}
              >
                {empresa}
              </chakra.p>
            </Flex>
            <Flex alignItems="center">
              <chakra.p
                mt={2}
                color="gray.600"
                _dark={{
                  color: 'gray.300',
                }}
              >
                Qtd pdidos:
              </chakra.p>
              <chakra.p
                mt={2}
                color="gray.600"
                ms={2}
                _dark={{
                  color: 'gray.300',
                }}
              >
                {props.pedidos}
              </chakra.p>
            </Flex>
          </Box>
        </Box>
      </Box>
    </>
  );
}
