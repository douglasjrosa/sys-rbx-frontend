/* eslint-disable react/prop-types */
import AppHead from 'src/components/elements/head';
import Layout from 'src/components/layout';
import { Provider } from 'next-auth/client';
import { CSSReset, ChakraProvider, extendTheme } from '@chakra-ui/react';
import theme from '../styles/theme';
function MyApp({ Component, pageProps }) {
  return (
    <Provider session={pageProps.session}>
      <ChakraProvider theme={theme}>
        <AppHead favicon="https://rbx-backend-media.s3.sa-east-1.amazonaws.com/thumbnail_logotipo_ribermax_180x180_min_06701e43ad.webp" />
        <CSSReset />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </Provider>
  );
}
export default MyApp;
