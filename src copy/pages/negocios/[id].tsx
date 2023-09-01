/* eslint-disable react-hooks/exhaustive-deps */
import { Box, Flex, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import Loading from "../../components/elements/loading";
import { BodyChat } from "../../components/negocios/component/bodychat";
import { NegocioFooter } from "../../components/negocios/component/footer";
import { NegocioHeader } from "../../components/negocios/component/hearder";

export default function CreateNegocio() {
  const router = useRouter();
  const id: any = router.query.id;
  const toast = useToast();
  const divRef = useRef<HTMLDivElement>(null);
  const [msg, setMsg] = useState([]);
  const [msg2, setMsg2] = useState(false);
  const [loadingGeral, setLoadingGeral] = useState(true);
  const [loading, setLoading] = useState(false);
  const [nBusiness, setnBusiness] = useState("");
  const [Approach, setApproach] = useState("");
  const [Budget, setBudget] = useState("");
  const [Status, setStatus] = useState("");
  const [Deadline, setDeadline] = useState("");
  const [DataRetorno, setDataRetorno] = useState("");
  const [Nome, setNome] = useState("");
  const [Historia, setHistoria] = useState([]);
  const [ChatHistory, setChatHistory] = useState([]);
  const [Etapa, setEtapa] = useState<any | null>();
  const [Mperca, setMperca] = useState<any | null>();
  const [Data, setData] = useState<any | null>();

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
      localStorage.setItem('id', id)
      const url = "/api/db/business/get/id/" + id;
      console.log(url);
      //cunsulta informações gerais do cliente
      await axios({
        method: "GET",
        url: url,
      })
        .then((res) => {
          // console.log(res.data)
          setData(res.data)
          setnBusiness(res.data.attributes.nBusiness);
          setApproach(res.data.attributes.Approach);
          setBudget(res.data.attributes.Budget);
          setStatus(res.data.attributes.andamento);
          setDeadline(res.data.attributes.deadline);
          setDataRetorno(res.data.attributes.DataRetorno);
          setHistoria(res.data.attributes.history);
          setChatHistory(res.data.attributes.incidentRecord);
          setEtapa(res.data.attributes.etapa);
          setMperca(res.data.attributes.Mperca);
          setNome(res.data.attributes.empresa.data.attributes.nome);
          // fim do loading
          setLoadingGeral(false);
        })
        .catch((err) => {
          console.log(err);
          toast({
            title: "Ops",
            description: "erro ao recuperar as informações",
            status: "error",
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
        const url = "/api/db/business/get/id/" + id;
        //cunsulta informações gerais do cliente
        await axios({
          method: "GET",
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
              title: "Ops",
              description: "erro ao recuperar as informações",
              status: "error",
              duration: 9000,
              isClosable: true,
            });
            // fim do loading
            setLoading(false);
          });
      })();
    }
  }, [msg]);
  useEffect(() => {
    if (msg2) {
      (async () => {
        setLoading(true);
        const url = "/api/db/business/get/id/" + id;
        //cunsulta informações gerais do cliente
        await axios({
          method: "GET",
          url: url,
        })
          .then((res) => {
            // console.log(res.data.attributes);
            setChatHistory(res.data.attributes.incidentRecord);
            // fim do loading
            setLoading(false);
            setMsg2(false)
          })
          .catch((err) => {
            console.log(err);
            toast({
              title: "Ops",
              description: "erro ao recuperar as informações",
              status: "error",
              duration: 9000,
              isClosable: true,
            });
            // fim do loading
            setLoading(false);
            setMsg2(false)
          });
      })();
    }
  }, [msg2]);

  function getMsg(menssage: React.SetStateAction<any>) {
    setMsg(menssage);
  }
  function chatRelaod(menssage: React.SetStateAction<any>) {
    setLoadingGeral(true);
    setMsg2(menssage);
    (async () => {
      localStorage.setItem('id', id)
      const url = "/api/db/business/get/id/" + id;
      console.log(url);
      //cunsulta informações gerais do cliente
      await axios({
        method: "GET",
        url: url,
      })
        .then((res) => {
          setData(res.data)
          setnBusiness(res.data.attributes.nBusiness);
          setApproach(res.data.attributes.Approach);
          setBudget(res.data.attributes.Budget);
          setStatus(res.data.attributes.andamento);
          setDeadline(res.data.attributes.deadline);
          setDataRetorno(res.data.attributes.DataRetorno);
          setHistoria(res.data.attributes.history);
          setChatHistory(res.data.attributes.incidentRecord);
          setEtapa(res.data.attributes.etapa);
          setMperca(res.data.attributes.Mperca);
          setNome(res.data.attributes.name);
          // fim do loading
          setLoadingGeral(false);
        })
        .catch((err) => {
          console.log(err);
          toast({
            title: "Ops",
            description: "erro ao recuperar as informações",
            status: "error",
            duration: 9000,
            isClosable: true,
          });
          // fim do loading
          setLoadingGeral(false);
        });
    })();
  }
  function getLoad(lading: React.SetStateAction<any>) {
    setLoadingGeral(lading);
  }

  if (loadingGeral) {
    return (
      <Box w={'100%'} h={'100%'}>
        <Loading size="200px">Carregando...</Loading>
      </Box>
    );
  }

  return (
    <>
      <Flex w="100%" h="100vh" flexDirection={'column'} justifyContent={'space-between'} >
        <Box bg={'gray.800'} w="full" p={5} color={'white'}>
          <NegocioHeader
            title={Nome}
            nBusiness={nBusiness}
            Approach={Approach}
            Budget={Budget}
            Status={Status}
            Deadline={Deadline}
            historia={Historia}
            DataRetorno={DataRetorno}
            Mperca={Mperca}
            etapa={Etapa}
            onLoad={getLoad}
            chat={ChatHistory}
            onchat={chatRelaod}
            onData={Data}
          />
        </Box>
        <Box bg={'#292f3a'} w="full" h={'full'} ref={divRef} overflowY={"auto"}>
          <BodyChat conteudo={ChatHistory} loading={loading} />
        </Box>
        <Box bg={'gray.800'} w="full">
          <NegocioFooter data={ChatHistory} onGetValue={getMsg} />
        </Box>
      </Flex>
    </>
  );
}
