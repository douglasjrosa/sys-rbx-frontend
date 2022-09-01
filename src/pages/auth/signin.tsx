import { getCsrfToken } from 'next-auth/react';
import {
  Button,
  Flex,
  Center,
  Box,
  Image,
  Input,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { CtxOrReq } from 'next-auth/client/_utils';

const SignIn = ({ csrfToken }) => {
  return (
    <Flex
      flexDir="column"
      backgroundImage="url('https://rbx-backend-media.s3.sa-east-1.amazonaws.com/wood_min_d8be08f601.webp')"
      h="100vh"
    >
      <Center mt="5%">
        <Box w="280px">
          <Image
            bg="white"
            rounded="8px"
            src="https://rbx-backend-media.s3.sa-east-1.amazonaws.com/small_Logo_Ribermax_min_759d92c93c.webp"
            alt="Logomarca Ribermax"
          />
        </Box>
      </Center>
      <Center>
        <Box bg="white" rounded="8px" p="25px" w="280px" mt="30px">
          <form method="post" action="/api/auth/callback/credentials">
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
            <FormControl py="15px">
              <FormLabel htmlFor="email">Usuário:</FormLabel>
              <Input name="email" type="text" />
            </FormControl>
            <FormControl py="15px">
              <FormLabel htmlFor="password">Senha:</FormLabel>
              <Input name="password" type="password" />
            </FormControl>
            <Center>
              <Button mt={4} colorScheme="teal" type="submit">
                Entrar
              </Button>
            </Center>
          </form>
        </Box>
      </Center>
    </Flex>
  );
};
export default SignIn;

// This is the recommended way for Next.js 9.3 or newer
export async function getServerSideProps(context: CtxOrReq) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
