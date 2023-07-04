import {
  Avatar,
  Button,
  Flex,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Portal,
} from '@chakra-ui/react';
import NextLink from 'next/link';

import { ExternalLinkIcon } from '@chakra-ui/icons';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const ProfilePopover = () => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <>
      {session && (
        <Popover>
          {({ onClose }) => (
            <>
              <PopoverTrigger>
                <Button
                  borderRadius="full"
                  w="56px"
                  h="56px"
                  bg="transparent"
                  _hover={{ bg: 'gray.400' }}
                >
                  <Avatar
                    name={session.user.name}
                    src={session.user.image}
                    size="md"
                  />
                </Button>
              </PopoverTrigger>

              <Portal>
                <PopoverContent>
                  <PopoverArrow />
                  <PopoverHeader>{session.user.name}</PopoverHeader>
                  <PopoverCloseButton />
                  <PopoverBody>
                    <NextLink href="/perfil">
                      <Button bg="transparent" onClick={onClose}>
                        Meu perfil
                      </Button>
                    </NextLink>
                  </PopoverBody>
                  <PopoverFooter>
                    <Flex justifyContent="flex-end">
                      <Button
                        bg="red.200"
                        rightIcon={<ExternalLinkIcon />}
                        onClick={() => signOut({
                          redirect: false,
                          callbackUrl: '/auth/signin'
                        })}
                      >
                        Sair
                      </Button>
                    </Flex>
                  </PopoverFooter>
                </PopoverContent>
              </Portal>
            </>
          )}
        </Popover>
      )}
    </>
  );
};
export default ProfilePopover;
