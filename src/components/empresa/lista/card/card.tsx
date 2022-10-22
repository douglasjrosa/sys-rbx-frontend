import { Box, Flex, chakra, Link } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function CardEmpresa() {
  const [dados, setDados] = useState([]);

  const get = async () => {
    const response = await axios({
      method: 'GET',
      url: '/api/empresas/get',
    });
    setDados(response.data);
  };

  useEffect(() => {
    get();
  }, []);

  const render = dados.map((item) => {
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
      const dig01 = item.attributes.CNPJ.substr(0, 2);
      const dig02 = item.attributes.CNPJ.substr(2, 3);
      const dig03 = item.attributes.CNPJ.substr(5, 3);
      const dig04 = item.attributes.CNPJ.substr(8, 4);
      const dig05 = item.attributes.CNPJ.substr(12, 2);
      const result = dig01 + "." + dig02 + "." + dig03 + "/" + dig04 + "-" + dig05;
      return result;
    }
    const end = item.attributes.endereco + ", " + item.attributes.numero + " - " + item.attributes.bairro + ", " + item.attributes.cidade + " - " + item.attributes.uf;
    console.log(end)
    return (
      <Box
        mx="auto"
        px={8}
        py={5}
        rounded="lg"
        shadow="lg"
        boxShadow="dark-lg"
        bg="white"
        _dark={{
          bg: 'gray.900',
        }}
        w="3xl"
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
              await axios({
                method: 'PUT',
                url: '/api/empresas/delete/' + id,
              });
            }}
          >
            Delete
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
            {item.attributes.fantasia}
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
    );
  });
  const display = !dados? null: render
  return <>{display}</>;
}
