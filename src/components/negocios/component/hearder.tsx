import {
  Box,
  Button,
  Center,
  Flex,
  FormLabel,
  Input,
  Select,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SetStateAction, useEffect, useState } from "react";
import { SelecAtendimento } from "../../elements/lista/atendimento";
import { BtnStatus } from "../../elements/lista/status";
import { StatusPerca } from "@/components/data/perca";
import { EtapasNegocio } from "@/components/data/etapa";
import { BtmRetorno } from "@/components/elements/btmRetorno";
import Loading from "@/components/elements/loading";

export const NegocioHeader = (props: {
  nBusiness: string;
  Approach: string;
  Budget: string;
  Status: any;
  Deadline: string;
  historia?: any;
  DataRetorno?: string;
  etapa?: any;
  Mperca?: any;
  onLoad: any;
  chat: any;
  onchat: any;
}) => {
  const router = useRouter();
  const ID = router.query.id;
  const toast = useToast();
  const { data: session } = useSession();
  const [Status, setStatus] = useState<any>();
  const [StatusG, setStatusG] = useState<any | null>();
  const [Etapa, setEtapa] = useState<any | null>();
  const [Mperca, setMperca] = useState<any | null>();
  const [Busines, setBusines] = useState("");
  const [Approach, setApproach] = useState("");
  const [Budget, setBudget] = useState("");
  const [Deadline, setDeadline] = useState("");
  const [DataRetorno, setDataRetorno] = useState<any>("");


  useEffect(() => {
    setStatusG(props.Status);
    setStatus(props.Status);
    setBudget(props.Budget);
    setDeadline(props.Deadline);
    setBusines(props.nBusiness);
    setApproach(props.Approach);
    setDataRetorno(props.DataRetorno);
    setMperca(props.Mperca)
    setEtapa(props.etapa)
    props.onLoad(false)
  }, [props]);

  const historicomsg = {
    vendedor: session?.user.name,
    date: new Date().toLocaleString(),
    msg: `Vendedor(a) ${session?.user.name}, alterou as informações desse Busines`,
  };

  const ChatConcluido = {
    msg: `Vendedor(a) ${session?.user.name}, concluiu esse Negocio`,
    date: new Date().toISOString(),
    user: "Sistema",
  };

  const history = [...props.historia, historicomsg];

  const Salve = async () => {
    const data1 = {
      data: {
        deadline: Deadline,
        nBusiness: Busines,
        Budget: Budget,
        Approach: Approach,
        history: history,
        etapa: Status === '5' ? 5 : Etapa,
        andamento: Status,
        Mperca: Mperca,
        incidentRecord: [...props.chat, ChatConcluido],
        DataRetorno: Status !== 2 ? null : DataRetorno,
        date_conclucao: new Date(Date.now())
      },
    };

    const data2 = {
      data: {
        deadline: Deadline,
        nBusiness: Busines,
        Budget: Budget,
        Approach: Approach,
        history: history,
        etapa: Status === '5' ? 5 : Etapa,
        andamento: Status,
        Mperca: Mperca,
        DataRetorno: Status !== 2 ? null : DataRetorno,
      },
    };

    const data = StatusG !== 5 && Status === '5' ? data1 : data2;

    await axios({
      url: "/api/db/business/put/id/" + ID,
      method: "PUT",
      data: data,
    })
      .then((res) => {
        props.onchat(true);
        toast({
          title: "Atualização feita",
          description: "Atualização das informações foi efetuada com sucesso",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      })
      .catch((err) => {
        props.onchat(true);
        console.error(err);
      });
  };

  function getStatus(statusinf: SetStateAction<any>) {
    setStatus(statusinf);
  }
  function getAtendimento(atendimento: SetStateAction<string>) {
    setApproach(atendimento);
  }

  return (
    <>
      <Flex>
        <Flex gap={8} w={"85%"} flexWrap={"wrap"}>
          <Flex alignItems={"center"}>
            <BtmRetorno Url="/negocios" />
          </Flex>
          <Box>
            <FormLabel
              htmlFor="cidade"
              fontSize="xs"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: "gray.50",
              }}
            >
              N° Negócio
            </FormLabel>
            <Input
              shadow="sm"
              fontSize="xs"
              rounded="md"
              border={'1px solid #6666'}
              onChange={(e) => setBusines(e.target.value)}
              value={props.nBusiness}
            />
          </Box>
          <Box>
            <SelecAtendimento
              Resp={props.Approach}
              onAddResp={getAtendimento}
            />
          </Box>
          <Box>
            <FormLabel
              htmlFor="cidade"
              fontSize="xs"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: "gray.50",
              }}
            >
              Orçamento estimado
            </FormLabel>
            <Input
              shadow="sm"
              size="sm"
              w="full"
              fontSize="xs"
              rounded="md"
              border={'1px solid #6666'}
              onChange={(e) => setBudget(e.target.value)}
              value={Budget.toLocaleString()}
            />
          </Box>
          <Box>
            <FormLabel
              htmlFor="cidade"
              fontSize="xs"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: "gray.50",
              }}
            >
              Prazo de Entrega
            </FormLabel>
            <Input
              shadow="sm"
              size="sm"
              w="full"
              type={"date"}
              fontSize="xs"
              rounded="md"
              border={'1px solid #6666'}
              onChange={(e) => setDeadline(e.target.value)}
              value={Deadline}
            />
          </Box>
          <Box>
            <FormLabel
              htmlFor="cidade"
              fontSize="xs"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: "gray.50",
              }}
            >
              Etapa do Negócio
            </FormLabel>
            <Select
              shadow="sm"
              size="sm"
              w="full"
              fontSize="xs"
              rounded="md"
              placeholder=" "
              border={'1px solid #6666'}
              onChange={(e) => setEtapa(e.target.value)}
              value={Etapa}
            >
              {EtapasNegocio.map((i: any) => (
                <option key={i.id} value={i.id}>
                  {i.title}
                </option>
              ))}
            </Select>
          </Box>
          <Box>
            <BtnStatus Resp={props.Status} onAddResp={getStatus} />
          </Box>
          {Status !== "1" ? null : (
            <>
              <Box>
                <FormLabel
                  htmlFor="cidade"
                  fontSize="xs"
                  fontWeight="md"
                  color="gray.700"
                  _dark={{
                    color: "gray.50",
                  }}
                >
                  Motivo de Perda
                </FormLabel>
                <Select
                  shadow="sm"
                  size="sm"
                  w="full"
                  fontSize="xs"
                  rounded="md"
                  placeholder=" "
                  border={'1px solid #6666'}
                  onChange={(e) => setMperca(e.target.value)}
                  value={Mperca}
                >
                  {StatusPerca.map((i: any) => (
                    <option key={i.id} value={i.id}>
                      {i.title}
                    </option>
                  ))}
                </Select>
              </Box>
            </>
          )}
          {Status !== "2" ? null : (
            <>
              <Box>
                <FormLabel
                  htmlFor="cidade"
                  fontSize="xs"
                  fontWeight="md"
                  color="gray.700"
                  _dark={{
                    color: "gray.50",
                  }}
                >
                  Data de retorno
                </FormLabel>
                <Input
                  shadow="sm"
                  size="sm"
                  w="full"
                  type={"date"}
                  fontSize="xs"
                  rounded="md"
                  border={'1px solid #6666'}
                  onChange={(e) => setDataRetorno(e.target.value)}
                  value={DataRetorno}
                />
              </Box>
            </>
          )}
        </Flex>
        <Flex alignItems={"center"} flexWrap={'wrap'} gap={3} w={"20%"}>
          <Button colorScheme={"whatsapp"} onClick={Salve}>
            Salvar
          </Button>
          <Button
            colorScheme={"green"}
            onClick={() => router.push("/propostas/" + ID)}
          >
            Propostas
          </Button>
          <Button
            colorScheme={"red"}
            onClick={async () => {
              props.onLoad(true)
              await axios('/api/db/business/delete/' + ID)
                .then(() => {
                  toast({
                    title: 'Negocio foi Deletado',
                    status: 'info',
                    duration: 3000,
                    isClosable: true,
                  });
                  router.push("/negocios")
                })
                .catch((err: any) => {
                  console.error(err);
                });
            }}
          >
            Excluir
          </Button>
        </Flex>
      </Flex>
    </>
  );
};
