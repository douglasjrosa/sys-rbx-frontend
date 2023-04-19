/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
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

export const NegocioHeader = (props: {
  nBusiness: string;
  Approach: string;
  Budget: string;
  Status: number;
  Deadline: string;
  historia?: any;
  DataRetorno?: string;
}) => {
  const router = useRouter();
  const ID = router.query.id;
  const toast = useToast();
  const { data: session } = useSession();
  const [Status, setStatus] = useState<any | null>();
  const [Etapa, setEtapa] = useState<any | null>();
  const [Mperca, setMperca] = useState<any | null>();
  const [Busines, setBusines] = useState("");
  const [Approach, setApproach] = useState("");
  const [Budget, setBudget] = useState("");
  const [Deadline, setDeadline] = useState("");
  const [DataRetorno, setDataRetorno] = useState<any>("");

  useEffect(() => {
    setStatus(props.Status);
    setBudget(props.Budget);
    setDeadline(props.Deadline);
    setBusines(props.nBusiness);
    setApproach(props.Approach);
    setDataRetorno(props.DataRetorno);
  }, []);

  const historicomsg = {
    vendedor: session?.user.name,
    date: new Date().toLocaleString(),
    msg: `Vendedor(a) ${session?.user.name}, alterou as informaçoes desse Busines`,
  };

  const history = [...props.historia, historicomsg];

  const Salve = async () => {
    const data = {
      data: {
        deadline: Deadline,
        nBusiness: Busines,
        Budget: Budget,
        Approach: Approach,
        history: history,
        etapa: Etapa,
        andamento: Status,
        Mperca: Mperca,
        DataRetorno: Status !== 4 ? null : DataRetorno,
      },
    };

    await axios({
      url: "/api/db/business/put/id/" + ID,
      method: "PUT",
      data: data,
    })
      .then((res) => {
        toast({
          title: "Atualização feita",
          description: "Atualização das inforaçoes foi efetuada com sucesso",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      })
      .catch((err) => console.error(err));
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
        <Flex gap={8} w={"60%"} flexWrap={"wrap"}>
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
              N° Negocio
            </FormLabel>
            <Input
              shadow="sm"
              size="sm"
              w="full"
              fontSize="xs"
              rounded="md"
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
              Budget
            </FormLabel>
            <Input
              shadow="sm"
              size="sm"
              w="full"
              fontSize="xs"
              rounded="md"
              onChange={(e) => setBudget(e.target.value)}
              value={props.Budget}
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
              Deadline
            </FormLabel>
            <Input
              shadow="sm"
              size="sm"
              w="full"
              type={"date"}
              fontSize="xs"
              rounded="md"
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
              Etapa do Negocio
            </FormLabel>
            <Select
              shadow="sm"
              size="xs"
              w="full"
              fontSize="xs"
              rounded="md"
              placeholder=" "
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
          {Status !== 6 ? null : (
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
                  size="xs"
                  w="full"
                  fontSize="xs"
                  rounded="md"
                  placeholder=" "
                  onChange={(e)=> setMperca(e.target.value)}
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
          {Status !== 4 ? null : (
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
                  onChange={(e) => setDataRetorno(e.target.value)}
                  value={DataRetorno}
                />
              </Box>
            </>
          )}
        </Flex>
        <Flex alignItems={"center"} justifyContent={"space-around"} w={"34%"}>
          <Button colorScheme={"whatsapp"} onClick={Salve}>
            salve
          </Button>
          <Button
            colorScheme={"green"}
            onClick={() => router.push("/Propostas/" + ID)}
          >
            Propostas
          </Button>
          {/* <Button colorScheme={'messenger'}>Gerar pedido</Button> */}
        </Flex>
      </Flex>
    </>
  );
};
