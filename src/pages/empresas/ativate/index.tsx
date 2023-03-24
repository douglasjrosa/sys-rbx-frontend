/* eslint-disable prettier/prettier */
import { useRouter } from 'next/router';
import {
  Box,
  Flex,
  Input,
  InputGroup,
} from '@chakra-ui/react';
import CardExclud from '../../../components/empresa/lista/card/exclud';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function Empresas() {
  const {data: session} = useSession();
  const router = useRouter();

  if(session.user.pemission !== "Adm"){
    router.push('/empresas/')
  }
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
          
        </Box>
        <Box
          display={'flex'}
          flexDir={{ md: 'column', sm: 'row' }}
          h="100%"
          justifyContent={'space-evenly'}
        >
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
          <CardExclud />
        </Flex>
      </Box>
    </Flex>
  );
}
