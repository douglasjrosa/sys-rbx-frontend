import {
  Box,
  Button,
  Flex,
  FormLabel,
  Heading,
  Select,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export default function Proposta() {
  const [Enpresa, setEmpresa] = useState([]);
  const [search, setSearch] = useState('');
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    (async () => {
      const Emaillocal = localStorage.getItem('email');
      const Email = JSON.parse(Emaillocal);
      const resposta = await fetch('/api/query/get', {
        method: 'POST',
        body: JSON.stringify(Email),
      });
      const resp = await resposta.json();
      console.log(resp);
      setEmpresa(resp);
    })();
  }, []);

  return (
    <>
      <Flex h="100%" w="100%" flexDir={'column'} justifyContent="center">
        <Heading size="lg">Proposta comercial</Heading>
        <Box display="flex" gap={8} alignItems="center" mt={5} mx={5}>
          <Box>
            <FormLabel
              htmlFor="cidade"
              fontSize="xs"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: 'gray.50',
              }}
            >
              Empresas
            </FormLabel>
            <Select
              shadow="sm"
              size="xs"
              w="full"
              fontSize="xs"
              rounded="md"
              placeholder="Selecione uma Empresa"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            >
              {Enpresa.map((item) => {
                return (
                  <>
                    <option value={item.CNPJ}>{item.nome}</option>
                  </>
                );
              })}
            </Select>
          </Box>
          <Button colorScheme={'whatsapp'}>Nova Proposta</Button>
        </Box>
        <Box></Box>
        <Box></Box>
      </Flex>
    </>
  );
}
