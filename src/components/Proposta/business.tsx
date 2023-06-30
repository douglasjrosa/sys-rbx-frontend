import { Box, FormLabel, Input } from '@chakra-ui/react';

export const CompBusiness = (props: { Resp: string }) => {
  return (
    <Box>
      <FormLabel
        fontSize="xs"
        fontWeight="md"
        color="white"
      >
        N° Negócio
      </FormLabel>
      <Input
        color="white"
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
