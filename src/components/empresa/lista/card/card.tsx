/* eslint-disable react-hooks/exhaustive-deps */

import {
  Box,
  Flex,
  Icon,
  Link,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { SiWhatsapp } from 'react-icons/si';
import Loading from '../../../elements/loading';
import { mask } from 'remask';
import { RiPhoneFill } from 'react-icons/ri';

export default function CardEmpresa() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    get();
  }, []);
  const user = session?.user.id;

  const get = async () => {
    await fetch('/api/db/empresas/get', {
      method: 'POST',
      body: JSON.stringify({ user: user }),
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

  const desativar = async (id: string, data: any) => {
    await axios({
      method: 'PUT',
      data: data,
      url: '/api/db/empresas/delete/' + id,
    })
      .then(() => {
        toast({
          title: 'Empresa desativada',
          duration: 3000,
          status: 'warning',
          position: 'top-right',
        });
        setLoading(true);
        get();
      })
      .catch((err) => console.log(err));
  };

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
        w={'auto'}
        key={item.id}
        fontSize="sm"
      >
        <Flex flexDirection={'column'}>
          <Link
            fontSize="xl"
            color="gray.700"
            fontWeight="700"
            mr={3}
            _hover={{
              color: 'gray.600',
              textDecor: 'underline',
            }}
            mb={3}
          >
            {item.attributes.nome}
          </Link>
          <Flex gap={3}>
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
                const data = { cnpj: item.attributes.CNPJ };
                desativar(id, data);
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
            <Link
              color="gray.700"
              fontSize="sm"
              ms={10}
              _hover={{
                color: 'gray.600',
                textDecor: 'underline',
              }}
              onClick={async () => {
                const id = item.id;
                await router.push('/pessoas/' + id);
              }}
            >
              Pessoas
            </Link>
          </Flex>
          {!item.attributes.celular ? null : (
            <>
              <Box mt={3}>
                <Link
                  href={'https://wa.me/55' + item.attributes.celular}
                  isExternal
                >
                  <Icon as={SiWhatsapp} />{' '}
                  {mask(item.attributes.celular, ['(99) 9 9999-9999'])}
                </Link>
              </Box>
            </>
          )}
          {!item.attributes.fone ? null : (
            <>
              <Box mt={3}>
                <Link
                  onClick={() => {
                    navigator.clipboard.writeText(item.attributes.fone);
                    toast({
                      title: 'Telefone copiado',
                      position: 'top-right',
                      duration: 1000,
                    });
                  }}
                >
                  <Icon as={RiPhoneFill} />{' '}
                  {mask(item.attributes.fone, [
                    '(99) 9999-9999',
                    '(99) 9 9999-9999',
                  ])}
                </Link>
              </Box>
            </>
          )}
        </Flex>
      </Box>
    );
  });

  if (loading) {
    return <Loading size="200px">Carregando...</Loading>;
  }
  const display = dados.length === 0 ? null : render;
  return (
    <>
      <Box h={'100%'} display={'flex'} flexWrap={'wrap'} gap={2}>
        {display}
      </Box>
    </>
  );
}
