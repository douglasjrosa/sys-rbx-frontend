import { FormLabel, Input } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

export const ListaEmpresa = (props: { onChangeValue: string }) => {
  const [dados, setDados] = useState<string>('');

  useEffect(() => {
    if (props.onChangeValue){
    setDados(props.onChangeValue);
  }
  }, [props.onChangeValue]);

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
        size="sm"
        w="full"
        color="white"
        fontSize="sm"
        rounded="md"
        value={dados}
      />
    </>
  );
};
