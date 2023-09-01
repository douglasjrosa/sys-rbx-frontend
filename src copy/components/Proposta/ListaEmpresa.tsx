import { Box, FormLabel, Text } from '@chakra-ui/react';
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
      <Box  w="full">
      <Text>{dados}</Text>
      </Box>
    </>
  );
};
