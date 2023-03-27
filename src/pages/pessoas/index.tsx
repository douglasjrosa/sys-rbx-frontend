/* eslint-disable no-undef */
import { Search2Icon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import CardPessoas from '../../components/pessoas/lista/card/card';

export default function Pessoas(): JSX.Element {
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
          {/* <InputGroup size="md">
            <Input pr="6rem" w={{ md: '26rem', sm: '30rem' }} type={'text'} />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm">
                <Search2Icon />
              </Button>
            </InputRightElement>
          </InputGroup> */}
        </Box>
        <Box
          display={'flex'}
          flexDir={{ md: 'column', sm: 'row' }}
          h="100%"
          justifyContent={'space-evenly'}
        >
          <Button
            h={{ md: '40%', sm: '70%' }}
            colorScheme="whatsapp"
            onClick={() => router.push('/pessoas/cadastro')}
          >
            Cadastrar Pessoas
          </Button>
        </Box>
      </Flex>
      <Box h={'95%'} bg="#edf3f8" overflow={'auto'}>
        <Flex py={50} px={5} justifyContent={'center'} w="full">
          <CardPessoas />
        </Flex>
      </Box>
    </Flex>
  );
}
