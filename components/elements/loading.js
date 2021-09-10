import { CircularProgress, Flex, Center, Heading } from "@chakra-ui/react";

const Loading = ({status}) => {
    return(
        <Flex flexDir="column">
            <Center mt="20vh">
                <CircularProgress isIndeterminate color="green.300" size="200px" />
            </Center>
            <Center mt="30px">
                <Heading color="gray.500" variant="H1">{status}</Heading>
            </Center>
        </Flex>
    )
}

export default Loading;