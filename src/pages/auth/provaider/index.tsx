import React, { ReactNode } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useToast } from "@chakra-ui/react";

interface Props {
  children: ReactNode;
}
function Provider({ children }: Props) {
  const toast = useToast();
  const router = useRouter();
  const { data: session, status } = useSession();

  // if (status === 'loading') {
  //   return <Loading size="200px">Carregando...</Loading>;
  // }
  if (!session && router.asPath !== '/auth/signin') {
    router.push('/auth/signin');
  }
  if (!status && router.asPath !== '/auth/signin') {
    router.push('/auth/signin');
  }
  if (!session && router.asPath === '/auth/signin') {
    return children;
  }
  if (
    !session &&
    router.asPath ===
      '/auth/signin?callbackUrl=http%3A%2F%2Flocalhost%3A3000&error=CredentialsSignin'
  ) {
    return (
      toast({
        title: 'Email ou senha incorreto',
        description: 'As credenciais que você está usando são inválidas.',
        status: 'error',
        duration: 7000,
        position: 'top-right',
        isClosable: true,
      }),
      children
    );
  }
  // if (!status && router.asPath === '/') {
  //   router.push('/auth/signin');
  //   return <Loading size="200px">Carregando...</Loading>;
  // }
  // if (!session && router.asPath === '/') {
  //   router.push('/auth/signin');
  //   return <Loading size="200px">Carregando...</Loading>;
  // }
  if (
    (session && router.asPath === '/auth/signin') ||
    (status && router.asPath === '/auth/signin')
  ) {
    router.push('/');
    // return <Loading size="200px">Redirecionando...</Loading>;
  }
    
  return (
    <>
      <SessionProvider>
        {children}
      </SessionProvider>
    </>
  );
}

export default Provider;
