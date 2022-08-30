/* eslint-disable react/prop-types */
import Head from 'next/head';

function AppHead(props) {
  /* Favicon */
  return (
    <Head>
      <link rel="shortcut icon" href={props.favicon} />
    </Head>
  );
}

export default AppHead;
