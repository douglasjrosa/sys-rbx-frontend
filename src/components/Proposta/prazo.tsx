import { Box, FormLabel, Select } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { listPrazo } from '../data/listPrazo';


export const CompPrazo = (props: { Resp: string; onAddResp: any; oncnpj: string }) => {
  const dados: any = listPrazo;
  const [valor, setValor] = useState('');

  function atualizarValor(event: any) {
    setValor(event.target.value);
    props.onAddResp(event.target.value);
  }

  useEffect(() => {
    if (props.Resp && valor === '') {
      const [filter] = dados.filter((objeto: any) =>
        objeto.titulo
          .toLowerCase()
        == props.Resp.toLowerCase(),
      );
      setValor(!filter ? props.Resp : filter.titulo);
    }
  }, [props.Resp, valor, dados]);

  const listEmpr = [
    { nome: 'Alliage', cnpj: '55979736001460' },
    { nome: 'Dentemed', cnpj: '07897039000100' },
    { nome: 'Picelli', cnpj: '07570870000145' },
    { nome: 'Latam', cnpj: '02012862006109' },
    { nome: 'Picelli', cnpj: "53342523000182" },
  ]
  const [selectLista] = listEmpr.filter((i: any) => i.cnpj == props.oncnpj).map((i: any) => i.nome)
  const PropPrazo = selectLista === undefined ? 'Padão' : selectLista
  const data = dados.filter((i: any) => i.propriedade == PropPrazo)

  return (
    <Box>
      <FormLabel
        fontSize="xs"
        fontWeight="md"
        color="white"
      >
        Tipos de prazo
      </FormLabel>
      <Select
        shadow="sm"
        size="xs"
        w="full"
        fontSize="xs"
        rounded="md"
        color="white"
        onChange={atualizarValor}
        value={valor}
      >
        <option style={{ backgroundColor: "#1A202C" }}></option>
        {data.map((i: any) => {
          return (
            <option key={i.id} style={{ backgroundColor: "#1A202C" }} value={i.titulo}>
              {i.titulo}
            </option>
          );
        })}
      </Select>
    </Box>
  );
};
