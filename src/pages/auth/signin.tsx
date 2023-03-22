/* eslint-disable no-undef */
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Image,
  Input,
  Link,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { NextPage } from 'next';
import { signIn } from 'next-auth/react';
import React, { FormEventHandler, useState } from 'react';

const SignIn: NextPage = (): JSX.Element => {
  const [user, setUser] = useState<string>('');
  const [pass, setPass] = useState<string>('');
  const toast = useToast()

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const res: any = await signIn('credentials', {
      email: user,
      password: pass,
      redirect: true,
    });
    console.log(res.status);
    if (res.status !== 200){
      toast({
        title: 'Usuario ou Senha Incorreto',
        status: 'error',
        duration: 5000,
        position: 'top-right',
      });
    }
  };

  return (
    <Stack
      minH={'100vh'}
      minW={'100vw'}
      direction={{ base: 'column', md: 'row' }}
    >
      <Flex p={8} flex={1} align={'center'} justify={'center'}>
        <Stack spacing={4} w={'full'} maxW={'md'}>
          <Heading fontSize={'2xl'}>Sign in to your account</Heading>
          <form onSubmit={handleSubmit}>
            <FormControl>
              <FormLabel htmlFor="email">Email address</FormLabel>
              <Input
                borderColor="gray.400"
                name="email"
                type="text"
                onChange={(e) => setUser(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                borderColor="gray.400"
                name="password"
                type="password"
                onChange={(e) => setPass(e.target.value)}
              />
            </FormControl>
            <Stack spacing={6}>
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                align={'start'}
                justify={'space-between'}
              >
                <Link color={'blue.500'}>Forgot password?</Link>
              </Stack>
              <Button colorScheme={'blue'} variant={'solid'} type="submit">
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
