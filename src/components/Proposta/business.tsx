import { Box, FormLabel, Input } from '@chakra-ui/react';

export const CompBusiness = (props: { Resp: string }) => {
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
        N° Negócio
      </FormLabel>
      <Input
        focusBorderColor="brand.400"
        shadow="sm"
        size="xs"
        w="full"
        fontSize="xs"
        rounded="md"
        value={props.Resp}
      />
    </Box>
  );
};
