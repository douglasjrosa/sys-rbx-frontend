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
      >
        Atendimento
      </FormLabel>
      <Select
        shadow="sm"
        size="sm"
        w="full"
        fontSize="xs"
        rounded="md"
        onChange={atualizarValor}
        value={valor}
      >
        <option style={{ backgroundColor: "#1A202C" }} value=""> </option>
        <option style={{ backgroundColor: "#1A202C" }} value="interno">Cliente entrou em contato</option>
        <option style={{ backgroundColor: "#1A202C" }} value="externo">Vendedor entrou em contato</option>
      </Select>
    </Box>
  );
};
