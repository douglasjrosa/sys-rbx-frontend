import { Box, FormLabel, Select } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export const CompBusiness = (props: { Resp: string; onAddResp: any }) => {
  const [dados, setDados] = useState<any>([]);
  const [valor, setValor] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = '/api/db/business/get';
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
    if (props.Resp && valor === '') {
      const [filter] = dados.filter((objeto: any) =>
        objeto.attributes.fantasia
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
        N° Business
      </FormLabel>
      <Select
        borderColor="gray.600"
        focusBorderColor="brand.400"
        shadow="sm"
        size="xs"
        w="full"
        fontSize="xs"
        rounded="md"
        placeholder=" N° Business a ser vinculado"
        onChange={atualizarValor}
        value={valor}
      >
        {!dados
          ? null
          : dados.map((i: any) => {
              return (
                <option key={i.id} value={i.id}>
                  {i.attributes.nBusiness}
                </option>
              );
            })}
      </Select>
    </Box>
  );
};
