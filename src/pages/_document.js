<<<<<<<< HEAD:src/pages/_document.tsx
import Document, { Head, Html, Main, NextScript } from 'next/document';

========
import Document, { Html, Head, Main, NextScript } from 'next/document';
>>>>>>>> 2cecaf86e55c7c8cd329b1786995b93d1a123cd2:src/pages/_document.js

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="pt-BR">
        <Head />

        <body>
          <Main />

          <NextScript />
        </body>
      </Html>
    );
  }
}
