import Navbar from "./elements/navbar";
import Footer from "./elements/footer";
import { Flex, Center, Box } from "@chakra-ui/react"

const Layout = ({ children, global }) => {
  const { navbar, footer } = global;

  return (
    <Flex
      h={[null, null, "100vh"]}
      flexDir={["column", "column", "row"]}
      overflow="hidden"
      maxW="2000px"
    >
      <Flex
        flexDir="column"
        alignItems="center"
        bg="gray.700"
        w={["100%", "100%", "20%", "20%", "20%"]}
        minW="150px"
      >
        <Navbar navbar={navbar} />
      </Flex>
      <Flex
        minH="100vh"
        overflow="auto"
        w={["100%", "100%", "80%", "80%", "80%"]}
        flexDir="column"
      >
        <div className="">{children}</div>
      </Flex>
      {/* <Footer footer={footer} /> */}
    </Flex>
  );
};

export default Layout;
