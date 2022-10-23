import { getCsrfToken } from 'next-auth/react';
import { CtxOrReq } from 'next-auth/client/_utils';
import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  Image,
} from '@chakra-ui/react';

const SignIn = ({ csrfToken }) => {


  return (
    <Stack
      minH={'100vh'}
      minW={'100vw'}
      direction={{ base: 'column', md: 'row' }}
    >
      <Flex p={8} flex={1} align={'center'} justify={'center'}>
        <Stack spacing={4} w={'full'} maxW={'md'}>
          <Heading fontSize={'2xl'}>Sign in to your account</Heading>
          <form
            method="post"
            action="/api/auth/callback/credentials"
          >
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
            <FormControl>
              <FormLabel htmlFor="email">Email address</FormLabel>
              <Input borderColor="gray.400" name="email" type="text" />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input borderColor="gray.400" name="password" type="password" />
            </FormControl>
            <Stack spacing={6}>
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                align={'start'}
                justify={'space-between'}
              >
                <Link color={'blue.500'}>Forgot password?</Link>
              </Stack>
              <Button
                colorScheme={'blue'}
                variant={'solid'}
                type="submit"
              >
                Sign in
              </Button>
            </Stack>
          </form>
        </Stack>
      </Flex>
      <Flex flex={1}>
        <Image
          alt={'Login Image'}
          objectFit={'cover'}
          src={
            'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80'
          }
        />
      </Flex>
    </Stack>
  );
};
export default SignIn;

export async function getServerSideProps(context: CtxOrReq) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
