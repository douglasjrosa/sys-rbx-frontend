/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { NegocioFooter } from '../../../components/negocios/component/footer';
import { NegocioHeader } from '../../../components/negocios/component/hearder';
import axios from 'axios';
import { useRouter } from 'next/router';
import Loading from '../../../components/elements/loading';

export default function CreateNegocio() {
  const router = useRouter();
  const id = router.query.id;
  const [msg, setMsg] = useState([]);
  const [Infos, setInfos] = useState([]);
  const [loadingGeral, setLoadingGeral] = useState(false);
  const [loading, setLoading] = useState(false);

  // recuperar infos do cliente
  useEffect(() => {
    (async () => {
      // inicio do lading
      setLoadingGeral(true);
      //cunsulta informaçoes geraris do cliente
      await axios({
        method: 'GET',
        url: '/api/db/business/get/id/' + id,
      })
        .then((res) => {
          setInfos(res.data);
          // fim do loading
          setLoadingGeral(false);
        })
        .catch((err) => {
          console.log(err);
          // fim do loading
          setLoadingGeral(false);
        });
    })();
  }, []);

  // savar informação do cliente

  // savar mesagens

  useEffect(() => {
    (async () => {
      // inicio do lading
      setLoading(true);
      //cunsulta msg antigas
      const response = await axios({
        method: 'GET',
        url: '/api/db/business/get/id/' + id,
      });
      const data = response.data;
      // salvar msg salva
      if (msg || msg.length !== 0 || msg !== undefined) {
        await axios({
          method: 'PUT',
          url: '/api/db/business/put/id/' + id,
          data: msg,
        })
          .then((res) => {})
          .catch((err) => console.log(err));
      }
      // fim do loading
      setLoading(false);
    })();
  }, [msg]);

  function getMsg(menssage: React.SetStateAction<any>) {
    setMsg(menssage);
  }

  if (loading) {
    return <Loading size="200px">Carregando...</Loading>;
  }

  return (
    <>
      <Box w="full" h="full">
        <Box bg={'yellow.400'} w="full" h="20%" p={5}>
          <NegocioHeader />
        </Box>
        <Box bg="blue.300" w="full" h="70%" overflowX={'hidden'}>
          Body
        </Box>
        <Box w="full" h="10%">
          <NegocioFooter onGetValue={getMsg} />
        </Box>
      </Box>
    </>
  );
}
