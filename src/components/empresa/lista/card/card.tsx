/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import { Box, Flex, chakra, Link } from '@chakra-ui/react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Loading from '../../../elements/loading';

export default function CardEmpresa() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    get();
  }, []);
  const user: string = session.user.id

  const get = async () => {
    await fetch('/api/db/empresas/get', {
      method: 'POST',
      body: JSON.stringify({user: user})
    })
      .then((resp) => resp.json())
      .then((json) => {
        console.log(json);
        setDados(json);
        setLoading(false);
      });
  };

  if (!dados) {
    return (
      <>
        <Box></Box>
      </>
    );
  }

  const render = dados.map((item: any) => {
    const data = () => {
      const ano = item.attributes.createdAt.substr(0, 4);
      const mes = item.attributes.createdAt.substr(5, 2);
      const dia = item.attributes.createdAt.substr(8, 2);
      const mesesLieral =
        mes === '1'
          ? 'Jan'
          : mes === '2'
          ? 'Fev'
          : mes === '3'
          ? 'Mar'
          : mes === '4'
          ? 'Abr'
          : mes === '5'
          ? 'Mai'
          : mes === '6'
          ? 'Jun'
          : mes === '7'
          ? 'Jul'
          : mes === '8'
          ? 'Ago'
          : mes === '9'
          ? 'Set'
          : mes === '10'
          ? 'Out'
          : mes === '11'
          ? 'Nov'
          : 'Dez';
      const date = mesesLieral + ' ' + dia + ', ' + ano + ' date add';

      return date;
    };

    const cnpj = () => {
      const dig01 =
        item.attributes.CNPJ === null
          ? '00'
          : item.attributes.CNPJ.substr(0, 2);
      const dig02 =
        item.attributes.CNPJ === null
          ? '000'
          : item.attributes.CNPJ.substr(2, 3);
      const dig03 =
        item.attributes.CNPJ === null
          ? '000'
          : item.attributes.CNPJ.substr(5, 3);
      const dig04 =
        item.attributes.CNPJ === null
          ? '0000'
          : item.attributes.CNPJ.substr(8, 4);
      const dig05 =
        item.attributes.CNPJ === null
          ? '00'
          : item.attributes.CNPJ.substr(12, 2);
      const result =
        dig01 + '.' + dig02 + '.' + dig03 + '/' + dig04 + '-' + dig05;
      return result;
    };
    const end =
      item.attributes.endereco +
      ', ' +
      item.attributes.numero +
      ' - ' +
      item.attributes.bairro +
      ', ' +
      item.attributes.cidade +
      ' - ' +
      item.attributes.uf;
    const rela = item.attributes.responsavel.data;
    return (
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
        w={['xs', 'sm', 'lg', 'xl', '3xl', '5xl', '6xl']}
        key={item.id}
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
            {data()}
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
                const id = item.id;
                const doc = item.attributes.CNPJ;
                await axios({
                  method: 'PUT',
                  url: '/api/empresas/delete/' + id,
                });
                await axios({
                  method: 'PUT',
                  url: '/api/db_bling/empresas/Delet/' + doc,
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
                const id = item.id;
                await router.push('/empresas/atualizar/' + id);
              }}
            >
              editar
            </Link>
          </Flex>
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
            {item.attributes.nome}
          </Link>
          <Box
            mt={2}
            display={'flex'}
            flexDirection={['column', 'column', 'row', 'row']}
          >
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
              {cnpj()}
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
              {end}
            </chakra.p>
          </Box>
          <Box display={'flex'} alignItems={'center'}>
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
              {rela === null ? 'não tem' : rela.attributes.nome}
            </chakra.p>
          </Box>
        </Box>
      </Box>
    );
  });

  if (loading) {
    return <Loading size="200px">Carregando...</Loading>;
  }
  const display = dados.length === 0 ? null : render;
  return (
    <>
      <Box h={'95%'}>{display}</Box>
    </>
  );
}
