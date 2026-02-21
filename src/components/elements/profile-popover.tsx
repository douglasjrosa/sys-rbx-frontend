import {
  Avatar,
  Badge,
  Button,
  Flex,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Text,
  useDisclosure,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import NextLink from 'next/link';

import { ExternalLinkIcon } from '@chakra-ui/icons';
import { signOut, useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

import { CloseIcon } from '@chakra-ui/icons';
import { getPseudoUser, setPseudoUser, PSEUDO_USER_ALL } from '@/utils/pseudoUser';
import { Z_INDEX } from '@/utils/zIndex';

const MOBILE_MODAL_THEME = {
  bg: 'gray.700',
  borderColor: 'gray.800',
  headerBg: 'gray.600',
  bodyBg: 'gray.700',
  footerBg: 'gray.600',
  buttonHover: 'gray.500',
  signOutBg: 'red.500',
  signOutHover: 'red.600',
  badgeSelected: { bg: 'blue.600', color: 'white' },
  badgeUnselected: { bg: 'gray.600', color: 'gray.300' },
};

interface ProfilePopoverProps {
  isMobile?: boolean;
  blockOpenRef?: React.MutableRefObject<boolean>;
}

interface UserItem {
  id: number;
  username: string;
}

const UserBadges = ({
  currentUsername,
  onSelect,
  isDark = false,
}: {
  currentUsername: string;
  onSelect: (username: string | null) => void;
  isDark?: boolean;
}) => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const pseudoUser = getPseudoUser();

  useEffect(() => {
    axios
      .get('/api/db/user')
      .then((res) => {
        const data = res.data?.data ?? res.data;
        const list = Array.isArray(data) ? data : [];
        setUsers(list.filter((u: UserItem) => u.username !== currentUsername));
      })
      .catch(() => setUsers([]));
  }, [currentUsername]);

  const handleBadgeClick = useCallback(
    (value: string | null) => {
      setPseudoUser(value);
      onSelect(value);
    },
    [onSelect]
  );

  const getBadgeProps = (isSelected: boolean) => {
    if (isDark) {
      return isSelected ? MOBILE_MODAL_THEME.badgeSelected : MOBILE_MODAL_THEME.badgeUnselected;
    }
    return { colorScheme: isSelected ? 'blue' : 'gray' };
  };

  return (
    <>
      <Text fontSize="md" fontWeight="medium" mb={2} color={isDark ? 'gray.300' : 'gray.600'}>
        Visualizar como:
      </Text>
      <Wrap spacing={2}>
        <WrapItem>
          <Badge
            as="button"
            cursor="pointer"
            px={3}
            py={1}
            borderRadius="md"
            onClick={() => handleBadgeClick(null)}
            {...(isDark ? getBadgeProps(!pseudoUser) : { colorScheme: !pseudoUser ? 'blue' : 'gray' })}
          >
            Eu
          </Badge>
        </WrapItem>
        <WrapItem>
          <Badge
            as="button"
            cursor="pointer"
            px={3}
            py={1}
            borderRadius="md"
            onClick={() => handleBadgeClick(PSEUDO_USER_ALL)}
            {...(isDark ? getBadgeProps(pseudoUser === PSEUDO_USER_ALL) : { colorScheme: pseudoUser === PSEUDO_USER_ALL ? 'blue' : 'gray' })}
          >
            Todos
          </Badge>
        </WrapItem>
        {users.map((u) => (
          <WrapItem key={u.id}>
            <Badge
              as="button"
              cursor="pointer"
              px={3}
              py={1}
              borderRadius="md"
              onClick={() => handleBadgeClick(u.username)}
              {...(isDark ? getBadgeProps(pseudoUser === u.username) : { colorScheme: pseudoUser === u.username ? 'blue' : 'gray' })}
            >
              {u.username}
            </Badge>
          </WrapItem>
        ))}
      </Wrap>
    </>
  );
};

const ProfilePopover = ({ isMobile = false, blockOpenRef }: ProfilePopoverProps) => {
  const { data: session } = useSession();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handlePseudoUserSelect = useCallback((closeFn?: () => void) => {
    closeFn?.();
  }, []);

  const handleSignOut = useCallback(() => {
    onClose();
    setPseudoUser(null);
    signOut({ redirect: false, callbackUrl: '/auth/signin' });
  }, [onClose]);

  if (!session?.user) return null;

  const isAdmin = session.user.pemission === 'Adm';

  if (isMobile) {
    return (
      <>
        <Button
          borderRadius="full"
          w="36px"
          h="36px"
          minW="36px"
          minH="36px"
          p="0"
          bg="transparent"
          _hover={{ bg: 'transparent' }}
          onClick={() => {
            if (blockOpenRef?.current) return;
            onOpen();
          }}
        >
          <Avatar
            name={session.user.name}
            src={session.user.image}
            size="sm"
          />
        </Button>

        <Modal isOpen={isOpen} onClose={onClose} size="full">
          <ModalOverlay zIndex={Z_INDEX.MOBILE_NAVBAR_OVERLAY} bg="blackAlpha.700" />
          <ModalContent
            zIndex={Z_INDEX.MOBILE_NAVBAR_CONTENT}
            bg={MOBILE_MODAL_THEME.bg}
            color="white"
            borderRadius="0"
          >
            <ModalHeader
              bg={MOBILE_MODAL_THEME.headerBg}
              borderBottom="1px"
              borderColor={MOBILE_MODAL_THEME.borderColor}
              fontSize="1.25rem"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              {session.user.name}
              <IconButton
                aria-label="Fechar"
                icon={<CloseIcon />}
                variant="ghost"
                color="white"
                _hover={{ bg: 'gray.500' }}
                onClick={onClose}
              />
            </ModalHeader>
            <ModalBody bg={MOBILE_MODAL_THEME.bodyBg} py="6">
              <NextLink href="/perfil">
                <Button
                  w="100%"
                  justifyContent="flex-start"
                  h="56px"
                  px="20px"
                  fontSize="1.25rem"
                  bg="gray.600"
                  color="white"
                  _hover={{ bg: MOBILE_MODAL_THEME.buttonHover }}
                  onClick={onClose}
                >
                  Meu perfil
                </Button>
              </NextLink>
              {isAdmin && (
                <Flex flexDir="column" mt={6}>
                  <UserBadges
                    currentUsername={session.user.name ?? ''}
                    onSelect={() => handlePseudoUserSelect(onClose)}
                    isDark
                  />
                </Flex>
              )}
            </ModalBody>
            <ModalFooter
              bg={MOBILE_MODAL_THEME.footerBg}
              borderTop="1px"
              borderColor={MOBILE_MODAL_THEME.borderColor}
            >
              <Button
                bg={MOBILE_MODAL_THEME.signOutBg}
                color="white"
                rightIcon={<ExternalLinkIcon />}
                _hover={{ bg: MOBILE_MODAL_THEME.signOutHover }}
                onClick={handleSignOut}
              >
                Sair
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  }

  return (
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
            <PopoverContent
              bg={MOBILE_MODAL_THEME.bg}
              color="white"
              border="1px solid rgb(17, 17, 17)"
              borderRadius="5px"
              overflow="hidden"
              boxShadow="none"
              _focus={{ boxShadow: 'none' }}
              ml={5}
            >
              <PopoverArrow bg={MOBILE_MODAL_THEME.bg} boxShadow="none" />
              <PopoverHeader
                bg={MOBILE_MODAL_THEME.headerBg}
                borderBottom="1px"
                borderColor={MOBILE_MODAL_THEME.borderColor}
                borderTopRadius="5px"
              >
                {session.user.name}
              </PopoverHeader>
              <PopoverCloseButton color="white" _hover={{ bg: MOBILE_MODAL_THEME.buttonHover }} />
              <PopoverBody bg={MOBILE_MODAL_THEME.bodyBg}>
                <NextLink href="/perfil">
                  <Button
                    w="100%"
                    justifyContent="flex-start"
                    bg="gray.600"
                    color="white"
                    _hover={{ bg: MOBILE_MODAL_THEME.buttonHover }}
                    onClick={onClose}
                  >
                    Meu perfil
                  </Button>
                </NextLink>
                {isAdmin && (
                  <Flex flexDir="column" mt={6}>
                    <UserBadges
                      currentUsername={session.user.name ?? ''}
                      onSelect={() => handlePseudoUserSelect(onClose)}
                      isDark
                    />
                  </Flex>
                )}
              </PopoverBody>
              <PopoverFooter
                bg={MOBILE_MODAL_THEME.footerBg}
                borderTop="1px"
                borderColor={MOBILE_MODAL_THEME.borderColor}
                borderBottomRadius="5px"
              >
                <Flex justifyContent="flex-end">
                  <Button
                    bg={MOBILE_MODAL_THEME.signOutBg}
                    color="white"
                    rightIcon={<ExternalLinkIcon />}
                    _hover={{ bg: MOBILE_MODAL_THEME.signOutHover }}
                    onClick={() => {
                      onClose();
                      setPseudoUser(null);
                      signOut({ redirect: false, callbackUrl: '/auth/signin' });
                    }}
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
  );
};
export default ProfilePopover;
