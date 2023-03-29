import { Box, FormLabel, Select } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { listPrazo } from '../../../components/data/listPrazo';

export const CompPrazo = (props: { Resp: string; onAddResp: any }) => {
  const dados: any = listPrazo;
  const [valor, setValor] = useState('');

  function atualizarValor(event: any) {
    setValor(event.target.value);
    props.onAddResp(event.target.value);
  }

  useEffect(() => {
    if (props.Resp && valor === '') {
      const [filter] = dados.filter((objeto: any) =>
        objeto.attributes.titulo
          .toLowerCase()
          .includes(props.Resp.toLowerCase()),
      );
      setValor(!filter ? props.Resp : filter.id);
    }
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
        Tipos de prazo
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
        {dados.map((i: any) => {
          return (
            <option key={i.id} value={i.id}>
              {i.titulo}
            </option>
          );
        })}
      </Select>
    </Box>
  );
};
