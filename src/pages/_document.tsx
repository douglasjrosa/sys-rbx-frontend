import { ColorModeScript } from '@chakra-ui/react';
import Document, { Head, Html, Main, NextScript } from 'next/document';


export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="pt-BR">
        <Head />

        <body>
          <ColorModeScript initialColorMode="light" />
          <Main />

          <NextScript />
        </body>
      </Html>
    );
  }
}
