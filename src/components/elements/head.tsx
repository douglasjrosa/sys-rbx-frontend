/* eslint-disable react/prop-types */
import Head from 'next/head';

<<<<<<< Updated upstream:src/components/elements/head.js
function AppHead(props) {
=======
const AppHead = (props: { favicon: string; }) => {
>>>>>>> Stashed changes:src/components/elements/head.tsx
  /* Favicon */
  return (
    <Head>
      <link rel="shortcut icon" href={props.favicon} />
    </Head>
  );
}

export default AppHead;
