import { FormLabel, Select } from '@chakra-ui/react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { memo, useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
}

export const SelectUser = (props: {
  onValue: any;
}) => {
  const { data: session } = useSession();
  const [user, setUser] = useState<string | any>(session?.user.name);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const usuario = session?.user.name
    localStorage.setItem('user', `${usuario}`)
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

  const handleUserChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setUser(value);
    props.onValue(value);
    localStorage.setItem('user', `${value}`)
  };


  return (
    <>
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
        onChange={handleUserChange}
        isDisabled={session?.user.pemission !== 'Adm'}
        value={user}
        color="white"
        bg='gray.800'
      >
        {users.map((user) => (
          <option style={{ backgroundColor: "#1A202C" }}  key={user.id} value={user.username}>
            {user.username}
          </option>
        ))}
      </Select>
    </>
  );
};

