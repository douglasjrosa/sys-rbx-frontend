/* eslint-disable no-undef */
import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import axios from 'axios';
import { Empresa } from 'Cliente';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Loading from '../../components/elements/loading';
import CardPessoas from '../../components/pessoas/lista/card/card';

export default function Pessoas(): JSX.Element {
  const router = useRouter();
  const [dados, setDados] = useState<Empresa | any>([]);
  const [loading, setLoading] = useState(true);
  const id = router.query.id;
  useEffect(() => {
    (async () => {
      await axios('/api/db/empresas/getId/' + id)
        .then((resp) => {
          console.log(resp.data.data);
          setDados(resp.data.data);
          setLoading(false);
        })
        .catch((err) => console.error(err));
    })();
  }, [id]);

  if (loading) {
    return <Loading size="200px">Carregando...</Loading>;
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
        {/* <Heading>{dados.attributes.nome}</Heading> */}
        <Flex py={50} px={5} justifyContent={'center'} w="full">
          <CardPessoas getId={id} />
        </Flex>
      </Box>
    </Flex>
  );
}
