import Head from "next/head";

const AppHead = (props) => {

    /* Favicon */
    return (
        <Head>
           <link rel="shortcut icon" href={props.favicon} />
        </Head>
    )
}

export default AppHead;