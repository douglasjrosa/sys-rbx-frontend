import Navbar from "./elements/navbar";
import { Flex } from "@chakra-ui/react";
import MobileNavbar from "./elements/mobile-navbar";

const Layout = ({ children }) => {

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
        w={["100%", "100%", "15%", "15%", "15%"]}
        minW="150px"
      >
        <Navbar />
        <MobileNavbar />
      </Flex>
      <Flex
        minH="100vh"
        overflow="auto"
        w={["100%", "100%", "80%", "80%", "80%"]}
        flexDir="column"
      >
        {children}
      </Flex>
    </Flex>
  );
};

export default Layout;
