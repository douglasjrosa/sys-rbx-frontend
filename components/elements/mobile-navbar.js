import { Flex, Text, Center } from "@chakra-ui/layout";
import { GiHamburgerMenu } from "react-icons/gi";
import NextLink from "next/link";
import { useRouter } from 'next/router';
import ProfilePopover from "./profile-popover";

import NavMenuItems from "./nav-menu-items";
import {
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    Spacer
  } from "@chakra-ui/react"

const MobileNavbar = () => {
    
    let fontColor, pageTitle;
    const router = useRouter();
    return (
        <Flex
            flexDir="row"
            h="60px"
            w="100%"
            display={["flex", "flex", "none", "none", "none"]}
        >
            <Center>
                <Menu>
                    <MenuButton
                        as={IconButton}
                        h="100%"
                        w="60px"
                        color="greenyellow"
                        aria-label="Options"
                        icon={<GiHamburgerMenu />}
                        fontSize="30px"
                        ml="10px"
                        bg="transparent"
                        transition="all 0.2s"
                        border="none"
                        _hover={{ bg: "gray.600" }}
                        _expanded={{ bg: "gray.600" }}
                    />
                    <MenuList
                        bg="gray.700"
                    >
                        {NavMenuItems.map((item) => {
                            if(router.asPath === item.url){
                                fontColor = "greenyellow";
                                pageTitle = item.text;
                            }
                            else{ fontColor = "whiteAlpha.800"; }

                            return (
                            <NextLink
                                href={item.url}
                                key={`mobile-nav-link-${item.id}`}
                            >
                                <MenuItem
                                    _hover={{ bg: "gray.600" }}
                                    key={`mobile-nav-${item.id}`}
                                    icon={item.iconComponent}
                                    color={fontColor}
                                >
                                    {item.text}
                                </MenuItem>
                            </NextLink>
                            )
                        })}
                    </MenuList>
                </Menu>
                <Text
                    color="whiteAlpha.800"
                    fontSize="2xl"
                >
                    {pageTitle}
                </Text>
            </Center>
                <Spacer/>
            <Center
                px="10px"
            >
                <ProfilePopover />
            </Center>
      </Flex>
    )
}
export default MobileNavbar;
