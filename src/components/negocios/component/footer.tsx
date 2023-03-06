import { Box, Flex, IconButton, Textarea, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FaLocationArrow } from 'react-icons/fa';

export const NegocioFooter = (props: { onGetValue: any; data: any }) => {
  const router = useRouter();
  const ID = router.query.id;
  const toast = useToast();
  const { data: session } = useSession();
  const [valor, setValor] = useState('');

  const addItens = async () => {
    const date = new Date();
    const DateAtua = date.toISOString();
    props.onGetValue(true);

    const msg = {
      date: DateAtua,
      usuario: session.user.name,
      msg: valor,
    };

    const record = [...props.data, msg];

    const data = {
      data: {
        incidentRecord: record,
      },
    };

    await axios({
      method: 'PUT',
      url: '/api/db/business/put/id/' + ID,
      data: data,
    })
      .then((res) => console.log(res))
      .catch((err) => {
        console.error(err);
        toast({
          title: 'opss erro',
          description: err,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      });
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
            boxShadow={'dark-lg'}
            onChange={(e: any) => setValor(e.target.value)}
          />
          <IconButton
            aria-label="Send"
            fontSize={'xl'}
            icon={<FaLocationArrow />}
            color="gray.600"
            onClick={addItens}
          />
        </Flex>
      </Box>
    </>
  );
};
