/* eslint-disable react-hooks/exhaustive-deps */
import { Box, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import Loading from '../../components/elements/loading';
import { BodyChat } from '../../components/negocios/component/bodychat';
import { NegocioFooter } from '../../components/negocios/component/footer';
import { NegocioHeader } from '../../components/negocios/component/hearder';

export default function CreateNegocio() {
  const router = useRouter();
  const id = router.query.id;
  const toast = useToast();
  const divRef = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState([]);
  const [loadingGeral, setLoadingGeral] = useState(true);
  const [loading, setLoading] = useState(false);
  const [nBusiness, setnBusiness] = useState('');
  const [Approach, setApproach] = useState('');
  const [Budget, setBudget] = useState('');
  const [Status, setStatus] = useState('');
  const [Deadline, setDeadline] = useState('');
  const [DataRetorno, setDataRetorno] = useState('');
  const [Historia, setHistoria] = useState([]);
  const [ChatHistory, setChatHistory] = useState([]);
  const [Etapa, setEtapa] = useState<any | null>();
  const [Mperca, setMperca] = useState<any | null>();

  useEffect(() => {
    const div = divRef.current;
    if (div) {
      setTimeout(() => {
        div.scrollTop = div.scrollHeight;
      }, 0);
    }
  }, [divRef, msg]);

  // recuperar infos do cliente
  useEffect(() => {
    (async () => {
      const url = '/api/db/business/get/id/' + id;
      console.log(url);
      //cunsulta informações gerais do cliente
      await axios({
        method: 'GET',
        url: url,
      })
        .then((res) => {
          setnBusiness(res.data.attributes.nBusiness);
          setApproach(res.data.attributes.Approach);
          setBudget(res.data.attributes.Budget);
          setStatus(res.data.attributes.statusAnd);
          setDeadline(res.data.attributes.deadline);
          setDataRetorno(res.data.attributes.DataRetorno);
          setHistoria(res.data.attributes.history);
          setChatHistory(res.data.attributes.incidentRecord);
          setEtapa(res.data.attributes.etapa);
          setMperca(res.data.attributes.Mperca);
          // fim do loading
          setLoadingGeral(false);
        })
        .catch((err) => {
          console.log(err);
          toast({
            title: 'Ops',
            description: 'erro ao recuperar as informações',
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
    if (msg) {
      (async () => {
        setLoading(true);
        const url = '/api/db/business/get/id/' + id;
        console.log(url);
        //cunsulta informações gerais do cliente
        await axios({
          method: 'GET',
          url: url,
        })
          .then((res) => {
            // console.log(res.data.attributes);
            setChatHistory(res.data.attributes.incidentRecord);
            // fim do loading
            setLoading(false);
          })
          .catch((err) => {
            console.log(err);
            toast({
              title: 'Ops',
              description: 'erro ao recuperar as informações',
              status: 'error',
              duration: 9000,
              isClosable: true,
            });
            // fim do loading
            setLoading(false);
          });
      })();
    }
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
        <Box bg={'gray.200'} w="full" h="20%" p={5}>
          <NegocioHeader
            nBusiness={nBusiness}
            Approach={Approach}
            Budget={Budget}
            Status={Status}
            Deadline={Deadline}
            historia={Historia}
            DataRetorno={DataRetorno}
            Mperca={Mperca}
            etapa={Etapa}
          />
        </Box>
        <Box bg="#edeae6" w="full" h="70%" ref={divRef} overflowY={'auto'}>
          <BodyChat conteudo={ChatHistory} loading={loading} />
        </Box>
        <Box w="full" h="10%">
          <NegocioFooter data={ChatHistory} onGetValue={getMsg} />
        </Box>
      </Box>
    </>
  );
}
