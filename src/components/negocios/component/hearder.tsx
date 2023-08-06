import {
  Box,
  Button,
  Flex,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SetStateAction, useEffect, useState } from "react";
import { BtnStatus } from "../../elements/lista/status";
import { StatusPerca } from "@/components/data/perca";
import { EtapasNegocio } from "@/components/data/etapa";
import { BtmRetorno } from "@/components/elements/btmRetorno";
import { SetValue } from "@/function/currenteValor";
import { pedido } from "@/function/setpedido";
import { BeatLoader } from "react-spinners";
import formatarDataParaSaoPaulo from "@/function/formatHora";

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
  onData: any;
}) => {
  const router = useRouter();
  const ID = router.query.id;
  const toast = useToast();
  const { data: session } = useSession();
  const [Status, setStatus] = useState<any>();
  const [Etapa, setEtapa] = useState<any>();
  const [Mperca, setMperca] = useState<any>();
  const [Busines, setBusines] = useState("");
  const [Approach, setApproach] = useState("");
  const [Budget, setBudget] = useState<any>();
  const [Deadline, setDeadline] = useState("");
  const [NPedido, setNPedido] = useState("");
  const [Bpedido, setBpedido] = useState("");
  const [DataRetorno, setDataRetorno] = useState<any>();
  const [Data, setData] = useState<any | null>();
  const [DataItens, setDataItens] = useState<any | null>();
  const [load, setload] = useState<boolean>(false);
  const [Blocksave, setBlocksave] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    if (props.onData) {
      setData(props.onData)
      setStatus(parseInt(props.Status));
      setBudget(SetValue(props.Budget));
      setDeadline(props.Deadline);
      setBusines(props.nBusiness);
      setApproach(props.Approach);
      setDataRetorno(!props.DataRetorno ? new Date().toISOString() : props.DataRetorno);
      setMperca(props.Mperca)
      setEtapa(parseInt(props.etapa))
      props.onLoad(false)
      const [pedidos] = props.onData.attributes.pedidos.data
      const nPedido = pedidos?.attributes.nPedido
      setNPedido(nPedido)
      setBpedido(props.onData.attributes.Bpedido)
      const ITENS = pedidos?.attributes
      setDataItens(ITENS?.itens)
      setBlocksave(props.nBusiness && parseInt(props.etapa) === 6 || parseInt(props.Status) === 1 && parseInt(props.etapa) === 6 ? true : false)
    }
  }, [props]);
  const DataAtual = formatarDataParaSaoPaulo(new Date(Date.now()))

  const historicomsg = {
    vendedor: session?.user.name,
    date: DataAtual.toLocaleString(),
    msg: `Vendedor(a) ${session?.user.name}, alterou as informações desse Busines`,
  };

  const filtro = StatusPerca.filter((e: any) => e.id == Mperca).map((i: any) => i.title)

  const ChatConcluido = {
    msg: Status === 5 ? `Parabéns, você concluiu esse Negocio com sucesso` : `Negocio perdido, motivo: ${filtro}`,
    date: DataAtual,
    user: "Sistema",
    susseso: Status === 5 ? 'green' : Status === 1 ? 'red' : '',
    flag: Status === 5 ? "Ganho" : 'Perca'
  };

  const history = [...props.historia, historicomsg];

  const Salve = async () => {

    if (Etapa === 6 && Status == 3) {
      toast({
        title: "Esse Negócio não pode ser finalizado",
        description: "Ao concluir um Negócio, é obrigatório definir um status",
        status: "warning",
        duration: 9000,
        isClosable: true,
        position: 'top-right'
      });
    } else if (!NPedido && Etapa === 6 && Status === 5 && DataItens.length < 0) {
      toast({
        title: "Esse Negócio não pode ser finalizado",
        description: "para finalizar um negócio, a proposta deve ser gerada e autorizada",
        status: "warning",
        duration: 9000,
        isClosable: true,
        position: 'top-right'
      });
    } else {
      const data1 = {
        data: {
          deadline: Deadline,
          nBusiness: Busines,
          Budget: SetValue(Budget),
          Approach: Approach,
          history: history,
          etapa: Etapa,
          andamento: Status,
          Mperca: Mperca,
          incidentRecord: [...props.chat, ChatConcluido],
          DataRetorno: DataRetorno,
          date_conclucao: DataAtual
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
          Mperca: Mperca,
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
          if (NPedido && Etapa === 6 && Status === 5) {
            onOpen()
            setBlocksave(true)
          } else if (Etapa === 6 && Status === 1) {
            toast({
              title: "Atualização feita",
              description: "Infelizmente esse negocio foi perdido",
              status: "error",
              duration: 9000,
              isClosable: true,
            });
            props.onchat(true);
            setBlocksave(true)
          } else {
            toast({
              title: "Atualização feita",
              description: "Atualização das informações foi efetuada com sucesso",
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
    const valor = e.target.value.replace('.', '').replace(',', '')
    const valorformat = SetValue(valor);
    console.log(valor.length)
    if (valor.length > 15) {
      setBudget(valorformat.slice(-15))
    } else {
      setBudget(valorformat)
    }
  }

  const finalizar = async () => {
    toast({
      title: "Só um momento estou processando!",
      status: "warning",
      isClosable: true,
      position: 'top-right',
    });
    setload(true)
    const [pedidos] = Data.attributes.pedidos.data
    const nPedido = pedidos?.attributes.nPedido
    const EmpresaId = Data.attributes.empresa.data.id
    const valor = pedidos?.attributes.totalGeral
    const vendedor = session?.user.name
    const vendedorId = session?.user.id
    const IdNegocio = Data.id

    const request = await pedido(nPedido, EmpresaId, valor, vendedor, vendedorId, IdNegocio)
    console.log("🚀 ~ file: hearder.tsx:223 ~ finalizar ~ request:", request)
    setload(false)
    onClose()
    props.onchat(true);
  }

  const Pedido = async () => {
    setload(true)
    toast({
      title: "Só um momento estou processando!",
      status: "warning",
      isClosable: true,
      position: 'top-right',
    });
    if (Data) {
      const [pedidos] = Data.attributes.pedidos.data
      const nPedido = pedidos?.attributes.nPedido
      const EmpresaId = Data.attributes.empresa.data.id
      const valor = pedidos?.attributes.totalGeral
      const vendedor = session?.user.name
      const vendedorId = session?.user.id
      const IdNegocio = Data.id

      await axios({
        url: `/api/db/nLote/${nPedido}`,
        method: "POST",
      })
        .then(() => { })
        .catch((error) => {
          console.log(error)
        });

      await axios({
        url: "/api/query/pedido/" + nPedido,
        method: "POST",
      })
        .then(async (response: any) => {
          console.log(response.data)

          await axios({
            url: `/api/db/trello/${nPedido}`,
            method: "POST",
          })
            .then((response) => {
              console.log(response.data)
            })
            .catch((error) => {
              console.log(error)
            });

          await axios(`/api/db/empresas/EvaleuateSale?id=${EmpresaId}&vendedor=${session?.user.name}&vendedorId=${session?.user.id}&valor=${valor}`)
            .then((response) => {
              console.log(response.data)
            })
            .catch((error) => {
              console.log(error)
            });
          toast({
            title: "Pedido realizado com sucesso!",
            status: "success",
            duration: 5000,
            position: 'top-right',
          });
          onClose()
          const requeste = await axios(`api/db/proposta/get/business/${IdNegocio}`);
          const resp = requeste.data;

          props.onchat(true);
        })
        .catch(async (err) => {

          props.onchat(true);
          console.log(err.response.data.message);
          console.log(err);
          if (err.response.data.message) {
            await axios({
              url: `/api/db/trello/${nPedido}`,
              method: "POST",
            })
              .then((response) => {
                console.log(response.data)
              })
              .catch((error) => {
                console.log(error)
              });

            await axios(`/api/db/empresas/EvaleuateSale?id=${EmpresaId}&vendedor=${session?.user.name}&vendedorId=${session?.user.id}&valor=${valor}`)
              .then((response) => {
                console.log(response.data)
                onClose()
              })
              .catch((error) => {
                console.log(error)
              });
            toast({
              title: "Opss.",
              description: err.response.data.message,
              status: "info",
              duration: 5000,
              position: 'top-right',
              isClosable: true,
            });
          } else {
            props.onchat(true);
            toast({
              title: "Opss.",
              description: "Entre en contata com o suporte",
              status: "error",
              duration: 3000,
              position: 'top-right',
              isClosable: true,
            });
          }
        });
      setload(false)
    }
  }

  function getStatus(statusinf: SetStateAction<any>) {
    setStatus(parseInt(statusinf));
  }
  function getAtendimento(atendimento: SetStateAction<string>) {
    setApproach(atendimento);
  }
  console.log(Blocksave)

  return (
    <>
      <Flex>
        <Flex gap={8} w={"85%"} flexWrap={"wrap"}>
          <Flex alignItems={"center"}>
            <BtmRetorno Url="/negocios" />
          </Flex>
          <Box>
            <FormLabel
              fontSize="xs"
              fontWeight="md"
            >
              N° Negócio
            </FormLabel>
            <Input
              type="text"
              readOnly
              shadow="sm"
              size="sm"
              rounded="md"
              maxLength={15}
              onChange={(e) => setBusines(e.target.value)}
              value={props.nBusiness}
            />
          </Box>
          {Bpedido && Etapa === 6 ? null : (
            <>
              <Box>
                <FormLabel
                  fontSize="xs"
                  fontWeight="md"
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
                  onChange={(e) => setDataRetorno(formatarDataParaSaoPaulo(new Date(e.target.value)))}
                  value={DataRetorno}
                />
              </Box>
              <Box>
                <FormLabel
                  fontSize="xs"
                  fontWeight="md"
                >
                  Orçamento estimado
                </FormLabel>
                <Input
                  shadow="sm"
                  size="sm"
                  w="full"
                  fontSize="xs"
                  rounded="md"

                  onChange={masckValor}
                  value={Budget}
                />
              </Box>
              <Box>
                <FormLabel
                  fontSize="xs"
                  fontWeight="md"
                >
                  Etapa do Negócio
                </FormLabel>
                <Select
                  shadow="sm"
                  size="sm"
                  w="full"
                  fontSize="xs"
                  rounded="md"
                  onChange={(e) => setEtapa(parseInt(e.target.value))}
                  value={Etapa}
                >
                  <option style={{ backgroundColor: "#1A202C" }}></option>
                  {EtapasNegocio.map((i: any) => (
                    <option style={{ backgroundColor: "#1A202C" }} key={i.id} value={i.id}>
                      {i.title}
                    </option>
                  ))}
                </Select>
              </Box>
              {Etapa === 6 && (
                <>
                  <Box>
                    <BtnStatus Resp={props.Status} onAddResp={getStatus} omPedidos={Data.attributes.pedidos.data} />
                  </Box>
                </>
              )}
              <Box hidden={Status == 1 ? false : true}>
                <FormLabel
                  fontSize="xs"
                  fontWeight="md"
                >
                  Motivo de Perda
                </FormLabel>
                <Select
                  shadow="sm"
                  size="sm"
                  w="full"
                  fontSize="xs"
                  rounded="md"
                  onChange={(e) => setMperca(e.target.value)}
                  value={Mperca}
                >
                  <option style={{ backgroundColor: "#1A202C" }}></option>
                  {StatusPerca.map((i: any) => (
                    <option style={{ backgroundColor: "#1A202C" }} key={i.id} value={i.id}>
                      {i.title}
                    </option>
                  ))}
                </Select>
              </Box>
            </>
          )}
        </Flex>

        <Flex alignItems={"center"} flexWrap={'wrap'} gap={3} w={"25%"}>

          {Blocksave ? null : (
            <>
              <Button colorScheme={"whatsapp"} onClick={Salve}>
                Salvar
              </Button>
            </>
          )}
          {Bpedido && Etapa === 6 || Blocksave ? null : (
            <>
              <Button
                colorScheme={"green"}
                onClick={() => {
                  if (NPedido) {
                    router.push("/propostas/update/" + ID)
                  } else {
                    router.push(`/propostas/create/${ID}`);
                  }
                }}
              >
                Proposta
              </Button>

            </>
          )}
          {NPedido && !Bpedido && Status === 5 && Etapa === 6 ? (
            <>
              <Button
                colorScheme={"whatsapp"}
                variant={'solid'}
                onClick={() => {

                  window.open(
                    `/api/db/proposta/pdf/${NPedido}`,
                    "_blank"
                  )
                }}
              >
                PDF
              </Button>

            </>
          ) : null}

          {NPedido && !Bpedido && Status === 3 && Etapa !== 6 ? (
            <>
              <Button
                colorScheme={"teal"}
                variant={'solid'}
                onClick={() => window.open(
                  `/api/db/proposta/pdf/${NPedido}`,
                  "_blank"
                )}
              >
                PDF
              </Button>
            </>
          ) : null}
          {Bpedido && Status === 5 && Etapa === 6 ? (
            <>
              <Button
                colorScheme={"teal"}
                variant={'solid'}
                onClick={() => window.open(
                  `/api/db/proposta/pdf/${NPedido}`,
                  "_blank"
                )}
              >
                PDF
              </Button>
            </>
          ) : null}
          {NPedido && Status === 1 && Etapa === 6 ? (
            <>

              <Button variant={'outline'} colorScheme={"whatsapp"} onClick={Salve}>
                Atualizar
              </Button>

              <Button
                colorScheme={"red"}
                variant={'outline'}
                onClick={() => window.open(
                  `/api/db/proposta/pdf/${NPedido}`,
                  "_blank"
                )}
              >
                PDF
              </Button>

            </>
          ) : null}
          {session?.user.pemission === 'Adm' && (
            <>
              <Button isDisabled={!NPedido} colorScheme={"linkedin"} onClick={() => onOpen()}>
                Reenviar Pedido
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
            </>
          )}
        </Flex>
        <Modal isCentered closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
          <ModalOverlay
            bg='blackAlpha.300'
            backdropFilter='blur(10px) hue-rotate(90deg)'
          />
          <ModalContent bg={'gray.600'}>
            <ModalHeader>Negócio Concluido</ModalHeader>
            {/* <ModalCloseButton /> */}
            <ModalBody>
              <Text>Para finalizar é necessário gerar um pedido para produção!</Text>
            </ModalBody>
            <ModalFooter>
              <Button
                fontSize={'0.8rem'}
                p={3}
                colorScheme={"messenger"}
                // onClick={Pedido}
                onClick={finalizar}
              >
                Gerar Pedido
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Flex >
    </>
  );
};
