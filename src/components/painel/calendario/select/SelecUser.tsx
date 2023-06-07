import { Select } from '@chakra-ui/react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';


export const SelectUser = (props: {
  onValue: any;
}) => {
  const { data: sessesion } = useSession();
  const [user, setUser] = useState(sessesion?.user?.name);
  const [data, setData] = useState<any>([])
  useEffect(() => {
    (async () => {
      await axios({
        method: 'GET',
        url: '/api/db/user',
      })
        .then((res) => {
          setData(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    })();
  }, []);

  return (
    <>
      <Select
        w={'10rem'}
        onChange={(e) => {
          const value = e.target.value;
          setUser(value);
          props.onValue(value);
        }}
        value={user}
      >
        {data.map((i: any) => (
          <option key={i.id} value={i.username}>
            {i.username}
          </option>
        ))}
      </Select>
    </>
  );
};
