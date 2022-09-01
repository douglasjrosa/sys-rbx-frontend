/* eslint-disable react/prop-types */
import Navbar from './elements/navbar';
import Loading from './elements/loading';
import MobileNavbar from './elements/mobile-navbar';
import { Flex } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

function Layout({ children }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <Loading size="200px">Carregando...</Loading>;
  }

  if (!status && router.asPath !== '/auth/signin') {
    router.push('/auth/signin');
    console.log('passou');
    return <Loading size="200px">Redirecionando...</Loading>;
  }

  if (!session && router.asPath === '/auth/signin') {
    return children;
  }
  if (!status&& router.asPath === '/'||!session && router.asPath === '/') {
    router.push('/auth/signin');
  }
  if (!status && router.asPath === '/') {
    router.push('/auth/signin');
  }

  if (session && router.asPath === '/auth/signin') {
    console.log(status);
    router.push('/');
    return <Loading size="200px">Redirecionando...</Loading>;
  }

  return (
    <Flex
      h={[null, null, '100vh']}
      flexDir={['column', 'column', 'row']}
      overflow="hidden"
      maxW="2000px"
    >
      <Flex
        alignItems="center"
        bg="gray.700"
        flexDir="column"
        minW="150px"
        w={['100%', '100%', '15%', '15%', '15%']}
      >
        <Navbar />

        <MobileNavbar />
      </Flex>

      <Flex
        flexDir="column"
        minH="100vh"
        overflow="auto"
        w={['100%', '100%', '80%', '80%', '80%']}
      >
        {children}
      </Flex>
    </Flex>
  );
}

export default Layout;
