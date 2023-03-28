import { Box, FormLabel, Select } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export const CompPrazo = (props: { Resp: string; onAddResp: any }) => {
  const [dados, setDados] = useState<any>([]);
  const [valor, setValor] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = '/api/query/get/listprazo';
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
