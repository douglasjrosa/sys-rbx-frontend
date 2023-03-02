import { Box, Flex, Icon, Input, Textarea } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { FaLocationArrow } from 'react-icons/fa';

export const NegocioFooter = (props: { onGetValue: any }) => {
  const { data: session } = useSession();
  const [valor, setValor] = useState('');

  const addItens = () => {
    const date = new Date();
    const DateAtua = date.toISOString();

    const data = {
      usuario: session.user.name,
      date: DateAtua,
      msg: valor,
    };

    props.onGetValue(data);
  };

  return (
    <>
      <Box bg={'#f0f2f5'} w={'100%'} h={'100%'}>
        <Flex
          px={'4rem'}
          h={'100%'}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
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
            onChange={(e: any) => setValor(e.target.value)}
          />
          <Icon
            as={FaLocationArrow}
            boxSize={6}
            color="gray.600"
            cursor="pointer"
            onClick={addItens}
          />
        </Flex>
      </Box>
    </>
  );
};
