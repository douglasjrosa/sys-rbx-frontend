import { Search2Icon } from '@chakra-ui/icons';
import { Box, Button, Flex, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import { Header } from './components/header';

export default function Empresas(): JSX.Element {
  return (
    <Flex w="100%" flexDir={'column'} justifyContent="center">
      <Header />
      <Flex
        h={20}
        w={{ md: '80%', sm: '100%' }}
        borderBottom={'2px'}
        borderColor={'gray.200'}
        m="auto"
        justifyContent={'space-evenly'}
        alignItems={'center'}
      >
        <Box>
          <InputGroup size="md">
            <Input
              pr="6rem"
              type={'text'}
              placeholder="Enter password"
            />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm">
              <Search2Icon />
              </Button>
            </InputRightElement>
          </InputGroup>
        </Box>
        <Box
          display={'flex'}
          flexDir={'column'}
          h='100%'
          justifyContent={'space-evenly'}
        >
          <Button h={'30%'} colorScheme='whatsapp'>Whatsapp</Button>
          <Button h={'30%'} colorScheme='teal'>Teal</Button>
        </Box>
      </Flex>
    </Flex>
  );
}
