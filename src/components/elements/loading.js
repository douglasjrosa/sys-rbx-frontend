import { Center, CircularProgress, Flex, Heading } from '@chakra-ui/react';

function Loading(props) {
  const pageProps = { ...props },
    { children } = pageProps;
  delete pageProps.children;

  return (
    <Flex flexDir="column">
      <Center mt="20vh">
        <CircularProgress color="green.300" isIndeterminate {...pageProps} />
      </Center>

      <Center mt="30px">
        <Heading color="gray.500" variant="H1">
          {children}
        </Heading>
      </Center>
    </Flex>
  );
}

export default Loading;
