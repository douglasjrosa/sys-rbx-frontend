import { Select } from '@chakra-ui/react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';


export const SelectUser = (props: {
  onValue: any;
}) => {
  const { data: sessesion } = useSession();
  const [user, setUser] = useState('');
  const [data, setData] = useState<any>([])
  useEffect(() => {
    if(!user){
      props.onValue(sessesion?.user?.name);
    }
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
  }, [props, sessesion?.user?.name, user]);

  useEffect(() => {
    if(!user){
      const usuarioInit: any = sessesion?.user?.name
      setUser(usuarioInit);
    } else {
      props.onValue(user)
    }

  }, [props, sessesion?.user?.name, user]);

  return (
    <>
      <Select
        w={'12rem'}
        onChange={(e) => {
          const value = e.target.value;
          setUser(value);
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
