import NextLink from "next/link";
import { useRouter } from 'next/router';
import {
  Flex,
  Link,
  Text,
  ListItem,
  List,
  ListIcon,
  Image,
  Center
} from "@chakra-ui/react"
import NavMenuItems from "./nav-menu-items";
import ProfilePopover from "./profile-popover";

const Navbar = () => {
  
  const router = useRouter();
  
  return (
    <Flex
      flexDir="column"
      justifyContent="space-between"
      h="100vh"
      d={["none", "none", "flex", "flex", "flex"]}
    >
      <Flex
        flexDir="column"
        as="nav"
      >
        <Image
          rounded="5px"
          w="80%"
          m="10%"
          src="https://rbx-backend-media.s3.sa-east-1.amazonaws.com/thumbnail_logomarca_p_min_86fe429da5.webp"
          alt="Ribermax Logomarca"
        />
        <Flex
          flexDir="column"
          m="10%"
        >
          <List spacing={5}>
            {NavMenuItems.map((navItem) => (
              <ListItem key={`navbar-${navItem.id}`}>
                <Text fontSize="lg">
                  <ListIcon
                    color="greenyellow"
                    as={navItem.icon}
                  />
                  <NextLink href={navItem.url} as={navItem.url} passHref>
                    <Link 
                      color={
                        router.asPath === navItem.url ? "greenyellow" : "whiteAlpha.800"
                      }>
                      {navItem.text}
                    </Link>
                  </NextLink>
                </Text>
              </ListItem>
            ))}
          </List>
        </Flex>
      </Flex>
      <Center
        my="15px"
      >
        <ProfilePopover />
      </Center>
    </Flex>
  );
};
export default Navbar;
