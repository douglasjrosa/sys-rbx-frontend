import { Search2Icon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  chakra,
  Flex,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Link,
} from '@chakra-ui/react';
import { Header } from './components/header';

export default function Empresas(): JSX.Element {
  const router = useRouter();
  return (
    <Flex h="100%" w="100%" flexDir={'column'} justifyContent="center">
      <Header />
      <Flex
        h={24}
        w={{ md: '80%', sm: '100%' }}
        borderBottom={'2px'}
        borderColor={'gray.200'}
        m="auto"
        mt={{ md: 0, sm: '1.5rem' }}
        justifyContent={'space-evenly'}
        alignItems={'center'}
        flexDir={{ sm: 'column', md: 'row' }}
      >
        <Box>
          <InputGroup size="md">
            <Input
              pr="6rem"
              w={{ md: '26rem', sm: '30rem' }}
              type={'text'}
              placeholder="Enter password"
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm">
                <Search2Icon />
              </Button>
            </InputRightElement>
          </InputGroup>
        </Box>
        <Box
          display={'flex'}
          flexDir={{ md: 'column', sm: 'row' }}
          h="100%"
          justifyContent={'space-evenly'}
        >
          <Button h={{ md: '40%', sm: '70%' }} colorScheme="whatsapp" onClick={()=> router.push('/empresas/cadastro') }>
            Add
          </Button>
          <Button
            h={{ md: '40%', sm: '70%' }}
            ms={{ md: '0', sm: '5rem' }}
            colorScheme="teal"
          >
            Editar
          </Button>
        </Box>
      </Flex>
      <Box h={'78%'}>
        <Flex
          bg="#edf3f8"
          _dark={{
            bg: '#3e3e3e',
          }}
          p={50}
          w="full"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            mx="auto"
            px={8}
            py={2}
            rounded="lg"
            shadow="lg"
            boxShadow='dark-lg'
            bg="white"
            _dark={{
              bg: 'gray.800',
            }}
            w="3xl"
          >
            <Flex justifyContent="space-between" alignItems="center">
              <chakra.span
                fontSize="sm"
                color="gray.600"
                _dark={{
                  color: 'gray.400',
                }}
              >
                Mar 10, 2019 dete add
              </chakra.span>
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
              >
                Historico
              </Link>
            </Flex>

            <Box mt={2}>
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
                RiberMax ltda
              </Link>
              <Box mt={2} display={'flex'}>
                <chakra.p
                  mt={2}
                  color="gray.600"
                  _dark={{
                    color: 'gray.300',
                  }}
                >
                  CNPJ:
                </chakra.p>
                <chakra.p
                  mt={2}
                  color="gray.600"
                  ms={2}
                  _dark={{
                    color: 'gray.300',
                  }}
                >
                  00.000.000/0000-00
                </chakra.p>
                <chakra.p
                  mt={2}
                  color="gray.600"
                  ms={5}
                  _dark={{
                    color: 'gray.300',
                  }}
                >
                  End:
                </chakra.p>
                <chakra.p
                  mt={2}
                  color="gray.600"
                  ms={2}
                  _dark={{
                    color: 'gray.300',
                  }}
                >
                  R. Áustria, 585 - Vila Elisa, Ribeirão Preto - SP
                </chakra.p>
              </Box>
              <Box
                display={'flex'}
                alignItems={'center'}
              >
                <chakra.p
                  mt={2}
                  color="gray.600"
                  _dark={{
                    color: 'gray.300',
                  }}
                >
                  Responsavel:
                </chakra.p>
                <chakra.p
                  mt={2}
                  color="gray.600"
                  ms={2}
                  _dark={{
                    color: 'gray.300',
                  }}
                >
                  Um Dois Tres de Oliveira Quatro
                </chakra.p>
                <chakra.p
                  mt={2}
                  color="gray.600"
                  ms={5}
                  _dark={{
                    color: 'gray.300',
                  }}
                >
                  Quant compra:
                </chakra.p>
                <chakra.p
                  mt={2}
                  color="gray.600"
                  ms={2}
                  fontSize={'3xl'}
                  _dark={{
                    color: 'gray.300',
                  }}
                >
                  7
                </chakra.p>
              </Box>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
}
