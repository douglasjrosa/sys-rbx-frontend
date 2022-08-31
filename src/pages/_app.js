/* eslint-disable react/prop-types */
import AppHead from 'src/components/elements/head';
import Layout from 'src/components/layout';
import { Provider } from 'next-auth/client';
import { CSSReset, ChakraProvider } from '@chakra-ui/react';
function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <AppHead favicon="https://ribermax.com.br/images/logomarca-h.webp?w=1080&q=75" />
      <CSSReset />
      <Layout>
        <Component />
      </Layout>
    </ChakraProvider>
  );
}
export default MyApp;
