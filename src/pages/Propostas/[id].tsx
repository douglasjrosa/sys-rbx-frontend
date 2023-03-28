import { Search2Icon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { CardList } from '../../components/Proposta/listaItens';

export default function ListaProposta() {
  const router = useRouter();
  const ID: any = router.query.id;
  const [IdEmpresa, setIdEmpresa] = useState('');
  const [Pedido, setPedido] = useState(false);
  const [Data, setData] = useState(false);

  useEffect(() => {
    (async () => {
      await axios('/api/db/business/get/id/' + ID)
        .then((res) => {
          // console.log(res.data);
        })
        .catch((err) => console.error(err));
    })();
  }, [ID]);

  return (
    <>
      <Flex h="100%" w="100%" flexDir={'column'} justifyContent="center">
        <Flex
          h={28}
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
              onClick={() => {
                localStorage.setItem('id', ID);
                router.push('/Propostas/create');
              }}
            >
              Gerar Proposta
            </Button>
          </Box>
        </Flex>
        <Box h={'85%'} overflow={'auto'}>
          <Flex
            bg="#edf3f8"
            _dark={{
              bg: '#3e3e3e',
            }}
            pt={'3rem'}
            pb={'2rem'}
            px={'2rem'}
            h="100%"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            gap={5}
          >
            <CardList id={ID} />
          </Flex>
        </Box>
      </Flex>
    </>
  );
}
