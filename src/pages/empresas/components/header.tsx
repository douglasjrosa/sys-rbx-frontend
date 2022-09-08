import { Box, chakra, Flex, Heading, Hide, Highlight } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';

export const Header = () => {
  const { data: session, status } = useSession();
  const nome = session.user.name;
  const online = status === 'authenticated' ? 'Online' : 'Offline';
  const colorStatus = online === "Online" ? 'blue.400' : 'red.400';
  return (
    <Hide below="md">
      <Flex
        w={'full'}
        h={16}
        borderBottom={'2px'}
        borderColor={'gray.300'}
        display={'flex'}
        alignItems={'center'}
        justifyContent="space-around"
      >
        <Box>
          <Heading size={'sd'} color={'gray.500'}>Listas De Empresas</Heading>
        </Box>
        <Box display={'flex'} flexDirection={'column'} alignItems={'center'} h='100%' justifyContent={'space-evenly'} py='2'>
          <Box>
            <chakra.span fontWeight={'light'} fontSize='xs'color={'gray.700'}>Usuario: </chakra.span>
            <chakra.span fontWeight={'light'} fontSize='xs'color={'gray.700'}>{nome}</chakra.span>
          </Box>
          <Box>
            <Highlight
              query={online}
              styles={{ color: 'white' ,fontWeight: 'light',fontSize: 'xs', rounded: '10', px: '2', py: '1', bg: colorStatus }}
            >
              {online}
            </Highlight>

          </Box>
        </Box>
      </Flex>
    </Hide>
  );
};
