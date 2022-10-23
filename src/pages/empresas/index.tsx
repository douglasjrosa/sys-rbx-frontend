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
import CardEmpresa from '../../components/empresa/lista/card/card';

export default function Empresas(): JSX.Element {
  const router = useRouter();
  return (
    <Flex h="100%" w="100%" flexDir={'column'} justifyContent="center">
      <Flex
        h={24}
        w={{ md: '80%', sm: '100%' }}
        borderBottom={'2px'}
        borderColor={'gray.200'}
        m="auto"
        mt={{ md: 5, sm: '1.5rem' }}
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
          <Button h={{ md: '40%', sm: '70%' }} colorScheme="whatsapp" onClick={()=> router.push('/empresas/cadastro/empresa') }>
            Cadastrar Empresa
          </Button>
          <Button
            h={{ md: '40%', sm: '70%' }}
            ms={{ md: '0', sm: '5rem' }}
            colorScheme="teal"
            onClick={()=> router.push('/empresas/cadastro/cliente') }
          >
            Cadastrar Cliente
          </Button>
        </Box>
      </Flex>
      <Box h={'85%'} overflow={'auto'}>
        <Flex
          bg="#edf3f8"
          _dark={{
            bg: '#3e3e3e',
          }}
          py={50}
          w="full"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          gap={5}
        >
          <CardEmpresa />
        </Flex>
      </Box>
    </Flex>
  );
}
