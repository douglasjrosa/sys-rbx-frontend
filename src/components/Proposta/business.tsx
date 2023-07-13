import { Box, FormLabel, Input, Text } from '@chakra-ui/react';

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
      <Text w="full">{props.Resp}</Text>
    </Box>
  );
};
