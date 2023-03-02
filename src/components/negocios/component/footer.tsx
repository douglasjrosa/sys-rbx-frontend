import { Box, Flex, Icon, Input, Textarea } from '@chakra-ui/react';
import { FaLocationArrow } from 'react-icons/fa';

export const NegocioFooter = () => {
  return (
    <>
      <Box bg={'#f0f2f5'} w={'100%'} h={'100%'}>
        <Flex
          px={'4rem'}
          h={'100%'}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          {/* <Input
            bg={'white'}
            w={'95%'}
            rounded={115}
            borderColor={'gray.300'}
          /> */}
          <Textarea
            resize={'none'}
            overflowY={'hidden'}
            fontSize={'15px'}
            lineHeight={'1.2'}
            bg={'#f0f0f0'}
            p={'10px'}
            w={'95%'}
            rounded={'5px'}
            borderColor={'gray.300'}
            rows={1}

          />
          <Icon
            as={FaLocationArrow}
            boxSize={6}
            // mt={8}
            // ms={5}
            color="gray.600"
            cursor="pointer"
            // onClick={addItens}
          />
        </Flex>
      </Box>
    </>
  );
};
