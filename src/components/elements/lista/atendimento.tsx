import { Box, FormLabel, Select } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export const SelecAtendimento = (props: { Resp: string; onAddResp: any }) => {
  const [valor, setValor] = useState('');

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
        <option value="externo">Vendedor entrou em contato</option>
      </Select>
    </Box>
  );
};
