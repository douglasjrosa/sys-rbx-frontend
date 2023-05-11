/* eslint-disable react/no-unknown-property */
import { Box, Button, Flex, FormLabel, GridItem, Select } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export const CompPessoa = (props: { Resp: string; onAddResp: any }) => {
  const [dados, setDados] = useState<any>([]);
  const [valor, setValor] = useState('');
  const { push } = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = '/api/query/get/listaRespontavel';
        const get = await fetch(url);
        const response = await get.json();
        setDados(response);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  function atualizarValor(event: any) {
    setValor(event.target.value);
    props.onAddResp(event.target.value);
  }

  useEffect(() => {
    setValor(props.Resp);
  }, [props.Resp, valor, dados]);

  return (
    <Box>
      <Flex gap={5}>
        <Box>
          <FormLabel
            fontSize="xs"
            fontWeight="md"
            color="gray.700"
            _dark={{
              color: 'gray.50',
            }}
          >
            Responsável
          </FormLabel>
          <Select
            borderColor="gray.600"
            focusBorderColor="brand.400"
            shadow="sm"
            size="xs"
            w="full"
            fontSize="xs"
            rounded="md"
            placeholder=" "
            onChange={atualizarValor}
            value={valor}
          >
            <option value="">não tem</option>
            {!dados
              ? null
              : dados.map((i: any) => {
                return (
                  <option key={i.id} value={i.id}>
                    {i.attributes.nome}
                  </option>
                );
              })}
          </Select>
        </Box>
        <Box>
          <Button
            as={GridItem}
            colSpan={[8, 4, null, 2]}
            h={8}
            mt={5}
            colorScheme="orange"
            isDisabled={!valor}
            onClick={() => push(`/pessoas/atualizar/${valor}`)}
          >
            Atualizar pessoa
          </Button>
        </Box>
      </Flex>

    </Box>
  );
};
