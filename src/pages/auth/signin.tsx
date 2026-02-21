/* eslint-disable no-undef */
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Image,
  Input,
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
            objectFit={'contain'}
            bg={'white'}
            w={'18rem'}
            m={'auto'}
            src={'/img/logomarca-efect.jpg'}
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
            <FormControl bg={'white'} mt={{ base: 4, md: 0 }}>
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
          src={'/img/porto-santos-1080x675.jpg'}
        />
      </Flex>
    </Stack>
  );
};
export default SignIn;
