import App from "next/app";
import AppHead from "@/components/elements/head";
import ErrorPage from "next/error";
import { useRouter } from "next/router";
import { getStrapiMedia } from "utils/media";
import { getGlobalData } from "utils/api";
import Layout from "@/components/layout";
import { Provider } from "next-auth/client";
import { ChakraProvider, extendTheme, CSSReset } from "@chakra-ui/react";
import theme from "../styles/theme";

const myTheme = extendTheme(theme);

const MyApp = ({ Component, pageProps }) => {
  // Prevent Next bug when it tries to render the [[...slug]] route
  const router = useRouter();
  if (router.asPath === "/[[...slug]]") {
    return null;
  }

  // Extract the data we need
  const { global } = pageProps;
  if (global == null) {
    return <ErrorPage statusCode={404} />;
  }

  return (
    <ChakraProvider theme={myTheme}>
      <Provider session={pageProps.session}>
        <AppHead favicon={getStrapiMedia(global.favicon.url)} />
        <CSSReset />
        <Layout global={global}>
          <Component {...pageProps} />
        </Layout>
      </Provider>
    </ChakraProvider>
  );
};

// getInitialProps disables automatic static optimization for pages that don't
// have getStaticProps. So [[...slug]] pages still get SSG.
// Hopefully we can replace this with getStaticProps once this issue is fixed:
// https://github.com/vercel/next.js/discussions/10949
MyApp.getInitialProps = async (ctx) => {
  // Calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(ctx);
  // Fetch global site settings from Strapi
  const global = await getGlobalData();
  // Pass the data to our page via props
  return { ...appProps, pageProps: { global, path: ctx.pathname } };
};

export default MyApp;
