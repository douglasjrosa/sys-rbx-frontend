import { Box, Button, FormLabel, Select } from '@chakra-ui/react';
import { MdAddBusiness } from 'react-icons/md';

export const RelaciomentoEmpr = () => {
  return (
    <>
      <FormLabel
        htmlFor="prazo pagamento"
        fontSize="xs"
        fontWeight="md"
        color="gray.700"
        _dark={{
          color: 'gray.50',
        }}
      >
        Empresa relacionada
      </FormLabel>
      <Select
        borderColor="gray.600"
        focusBorderColor="brand.400"
        shadow="sm"
        size="xs"
        w="full"
        fontSize="xs"
        rounded="md"
        placeholder="Selecione uma tabela"
        onChange={consultaEmpresaId}
        value={workId}
      >
        {work.map((item) => {
          return (
            // eslint-disable-next-line react/jsx-key
            <option value={item.id}>{item.attributes.nome}</option>
          );
        })}
      </Select>
      <Box mt={5}>
        <Button w={'100%'} colorScheme={'telegram'}>
          Adicionar <MdAddBusiness />
        </Button>
      </Box>
    </>
  );
};
