import { Box } from '@chakra-ui/react';
import { NegocioHeader } from '../../../components/negocios/component/hearder';

export default function CreateNegocio() {
  return (
    <>
      <Box w="full" h="full">
        <Box bg={'yellow.400'} w="full" h="20%" p={5}>
          <NegocioHeader />
        </Box>
        <Box bg="blue.300" w="full" h="75%" overflowX={'hidden'}>
          Body
        </Box>
        <Box bg="red.300" w="full" h="5%">
          footer
        </Box>
      </Box>
    </>
  );
}
