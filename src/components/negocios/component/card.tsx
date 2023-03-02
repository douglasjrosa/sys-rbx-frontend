/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import { Box } from '@chakra-ui/react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function CardEmpresa() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await axios({
        method: 'GET',
        url: '/',
      })
        .then((res) => {
          console.log(res.data);
        })
        .catch((err) => {
          console.error(err);
        });
    })();
  }, []);

  return (
    <>
      <Box h={'95%'}></Box>
    </>
  );
}
