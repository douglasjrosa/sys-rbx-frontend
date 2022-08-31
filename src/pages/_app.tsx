import AppHead from '../components/elements/head';
import Layout from '../components/layout';
import Provider  from 'next-auth/providers';
import { ChakraProvider, extendTheme, CSSReset } from '@chakra-ui/react';

const MyApp = ({ Component, pageProps }) => {
  return (
    <Provider session={pageProps.session}>
      <ChakraProvider>
        <AppHead favicon="https://rbx-backend-media.s3.sa-east-1.amazonaws.com/thumbnail_logotipo_ribermax_180x180_min_06701e43ad.webp" />
        <CSSReset />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </Provider>
  );
};
export default MyApp;
