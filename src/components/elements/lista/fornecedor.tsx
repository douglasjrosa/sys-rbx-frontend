import { Box, FormLabel, Select } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export const CompFornecedor = (props: { Resp: string; onAddResp: any }) => {
  const [dados, setDados] = useState<any>([]);
  const [valor, setValor] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = '/api/query/get/listaFornecedor';
        const get = await fetch(url);
        const response = await get.json();
        console.log(response);
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
      <FormLabel
        fontSize="xs"
        fontWeight="md"
        color="gray.700"
        _dark={{
          color: 'gray.50',
        }}
      >
        Fornecedor
      </FormLabel>
      <Select
        borderColor="gray.600"
        focusBorderColor="brand.400"
        shadow="sm"
        size="xs"
        w="full"
        fontSize="xs"
        rounded="md"
        placeholder="selecine uma empresa"
        onChange={atualizarValor}
        value={valor}
      >
        <option value=""></option>
        {!dados
          ? null
          : dados.map((i: any) => {
              return (
                <option key={i.id} value={i.id}>
                  {i.attributes.titulo}
                </option>
              );
            })}
      </Select>
    </Box>
  );
};
