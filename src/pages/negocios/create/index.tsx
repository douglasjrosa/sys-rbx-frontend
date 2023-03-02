import { Box } from '@chakra-ui/react';
import { NegocioFooter } from '../../../components/negocios/component/footer';
import { NegocioHeader } from '../../../components/negocios/component/hearder';

export default function CreateNegocio() {
  return (
    <>
      <Box w="full" h="full">
        <Box bg={'yellow.400'} w="full" h="20%" p={5}>
          <NegocioHeader />
        </Box>
        <Box bg="blue.300" w="full" h="70%" overflowX={'hidden'}>
          Body
        </Box>
        <Box w="full" h="10%">
          <NegocioFooter />
        </Box>
      </Box>
    </>
  );
}
