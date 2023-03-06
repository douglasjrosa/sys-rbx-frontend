/* eslint-disable react-hooks/exhaustive-deps */
import { Box, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Loading from '../../../components/elements/loading';
import { BodyChat } from '../../../components/negocios/component/bodychat';
import { NegocioFooter } from '../../../components/negocios/component/footer';
import { NegocioHeader } from '../../../components/negocios/component/hearder';
import { Business } from '../../../types/Busines';

export default function CreateNegocio() {
  const router = useRouter();
  const id = router.query.id;
  const toast = useToast();
  const [msg, setMsg] = useState([]);
  const [loadingGeral, setLoadingGeral] = useState(true);
  const [loading, setLoading] = useState(false);
  const [nBusiness, setnBusiness] = useState('');
  const [Approach, setApproach] = useState('');
  const [Budget, setBudget] = useState('');
  const [Status, setStatus] = useState('');
  const [Deadline, setDeadline] = useState('');
  const [Historia, setHistoria] = useState([]);
  const [ChatHistory, setChatHistory] = useState([]);

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
          console.log(res.data.attributes);
          setnBusiness(res.data.attributes.nBusiness);
          setApproach(res.data.attributes.Approach);
          setBudget(res.data.attributes.Budget);
          setStatus(res.data.attributes.statusAnd);
          setDeadline(res.data.attributes.deadline);
          setHistoria(res.data.attributes.history);
          setChatHistory(res.data.attributes.incidentRecord);
          // fim do loading
          setLoadingGeral(false);
        })
        .catch((err) => {
          console.log(err);
          toast({
            title: 'Opss',
            description: 'erro ao recuperar as informaçoes',
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
          // fim do loading
          setLoadingGeral(false);
        });
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const url = '/api/db/business/get/id/' + id;
      console.log(url);
      //cunsulta informaçoes geraris do cliente
      await axios({
        method: 'GET',
        url: url,
      })
        .then((res) => {
          console.log(res.data.attributes);
          setChatHistory(res.data.attributes.incidentRecord);
          // fim do loading
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          toast({
            title: 'Opss',
            description: 'erro ao recuperar as informaçoes',
            status: 'error',
            duration: 9000,
            isClosable: true,
          });
          // fim do loading
          setLoading(false);
        });
    })();
  }, [msg]);

  function getMsg(menssage: React.SetStateAction<any>) {
    setMsg(menssage);
  }

  if (loadingGeral) {
    return <Loading size="200px">Carregando...</Loading>;
  }

  return (
    <>
      <Box w="full" h="full">
        <Box bg={'yellow.400'} w="full" h="20%" p={5}>
          <NegocioHeader
            nBusiness={nBusiness}
            Approach={Approach}
            Budget={Budget}
            Status={Status}
            Deadline={Deadline}
            historia={Historia}
          />
        </Box>
        <Box bg="blue.300" w="full" h="70%" overflowX={'hidden'}>
          <BodyChat conteudo={ChatHistory} loading={loading} />
        </Box>
        <Box w="full" h="10%">
          <NegocioFooter data={ChatHistory} onGetValue={getMsg} />
        </Box>
      </Box>
    </>
  );
}
