import { FormLabel, Input } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export const ListaEmpresa = (props: { onChangeValue: any }) => {
  const [dados, setDados] = useState<any>([]);

  useEffect(() => {
    (async () => {
      const id = localStorage.getItem('id');
      const resposta = await fetch('/api/db/business/get/id/' + id);
      const resp = await resposta.json();
      const retorno = resp.attributes.empresa.data;
      setDados(retorno.attributes.nome);
      props.onChangeValue(retorno.attributes.CNPJ);
    })();
  }, [props, props.onChangeValue]);

  return (
    <>
      <FormLabel
        fontSize="xs"
        fontWeight="md"
        color="white"
      >
        Empresas
      </FormLabel>
      <Input
        shadow="sm"
        size="xs"
        w="full"
        color="white"
        fontSize="xs"
        rounded="md"
        value={dados}
      />
    </>
  );
};
