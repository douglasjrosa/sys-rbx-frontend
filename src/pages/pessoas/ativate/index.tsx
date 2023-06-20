/* eslint-disable no-undef */
import { Search2Icon } from '@chakra-ui/icons';
import { Box, Button, Flex } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import CardPessoasAdm from '../../../components/pessoas/lista/card/cardAdm';

export default function Pessoas(): JSX.Element {
  const router = useRouter();
  const { data: session } = useSession();

  // if (session.user.pemission !== 'Adm') {
  //   router.push('/');
  // }

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
          <CardPessoasAdm />
        </Flex>
      </Box>
    </Flex>
  );
}
