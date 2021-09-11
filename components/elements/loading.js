import { CircularProgress, Flex, Center, Heading } from "@chakra-ui/react";

const Loading = (props) => {
    const pageProps = Object.assign({}, props);
    const children = pageProps.children;
    delete pageProps.children;
    
    return(
        <Flex flexDir="column">
            <Center mt="20vh">
                <CircularProgress isIndeterminate color="green.300" {...pageProps} />
            </Center>
            <Center mt="30px">
                <Heading color="gray.500" variant="H1">{children}</Heading>
            </Center>
        </Flex>
    )
}

export default Loading;