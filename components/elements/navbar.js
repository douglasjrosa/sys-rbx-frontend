import { useState } from "react";
import PropTypes from "prop-types";
import { MdMenu } from "react-icons/md";
import MobileNavMenu from "./mobile-nav-menu";
import StrapiImage from "./image";
import {
  mediaPropTypes,
  linkPropTypes,
  buttonLinkPropTypes,
} from "utils/types";
import { signIn, signOut, useSession } from "next-auth/client"
import NextLink from "next/link";
import {
  Flex,
  Box,
  Text,
  List,
  ListItem,
  ListIcon,
  Link,
  Image,
  Spacer,
  Divider,
  Button,
  Center,
  Avatar
} from "@chakra-ui/react"
import {
  ArrowForwardIcon,
  ExternalLinkIcon,
  UnlockIcon
} from '@chakra-ui/icons';
import { useRouter } from 'next/router'

const Navbar = ({ navbar }) => {
  const [mobileMenuIsShown, setMobileMenuIsShown] = useState(false);
  const [session, loading] = useSession();
  
  const router = useRouter();
  return (
    <Flex
      flexDir="column"
      justifyContent="space-between"
      h="100vh"
    >
      {/* The actual navbar */}
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
            {navbar.links.map((navLink) => (
              <ListItem key={navLink.id}>
                <Text fontSize="lg">
                  <ListIcon
                    color="greenyellow"
                    as={ArrowForwardIcon}
                  />
                  <NextLink href={navLink.url} as={navLink.url} passHref>
                    <Link 
                      color={
                        router.asPath === navLink.url ? "green.300" : "whiteAlpha.800"
                      }>
                      {navLink.text}
                    </Link>
                  </NextLink>
                </Text>
              </ListItem>
            ))}
          </List>
        </Flex>
      </Flex>
      {!session && (
        <Flex
          m="10%"
        >
          <Button
            onClick={() => signIn()}
            leftIcon={<UnlockIcon />}
            colorScheme="success"
          >
            Entrar
          </Button>
        </Flex>
      )}
      {session && (
        <Flex
          flexDir="column"
          align="center"
        >
          <Avatar
            name={session.user.name}
            src={session.user.image}
          />
          <Text
            color="whiteAlpha.800"
          >
            {session.user.name}
          </Text>
          <Button
            colorScheme="secondary"
            leftIcon={<ExternalLinkIcon />}
            onClick={() => signOut()}
          >
            Sair
          </Button>
        </Flex>
      )}
    </Flex>
  );
};

Navbar.propTypes = {
  navbar: PropTypes.shape({
    logo: mediaPropTypes,
    links: PropTypes.arrayOf(linkPropTypes),
    button: buttonLinkPropTypes,
  }),
};

export default Navbar;
