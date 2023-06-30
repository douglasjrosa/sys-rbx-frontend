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
import { useRouter } from 'next/router';
import { FormEventHandler, useState } from 'react';

const SignIn: NextPage = (): JSX.Element => {
  const [user, setUser] = useState<string>('');
  const [pass, setPass] = useState<string>('');
  const toast = useToast();
  const router = useRouter()

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const res: any = await signIn('credentials', {
      email: user,
      password: pass,
      redirect: false,
    });

    if (res.status !== 200) {
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
      bg={'white'}
    >
      <Flex p={8} bg={'white'} flex={1} align={'center'} justify={'center'}>
        <Stack spacing={4} w={'full'} maxW={'md'} bg={'white'}>
          <Image
            alt={'Logo'}
            objectFit={'cover'}
            bg={'white'}
            w={'18rem'}
            m={'auto'}
            src={'https://ribermax.com.br/images/logomarca-efect.webp?w=1080&q=75'}
          />
          <form onSubmit={handleSubmit}>
            <FormControl bg={'white'}>
              <FormLabel bg={'white'} color={'black'} htmlFor="email">Usuário</FormLabel>
              <Input
                borderColor="gray.500"
                color={'black'}
                name="email"
                type="text"
                onChange={(e) => setUser(e.target.value)}
              />
            </FormControl>
            <FormControl bg={'white'}>
              <FormLabel bg={'white'} color={'black'} htmlFor="password">Senha</FormLabel>
              <Input
                borderColor="gray.500"
                color={'black'}
                name="password"
                type="password"
                onChange={(e) => setPass(e.target.value)}
              />
            </FormControl>
            <Stack bg={'white'} spacing={6}>
              <Stack
                direction={{ base: 'column', sm: 'row' }}
                align={'start'}
                justify={'space-between'}
              >
                {/* <Link color={'blue.500'} onClick={() => router.push('/auth/verify-request')}>Esqueceu sua senha?</Link> */}
              </Stack>
              <Button colorScheme={'blue'} variant={'solid'} type="submit">
                Entrar
              </Button>
            </Stack>
          </form>
        </Stack>
      </Flex>
      <Flex flex={1}>
        <Image
          alt={'Login Image'}
          objectFit={'cover'}
          src={'https://ribermax.com.br/images/porto%20de%20santos.jpg?w=1080&q=75'}
        />
      </Flex>
    </Stack>
  );
};
export default SignIn;
