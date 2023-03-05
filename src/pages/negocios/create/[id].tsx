/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Box } from '@chakra-ui/react';
import { NegocioFooter } from '../../../components/negocios/component/footer';
import { NegocioHeader } from '../../../components/negocios/component/hearder';
import axios from 'axios';
import { useRouter } from 'next/router';
import Loading from '../../../components/elements/loading';
import { Business } from '../../../types/Busines';

export default function CreateNegocio() {
  const router = useRouter();
  const id = router.query.id;

  const [msg, setMsg] = useState([]);
  const [Infos, setInfos] = useState<Business | any>('');
  const [loadingGeral, setLoadingGeral] = useState(true);
  const [loading, setLoading] = useState(false);

  // recuperar infos do cliente
  useEffect(() => {
    (async () => {
      const url = '/api/db/business/get/id/' + id;
      console.log(url);
      //cunsulta informaçoes geraris do cliente
      await axios({
        method: 'GET',
        url: url,
      })
        .then((res) => {
          console.log(res.data);
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

  // useEffect(() => {
  //   (async () => {
  //     // inicio do lading
  //     setLoading(true);
  //     //cunsulta msg antigas
  //     const response = await axios({
  //       method: 'GET',
  //       url: '/api/db/business/get/id/' + id,
  //     });
  //     const data = response.data;
  //     // salvar msg salva
  //     if (msg || msg.length !== 0 || msg !== undefined) {
  //       await axios({
  //         method: 'PUT',
  //         url: '/api/db/business/put/id/' + id,
  //         data: msg,
  //       })
  //         .then((res) => {})
  //         .catch((err) => console.log(err));
  //     }
  //     // fim do loading
  //     setLoading(false);
  //   })();
  // }, [msg]);

  function getMsg(menssage: React.SetStateAction<any>) {
    setMsg(menssage);
  }
  // console.log(Infos);
  function getnBusiness(nBusiness: React.SetStateAction<string>) {}
  function getApproach(Approach: React.SetStateAction<string>) {}
  function getBudget(Budget: React.SetStateAction<string>) {}
  function getStatus(Status: React.SetStateAction<boolean>) {}
  function getDeadline(Deadline: React.SetStateAction<string>) {}

  if (loading) {
    return <Loading size="200px">Carregando...</Loading>;
  }

  return (
    <>
      <Box w="full" h="full">
        <Box bg={'yellow.400'} w="full" h="20%" p={5}>
          <NegocioHeader
            // nBusiness={Infos.attributes.nBusiness}
            onNBusiness={getnBusiness}
            // Approach={Infos.attributes.Approach}
            onApproach={getApproach}
            // Budget={Infos.attributes.Budget}
            onBudget={getBudget}
            // Status={Infos.attributes.status}
            onStatus={getStatus}
            // Deadline={Infos.attributes.deadline}
            onDeadline={getDeadline}
          />
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
