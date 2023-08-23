import { Box, Button, Flex, FormLabel, Heading, Select } from '@chakra-ui/react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
}

export const SelectUser = (props: {
  onValue: any; user: string
}) => {
  const { data: session } = useSession();
  const [user, setUser] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const usuario = props.user
    setUser(usuario)
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/db/user');
        setUsers(response.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [props, session?.user.name]);

  const handleUserChange = () => {
    props.onValue(user);
  };

  return (
    <>
      {session?.user.pemission !== 'Adm' ? (
        <>
          <FormLabel
            htmlFor="cnpj"
            fontSize="xs"
            fontWeight="md"
            color="white"
          >
            Usuário
          </FormLabel>
          <Box w={'16rem'}>
            <Heading>{session?.user.name}</Heading>
          </Box>
        </>
      ) : (
        <>
          <Flex flexDir={'row'} w={'100%'} alignItems={'self-end'} gap={5}>
            <Box>
              <FormLabel
                htmlFor="cnpj"
                fontSize="xs"
                fontWeight="md"
                color="white"
              >
                Usuário
              </FormLabel>
              <Select
                w={'12rem'}
                onChange={(e) => setUser(e.target.value)}
                value={user}
                color="white"
                bg='gray.800'
              >
                {users.map((user) => (
                  <option style={{ backgroundColor: "#1A202C" }} key={user.id} value={user.username}>
                    {user.username}
                  </option>
                ))}
              </Select>
            </Box>
            <Button variant={'solid'} colorScheme={'green'} px={6} onClick={handleUserChange}>Filtrar</Button>
          </Flex>

        </>
      )}

    </>
  );
};

