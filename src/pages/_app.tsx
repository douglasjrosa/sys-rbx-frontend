<<<<<<< HEAD
import { ChakraProvider, CSSReset } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import AppHead from "../components/elements/head";
import Layout from "../components/layout";
import { FunctionComponent } from "react";
import "../styles/globals.css";

interface MyAppProps {
  Component: FunctionComponent<any>;
  pageProps: {
    session: any;
    [key: string]: any;
  };
}

const MyApp: FunctionComponent<MyAppProps> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ChakraProvider>
        <AppHead favicon="https://rbx-backend-media.s3.sa-east-1.amazonaws.com/thumbnail_logotipo_ribermax_180x180_min_06701e43ad.webp" />
        {/* <CSSReset /> */}
=======
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
>>>>>>> 2cecaf86e55c7c8cd329b1786995b93d1a123cd2
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
<<<<<<< HEAD
    </SessionProvider>
  );
};

=======
    </Provider>
  );
};
>>>>>>> 2cecaf86e55c7c8cd329b1786995b93d1a123cd2
export default MyApp;
