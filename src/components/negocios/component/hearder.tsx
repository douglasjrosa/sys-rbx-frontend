import {
  Box,
  Button,
  Flex,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SetStateAction, useEffect, useState } from "react";
import { FaMoneyBillWave } from "react-icons/fa";
import { StatusIcons } from "./StatusIcons";
import { StatusPerca } from "@/components/data/perca";
import { EtapasNegocio } from "@/components/data/etapa";
import { BtmRetorno } from "@/components/elements/btmRetorno";
import { SetValue } from "@/function/currenteValor";
import { formatBudgetDisplay } from "@/utils/customNumberFormats";
import formatarDataParaSaoPaulo from "@/function/formatHora";
import SendOrderModal from "./sendOrderModal";
import { EtapaFunnel } from "./EtapaFunnel";
import Link from "next/link";

const FIELD_WIDTH = "100%";
const INPUT_SIZE = "md";
const LABEL_FONT_SIZE = "sm";
const ACTION_WIDTH = "90%";

export const NegocioHeader = (props: {
  nBusiness: string;
  Approach: string;
  Budget: string;
  title: string;
  Status: any;
  Deadline: string;
  historia?: any;
  DataRetorno?: string;
  etapa?: any;
  Mperca?: any;
  onLoad: any;
  chat: any;
  onchat: any;
  onData: any;
  compact?: boolean;
  mobileChatButton?: React.ReactNode;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const ID = router.query.id;
  const toast = useToast();
  const { data: session } = useSession();
  const [Status, setStatus] = useState<any>("");
  const [Etapa, setEtapa] = useState<any>("");
  const [Mperca, setMperca] = useState<any>("");
  const [Busines, setBusines] = useState("");
  const [Approach, setApproach] = useState("");
  const [Budget, setBudget] = useState<any>("");
  const [Deadline, setDeadline] = useState("");
  const [Bpedido, setBpedido] = useState("");
  const [DataRetorno, setDataRetorno] = useState<any>("");
  const [propostaId, setPropostaId] = useState("");
  const [DataItens, setDataItens] = useState<any | null>();
  const [Blocksave, setBlocksave] = useState<boolean>(false);

  const [pedido, setPedido] = useState<any>({ attributes: {} });
  const [orderData, setOrderData] = useState<any | null>();

  useEffect(() => {
    if (props.onData) {
      const statusNum = parseInt(String(props.Status), 10);
      const etapaNum = parseInt(String(props.etapa), 10);
      setStatus(Number.isNaN(statusNum) ? 3 : statusNum);
      setBudget(SetValue(props.Budget));
      setDeadline(props.Deadline);
      setBusines(props.nBusiness);
      setApproach(props.Approach);
      setDataRetorno(
        !props.DataRetorno ? new Date().toISOString() : props.DataRetorno,
      );
      setMperca(props.Mperca);
      setEtapa(Number.isNaN(etapaNum) ? 2 : etapaNum);
      props.onLoad(false);
      setPedido(props.onData.attributes.pedidos?.data?.[0]);
      setBpedido(props.onData.attributes.Bpedido);
      setPropostaId(props.onData.attributes.pedidos?.data?.[0]?.id);
      setDataItens(
        props.onData.attributes.pedidos?.data?.[0]?.attributes.itens,
      );

      if (
        (props.nBusiness && etapaNum === 6) ||
        (statusNum === 1 && etapaNum === 6)
      )
        setBlocksave(true);
      if (session?.user.pemission === "Adm") setBlocksave(false);

      setOrderData({
        propostaId: props.onData.attributes.pedidos?.data?.[0]?.id,
        orderValue:
          props.onData.attributes.pedidos?.data?.[0]?.attributes?.totalGeral,
        vendedor: String(session?.user.name),
        vendedorId: String(session?.user.id),
        businessId: props.onData.id,
      });
    }
  }, [props, session]);
  const DataAtual = formatarDataParaSaoPaulo(new Date(Date.now()));

  const historicomsg = {
    vendedor: session?.user.name,
    date: DataAtual.toLocaleString(),
    msg: `Vendedor(a) ${session?.user.name}, alterou as informações desse Busines`,
  };

  const filtro = StatusPerca.filter((e: any) => e.id == Mperca).map(
    (i: any) => i.title,
  );

  const ChatConcluido = {
    msg:
      Status === 5
        ? `Parabéns, você concluiu esse Negocio com sucesso`
        : `Negocio perdido, motivo: ${filtro}`,
    date: DataAtual,
    user: "Sistema",
    susseso: Status === 5 ? "green" : Status === 1 ? "red" : "",
    flag: Status === 5 ? "Ganho" : "Perca",
  };

  const history = [...props.historia, historicomsg];

  const Salve = async () => {
    if (Status === 1 && !Mperca) {
      toast({
        title: "Motivo da Perda obrigatório",
        description: "Ao marcar o negócio como Perdido, é obrigatório informar o motivo",
        status: "warning",
        duration: 9000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }
    if (Etapa === 6 && Status == 3) {
      toast({
        title: "Esse Negócio não pode ser finalizado",
        description: "Ao concluir um Negócio, é obrigatório definir um status",
        status: "warning",
        duration: 9000,
        isClosable: true,
        position: "top-right",
      });
    } else if (
      !propostaId &&
      Etapa === 6 &&
      Status === 5 &&
      !DataItens?.length
    ) {
      toast({
        title: "Esse Negócio não pode ser finalizado",
        description:
          "para finalizar um negócio, a proposta deve ser gerada e autorizada",
        status: "warning",
        duration: 9000,
        isClosable: true,
        position: "top-right",
      });
    } else {
      const mpercaValue =
        Mperca !== "" && Mperca != null && !Number.isNaN(Number(Mperca))
          ? Number(Mperca)
          : null;

      const data1 = {
        data: {
          deadline: Deadline,
          nBusiness: Busines,
          Budget: SetValue(Budget),
          Approach: Approach,
          history: history,
          etapa: Etapa,
          andamento: Status,
          Mperca: mpercaValue,
          incidentRecord: [...props.chat, ChatConcluido],
          DataRetorno: DataRetorno,
          date_conclucao: DataAtual,
        },
      };

      const data2 = {
        data: {
          deadline: Deadline,
          nBusiness: Busines,
          Budget: SetValue(Budget),
          Approach: Approach,
          history: history,
          etapa: Etapa,
          andamento: Status,
          Mperca: mpercaValue,
          DataRetorno: DataRetorno,
        },
      };

      const data = Etapa === 6 ? data1 : data2;

      await axios({
        url: "/api/db/business/put/id/" + ID,
        method: "PUT",
        data: data,
      })
        .then((res) => {
          if (propostaId && Etapa === 6 && Status === 5) {
            onOpen();
            setBlocksave(true);
          } else if (Etapa === 6 && Status === 1) {
            toast({
              title: "Atualização feita",
              description: "Infelizmente esse negocio foi perdido",
              status: "error",
              duration: 9000,
              isClosable: true,
            });
            props.onchat(true);
            setBlocksave(true);
          } else {
            toast({
              title: "Atualização feita",
              description:
                "Atualização das informações foi efetuada com sucesso",
              status: "info",
              duration: 9000,
              isClosable: true,
            });
            props.onchat(true);
          }
        })
        .catch((err) => {
          props.onchat(true);
          console.error(err);
        });
    }
  };

  const masckValor = (e: any) => {
    const valor = e.target.value.replace(".", "").replace(",", "");
    const valorformat = SetValue(valor);
    if (valor.length > 15) {
      setBudget(valorformat.slice(-15));
    } else {
      setBudget(valorformat);
    }
  };

  function getStatus(statusinf: SetStateAction<any>) {
    setStatus(parseInt(statusinf));
  }

  const dataRetornoForInput = DataRetorno
    ? new Date(DataRetorno).toISOString().slice(0, 10)
    : ""

  const FieldBox = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Box w={FIELD_WIDTH} textAlign="center">
      <FormLabel fontSize={LABEL_FONT_SIZE} fontWeight="md" textAlign="center" w="full">
        {label}
      </FormLabel>
      <Box w="full" display="flex" justifyContent="center">
        {children}
      </Box>
    </Box>
  )

  if (props.compact) {
    return (
      <>
        <Flex flexDirection="column" w="full" flex={{ base: "unset", lg: 1 }} minH={0}>
          <Flex
            alignItems="center"
            justifyContent={{ base: "space-between", lg: "center" }}
            mb={4}
            gap={2}
            pt="5px"
            pb="30px"
          >
            <Heading size="md" textAlign={{ base: "left", lg: "center" }} flex={1}>
              {props.title}
            </Heading>
            {props.mobileChatButton}
          </Flex>
          <Box
            display="flex"
            flexWrap="wrap"
            gap={3}
            mb={6}
            justifyContent="center"
          >
            {Etapa !== 6 && (
              <Link href={`/negocios/proposta/${ID}`}>
                <Button colorScheme="green" size="sm" minW="110px" h="36px" w="full">
                  Proposta
                </Button>
              </Link>
            )}
            {propostaId && (
              <Button
                colorScheme="teal"
                variant="solid"
                size="sm"
                minW="110px"
                h="36px"
                onClick={() => window.open(`/api/db/proposta/pdf/${propostaId}`, "_blank")}
              >
                PDF
              </Button>
            )}
            {session?.user.pemission === "Adm" && Etapa === 6 && Status === 5 && (
              <Button
                isDisabled={!propostaId}
                colorScheme="linkedin"
                size="sm"
                minW="110px"
                h="36px"
                onClick={() => onOpen()}
              >
                Reenviar Pedido
              </Button>
            )}
            {(Etapa !== 6 || session?.user.pemission === "Adm") && (
              <Button
                colorScheme="red"
                size="sm"
                minW="110px"
                h="36px"
                onClick={async () => {
                  props.onLoad(true)
                  await axios("/api/db/business/delete/" + ID)
                    .then(() => {
                      toast({
                        title: "Negocio foi Deletado",
                        status: "info",
                        duration: 3000,
                        isClosable: true,
                      })
                      router.push("/negocios")
                    })
                    .catch((err: any) => console.error(err))
                }}
              >
                Excluir
              </Button>
            )}
          </Box>
          <VStack flex={{ base: "unset", lg: 1 }} spacing={8} align="stretch" w="full" overflowY={{ base: "visible", lg: "auto" }} minH={0} pb="35px">
          {Bpedido && Etapa === 6 ? null : (
            <>
              <FieldBox label="Data de Retorno">
                <Input
                  maxW="200px"
                  shadow="sm"
                  size={INPUT_SIZE}
                  w="full"
                  pl="24px"
                  pr="6px"
                  type="date"
                  fontSize={LABEL_FONT_SIZE}
                  rounded="md"
                  bg="gray.800"
                  border="none"
                  textAlign="center"
                  placeholder="DD/MM/AAAA"
                  onChange={(e) => setDataRetorno(e.target.value)}
                  value={dataRetornoForInput}
                  sx={{
                    "&::-webkit-calendar-picker-indicator": {
                      filter: "invert(1)",
                      opacity: 0.9,
                      cursor: "pointer",
                      width: "16px",
                      height: "16px",
                    },
                  }}
                />
              </FieldBox>
              <FieldBox label="Orçamento Estimado">
                <InputGroup w={FIELD_WIDTH} maxW="200px" size={INPUT_SIZE}>
                  <InputLeftElement pointerEvents="none" w="36px"><Box w="36px" /></InputLeftElement>
                  <Input
                    shadow="sm"
                    size={INPUT_SIZE}
                    w="full"
                    pl="36px"
                    pr="36px"
                    fontSize={LABEL_FONT_SIZE}
                    rounded="md"
                    bg="gray.800"
                    border="none"
                    textAlign="center"
                    placeholder="0,00"
                    onChange={masckValor}
                    value={formatBudgetDisplay(Budget)}
                  />
                  <InputRightElement pointerEvents="none" w="36px">
                    <FaMoneyBillWave color="green" size={16} />
                  </InputRightElement>
                </InputGroup>
              </FieldBox>
              <FieldBox label="Etapa do Negócio">
                <Box w={FIELD_WIDTH} maxW="280px" display="flex" justifyContent="center">
                  <EtapaFunnel
                    value={Etapa}
                    onChange={(etapa) => {
                      setEtapa(etapa);
                      if (etapa !== 6) {
                        setStatus(3);
                        setMperca("");
                      }
                    }}
                  />
                </Box>
              </FieldBox>
              {Etapa === 6 && (
                <Box w={FIELD_WIDTH} textAlign="center">
                  <FormLabel fontSize={LABEL_FONT_SIZE} fontWeight="md" textAlign="center" w="full">
                    Status
                  </FormLabel>
                  <Box w="full" display="flex" justifyContent="center" mt={1}>
                    <StatusIcons
                      value={Status}
                      onChange={(status) => {
                        getStatus(status);
                        if (status === 5) setMperca("");
                      }}
                      omPedidos={pedido ? [pedido] : []}
                    />
                  </Box>
                </Box>
              )}
              <Box hidden={Status != 1} w={ACTION_WIDTH} alignSelf="center">
                <FieldBox label="Motivo da Perda">
                  <Select
                    shadow="sm"
                    size={INPUT_SIZE}
                    w="full"
                    fontSize={LABEL_FONT_SIZE}
                    rounded="md"
                    bg="gray.800"
                    color="white"
                    border="none"
                    textAlign="center"
                    placeholder="Selecione"
                    onChange={(e) => setMperca(e.target.value)}
                    value={Mperca ?? ""}
                    sx={{
                      "& option": { backgroundColor: "#1A202C", color: "white" },
                    }}
                  >
                    {StatusPerca.map((i: any) => (
                      <option key={i.id} value={i.id}>
                        {i.title}
                      </option>
                    ))}
                  </Select>
                </FieldBox>
              </Box>
            </>
          )}
          {Blocksave ? null : (
            <Box pt={4} display="flex" justifyContent="center" w={ACTION_WIDTH} alignSelf="center">
              <Button colorScheme="whatsapp" onClick={Salve} size="sm" w="full" h="36px">
                Salvar
              </Button>
            </Box>
          )}
          </VStack>
        </Flex>
        {orderData && (
          <SendOrderModal
            isOpen={isOpen}
            onClose={onClose}
            onchat={props.onchat}
            orderData={orderData}
          />
        )}
      </>
    )
  }

  return (
    <>
      <Flex>
        <Flex gap={8} w="85%" flexWrap="wrap">
          <Flex alignItems="center">
            <BtmRetorno Url="/negocios" />
          </Flex>
          <Flex alignItems="center">
            <Heading size="xs">{props.title}</Heading>
          </Flex>
          {Bpedido && Etapa === 6 ? null : (
            <>
              <Box>
                <FormLabel fontSize="xs" fontWeight="md">Data de retorno</FormLabel>
                <Input
                  shadow="sm"
                  size="sm"
                  w="full"
                  type="date"
                  fontSize="xs"
                  rounded="md"
                  onChange={(e) => setDataRetorno(e.target.value)}
                  value={dataRetornoForInput}
                />
              </Box>
              <Box>
                <FormLabel fontSize="xs" fontWeight="md">Orçamento estimado</FormLabel>
                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none" pl={2}>
                    <FaMoneyBillWave color="green" size={14} />
                  </InputLeftElement>
                  <Input
                    shadow="sm"
                    pl={8}
                    w="full"
                    fontSize="xs"
                    rounded="md"
                    textAlign="center"
                    onChange={masckValor}
                    value={formatBudgetDisplay(Budget)}
                  />
                </InputGroup>
              </Box>
              <Box>
                <FormLabel fontSize="xs" fontWeight="md">Etapa do Negócio</FormLabel>
                <EtapaFunnel
                  value={Etapa}
                  onChange={(etapa) => {
                    setEtapa(etapa);
                    if (etapa !== 6) {
                      setStatus(3);
                      setMperca("");
                    }
                  }}
                />
              </Box>
              {Etapa === 6 && (
                <Box>
                  <FormLabel fontSize="xs" fontWeight="md">Status</FormLabel>
                  <StatusIcons
                  value={Status}
                  onChange={(s) => {
                    getStatus(s);
                    if (s === 5) setMperca("");
                  }}
                  omPedidos={pedido ? [pedido] : []}
                />
                </Box>
              )}
              <Box hidden={Status == 1 ? false : true}>
                <FormLabel fontSize="xs" fontWeight="md">Motivo da Perda</FormLabel>
                <Select
                  shadow="sm"
                  size="sm"
                  w="full"
                  fontSize="xs"
                  rounded="md"
                  bg="gray.800"
                  color="white"
                  placeholder="Selecione"
                  onChange={(e) => setMperca(e.target.value)}
                  value={Mperca ?? ""}
                  sx={{
                    "& option": { backgroundColor: "#1A202C", color: "white" },
                  }}
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
        </Flex>
        <Flex alignItems="center" flexWrap="wrap" gap={3} w="25%">
          {Blocksave ? null : (
            <Button colorScheme="whatsapp" onClick={Salve}>Salvar</Button>
          )}
          {Etapa !== 6 && (
            <Link href={`/negocios/proposta/${ID}`}>
              <Button colorScheme="green">Proposta</Button>
            </Link>
          )}
          {propostaId && (
            <Button colorScheme="teal" variant="solid" onClick={() => window.open(`/api/db/proposta/pdf/${propostaId}`, "_blank")}>
              PDF
            </Button>
          )}
          {session?.user.pemission === "Adm" && Etapa === 6 && Status === 5 && (
            <Button isDisabled={!propostaId} colorScheme="linkedin" onClick={() => onOpen()}>
              Reenviar Pedido
            </Button>
          )}
          {(Etapa !== 6 || session?.user.pemission === "Adm") && (
            <Button
              colorScheme="red"
              onClick={async () => {
                props.onLoad(true)
                await axios("/api/db/business/delete/" + ID)
                  .then(() => {
                    toast({ title: "Negocio foi Deletado", status: "info", duration: 3000, isClosable: true })
                    router.push("/negocios")
                  })
                  .catch((err: any) => console.error(err))
              }}
            >
              Excluir
            </Button>
          )}
        </Flex>
        {orderData && (
          <SendOrderModal isOpen={isOpen} onClose={onClose} onchat={props.onchat} orderData={orderData} />
        )}
      </Flex>
    </>
  )
};
