import { Select } from '@chakra-ui/react';
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
  };


  return (
    <Select
      w={'12rem'}
      onChange={handleUserChange}
      value={user}
    >
      {users.map((user) => (
        <option key={user.id} value={user.username}>
          {user.username}
        </option>
      ))}
    </Select>
  );
};

