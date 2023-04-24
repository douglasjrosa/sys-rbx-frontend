import { Box, FormLabel, Select } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export const SelecAtendimento = (props: { Resp: string; onAddResp: any }) => {
  const [dados, setDados] = useState<any>([]);
  const [valor, setValor] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      // try {
      //   const url = '/api/query/get/atendimento';
      //   const get = await fetch(url);
      //   const response = await get.json();
      //   console.log("🚀 ~ file: atendimento.tsx:14 ~ fetchData ~ response:", response)
      //   setDados(response);
      // } catch (error) {
      //   console.error(error);
      // }
    };
    fetchData();
  }, []);

  function atualizarValor(event: any) {
    setValor(event.target.value);
    props.onAddResp(event.target.value);
  }

  useEffect(() => {
    setValor(props.Resp);
  }, [props.Resp]);

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
        Atendimento
      </FormLabel>
      <Select
        shadow="sm"
        size="sm"
        w="full"
        fontSize="xs"
        rounded="md"
        placeholder=" "
        border={'1px solid #6666'}
        onChange={atualizarValor}
        value={valor}
      >
        <option value=""> </option>
        <option value="interno">Cliente entrou em contato</option>
        <option value="externo">vendedor entrou em contato</option>
      </Select>
    </Box>
  );
};
