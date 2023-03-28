import { Box, FormLabel, Select } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export const BtnStatus = (props: { Resp: string; onAddResp: any }) => {
  const [dados, setDados] = useState<any>([]);
  const [valor, setValor] = useState('');

  useEffect(() => {
    setValor(props.Resp);
  }, [props.Resp]);

  function atualizarValor(event: any) {
    setValor(event.target.value);
    props.onAddResp(event.target.value);
  }

  console.log(valor);

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
        Status
      </FormLabel>
      <Select
        shadow="sm"
        size="xs"
        w="full"
        fontSize="xs"
        rounded="md"
        placeholder=" "
        onChange={atualizarValor}
        value={valor}
      >
        <option value="Ativo">Em contato com cliente</option>
        <option value="Pause">Aguardando retorno</option>
        <option value="Stop">Parado por tenpo indeterminado</option>
        <option value="Retorno em">Retorno em</option>
      </Select>
    </Box>
  );
};
