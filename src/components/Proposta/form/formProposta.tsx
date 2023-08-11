/* eslint-disable react-hooks/exhaustive-deps */
import Loading from "@/components/elements/loading";
import { CompBusiness } from "@/components/Proposta/business";
import { ListaEmpresa } from "@/components/Proposta/ListaEmpresa";
import { CompPrazo } from "@/components/Proposta/prazo";
import { ProdutiList } from "@/components/Proposta/produt";
import { TableConteudo } from "@/components/Proposta/tabela";
import { SetValue } from "@/function/currenteValor";
import { SetValueNumero } from "@/function/currentValorNumber";
import {
  Box,
  Button,
  chakra,
  Flex,
  FormLabel,
  Heading,
  Icon,
  IconButton,
  Input,
  Select,
  Table,
  TableContainer,
  Textarea,
  Th,
  Thead,
  Tr,
  useToast
} from "@chakra-ui/react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SetStateAction, useEffect, useState } from "react";
import { BsArrowLeftCircleFill, BsTrash } from "react-icons/bs";
import { DateIso } from "../../../components/data/Date";
import { ListFornecedor } from "../../../components/data/fornecedor";

const tempo = DateIso;

export const FormProposta = (props: { ondata: any | null; produtos: any; ITENS: any; envio: string }) => {
  const router = useRouter();
  const PEDIDO = router.query.pedido
  const NNegocio = router.query.negocio
  const { data: session } = useSession();
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [loadingGeral, setLoadingGeral] = useState<boolean>(false);
  const [RelatEnpresa, setRelatEmpresa] = useState([]);
  const [RelatEnpresaId, setRelatEmpresaId] = useState("");
  const [Nome, SetNome] = useState('');
  const [ListItens, setItens] = useState<any>([]);
  const [date, setDate] = useState(tempo);
  const [DateEntrega, setDateEntrega] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [frete, setFrete] = useState("");
  const [freteCif, setFreteCif] = useState<any>('0.00');
  const [Loja, setLoja] = useState("");
  const [prazo, setPrazo] = useState("");
  const [tipoprazo, setTipoPrazo] = useState("");
  const [totalGeral, setTotalGeral] = useState<any>("");
  const [Desconto, setDesconto] = useState<any>("");
  const [DescontoAdd, setDescontoAdd] = useState('');
  const [saveNegocio, setSaveNegocio] = useState("");
  const [hirtori, setHistory] = useState([]);
  const [MSG, setMSG] = useState([]);
  const [obs, setObs] = useState("");
  const [Id, setId] = useState("");
  const [clientePedido, setClientePedido] = useState("");
  const [ENVIO, setEMVIO] = useState("");
  const [incidentRecord, setIncidentRecord] = useState([]);
  const toast = useToast();


  if (props.ITENS && ListItens.length === 0) {
    setItens(props.ITENS);
  }
  if (props.envio && !ENVIO) {
    setEMVIO(props.envio);
  }

  useEffect(() => {
    if (props.ondata) {
      const resp = props.ondata
      const [PROPOSTA] = resp.attributes?.pedidos.data
      setId(PROPOSTA?.id);
      setFrete(PROPOSTA?.attributes?.frete);
      setDate(PROPOSTA?.attributes?.dataPedido);
      setPrazo(PROPOSTA?.attributes?.condi);
      setRelatEmpresa(resp.attributes?.empresa.data);
      SetNome(resp.attributes.empresa.data.attributes.nome)
      setRelatEmpresaId(resp.attributes?.empresa.data.id);
      setFreteCif(PROPOSTA?.attributes?.valorFrete);
      setLoja(PROPOSTA?.attributes?.fornecedor);
      setObs(PROPOSTA?.attributes?.obs);
      setSaveNegocio(resp.attributes.nBusiness);
      setHistory(resp.attributes.history);
      setMSG(resp.attributes.incidentRecord)
      setClientePedido(PROPOSTA?.attributes?.cliente_pedido)
      setTipoPrazo(PROPOSTA?.attributes?.prazo)
      setDateEntrega(PROPOSTA?.attributes?.dataEntrega)
      setHistory(resp.attributes.history);
      setCnpj(resp.attributes.empresa.data.attributes.CNPJ)
      setIncidentRecord(resp.attributes.incidentRecord)
      const descontodb = PROPOSTA?.attributes.descontoAdd
      setDescontoAdd(!descontodb ? 0.00 : descontodb.replace(".", "").replace(",", "."))
    }
  }, []);


  const disbleProd = !prazo || !DateEntrega || !Loja || !frete ? false : true;

  const TotalGreal = () => {
    if (ListItens.length === 0) return 0.00;
    const totalItem = ListItens.reduce((acc: number, item: any) => {
      const valorOriginal = Number(item.vFinal.replace(".", "").replace(",", "."))
      const valor: number = valorOriginal;
      const qtd: number = item.Qtd;
      const mont: boolean = item.mont;
      const expo: boolean = item.expo;
      const acrec: number =
        mont && expo ? 1.2 : expo && !mont ? 1.1 : !expo && mont ? 1.1 : 0;
      const somaAcrescimo: number = acrec === 0
        ? 0
        : (valorOriginal * acrec - valorOriginal) * qtd;
      const total1 = valor * qtd + somaAcrescimo;
      const total = Number(total1.toFixed(2))
      const somaTota = acc + total
      const TotoalConvert = Number(somaTota.toFixed(2));
      return TotoalConvert;
    }, 0);
    const ValorAtt = totalItem
    return ValorAtt
  };

  const DescontoGeral = () => {
    if (ListItens.length === 0) return 0.00;
    const descontos = ListItens.map((i: any) => {
      const valor = Number(i.vFinal.replace(".", "").replace(",", "."));
      const ValorGeral =
        Math.round(parseFloat(valor.toFixed(2)) * 100) / 100;
      const descont = ValorGeral * 0.05;
      const descont1 = descont * i.Qtd;
      const somaDescontMin =
        Math.round(parseFloat(descont1.toFixed(2)) * 100) / 100;

      return somaDescontMin;
    });
    const total1 = prazo !== "Antecipado" ? 0.00 : descontos.reduce(
      (acc: number, valorAtual: number) => acc + valorAtual
    );
    const total = total1;
    return total
  };

  useEffect(() => {

    const valorTotal = TotalGreal()
    const ValorDesconto = DescontoGeral()
    const freteValor = SetValueNumero(freteCif)
    const somaDecont = ValorDesconto + parseFloat(DescontoAdd)
    const Soma =  valorTotal - somaDecont

    setTotalGeral(Math.round(Soma * 100) / 100);
    setDesconto(somaDecont);
  }, [DescontoGeral, ListItens, TotalGreal]);

  useEffect(() => {
    setItens(
      ListItens.map((f: any) => {
        const valor = Number(f.vFinal.replace(".", "").replace(",", "."));
        const ValorGeral =
          Math.round(parseFloat(valor.toFixed(2)) * 100) / 100;
        const TotalDesc = ValorGeral;
        f.total = Math.round(parseFloat(TotalDesc.toFixed(2)) * 100) / 100;
        const data = { ...f };
        return data;
      })
    );
  }, [prazo]);


  const SalvarProdutos = async () => {
    setLoadingGeral(true)
    if (!saveNegocio || saveNegocio === "") {
      setLoadingGeral(false)
      toast({
        title: "Esta Faltando informação",
        description:
          "Você deve vincular essa proposta a um n° Business ou negocio",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    } else if (!DateEntrega) {
      setLoadingGeral(false)
      toast({
        title: "Esta Faltando informação",
        description:
          "Você deve preencher a data de entrega",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    } else {
      const Date5 = new Date();
      Date5.setDate(Date5.getDate() + 5);
      const VencDate = `${Date5.getUTCFullYear()}-${Date5.getUTCMonth() + 1 < 10
        ? "0" + (Date5.getUTCMonth() + 1)
        : Date5.getUTCMonth() + 1
        }-${Date5.getUTCDate() < 10 ? "0" + Date5.getUTCDate() : Date5.getUTCDate()
        }`;
      const VencDatePrint = `${Date5.getUTCDate() < 10 ? "0" + Date5.getUTCDate() : Date5.getUTCDate()
        }/${Date5.getUTCMonth() + 1 < 10
          ? "0" + (Date5.getUTCMonth() + 1)
          : Date5.getUTCMonth() + 1
        }/${Date5.getUTCFullYear()}`;

      const id: any = localStorage.getItem("id");

      const ProdutosItems = await ListItens.map((i: any) => {
        const valor2Original = i.vFinal.replace(".", "");
        const ValorProd = Number(valor2Original.replace(",", "."));
        const ValorOriginal =
          Math.round(parseFloat(ValorProd.toFixed(2)) * 100) / 100;
        const acrec =
          i.mont === true && i.expo === true
            ? 1.2
            : i.expo === true && i.mont === false
              ? 1.1
              : i.expo === false && i.mont === true
                ? 1.1
                : 0;
        const somaAcrescimo =
          acrec === 0 ? ValorOriginal * i.Qtd : ValorOriginal * acrec * i.Qtd;
        const TotalItem = somaAcrescimo;
        const result = Math.round(parseFloat(TotalItem.toFixed(2)) * 100) / 100;

        return {
          ...i,
          total: result,
        };
      });

      const totalValor = totalGeral.toLocaleString("pt-br", {
        style: "currency",
        currency: "BRL",
      });

      const data: any = {
        nPedido: router.query.pedido,
        matriz: Loja,
        cliente: cnpj,
        clienteId: RelatEnpresaId,
        itens: ProdutosItems,
        empresa: Loja,
        dataPedido: tempo,
        dataEntrega: new Date(DateEntrega).toISOString(),
        vencPedido: VencDate,
        vencPrint: VencDatePrint,
        condi: prazo,
        prazo: tipoprazo,
        totalGeral: totalValor,
        deconto: Desconto.toLocaleString("pt-br", {
            style: "currency",
            currency: "BRL",
          }),
        vendedor: session?.user.name,
        vendedorId: session?.user.id,
        frete: frete,
        valorFrete: freteCif,
        business: id,
        obs: obs,
        cliente_pedido: clientePedido,
        id: Id,
        hirtori: hirtori,
        incidentRecord: MSG,
        fornecedorId: session?.user.id,
        descontoAdd: DescontoAdd.toString(),
      };
      if (ENVIO === 'POST') {

        const dadosPost = data;
        const url = "/api/db/proposta/post";
        await axios({
          method: "POST",
          url: url,
          data: dadosPost,
        })
          .then(async (res: any) => {
            const date = new Date();
            const DateAtua = date.toISOString();

            const msg = {
              vendedor: session?.user.name,
              date: new Date().toISOString(),
              msg: `Vendedor ${session?.user.name} criou essa proposta `,
            };
            const msg2 = {
              date: DateAtua,
              msg: `Proposta criada com o valor total ${dadosPost.totalGeral} contendo ${dadosPost.itens.length} items`,
              user: "Sistema",
            };

            const record = [...dadosPost.hirtori, msg];
            const record2 = [...dadosPost.incidentRecord, msg2];

            const data = {
              data: {
                history: record,
                incidentRecord: record2,
                Budget: dadosPost.totalGeral
              },
            };

            await axios({
              method: "PUT",
              url: "/api/db/business/put/id/" + NNegocio,
              data: data,
            });

            toast({
              title: "Proposta Criada",
              description: res.data.message,
              status: "success",
              duration: 1000,
              isClosable: true,
            });

            router.push(`/negocios/${NNegocio}`)
          })
          .catch((err) => {
            console.error(err.data);
          });

      } else {

        const dadosPost = data;
        const url = `/api/db/proposta/put/${dadosPost.id}`;
        await axios({
          method: "PUT",
          url: url,
          data: dadosPost,
        })
          .then(async (res: any) => {

            const date = new Date();
            const DateAtua = date.toISOString();

            const msg = {
              vendedor: session?.user.name,
              date: new Date().toISOString(),
              msg: `Vendedor ${session?.user.name} atualizou essa proposta `,
            };

            const msg2 = {
              date: DateAtua,
              msg: `Proposta atualizada, valor total agora é ${dadosPost.totalGeral}, passando a ter ${dadosPost.itens.length} items`,
              user: "Sistema",
            };

            const record = [...dadosPost.hirtori, msg];
            const record2 = [...dadosPost.incidentRecord, msg2];

            const data = {
              data: {
                history: record,
                incidentRecord: record2,
                Budget: totalValor
              },
            };

            await axios({
              method: "PUT",
              url: "/api/db/business/put/id/" + PEDIDO,
              data: data,
            })
              .then((resp) => console.log(resp.data))
              .catch((err) => console.log(err))

            router.push(`/negocios/${PEDIDO}`)

            toast({
              title: "Proposta Atualizada",
              description: res.data.message,
              status: "success",
              duration: 1000,
              isClosable: true,
            });
          })
          .catch((err: any) => {
            setLoadingGeral(false)
            console.log(err.response);
          });
      }

    }
  };

  function getPrazo(prazo: SetStateAction<string>) {
    setTipoPrazo(prazo);
  }


  function getIten(resposta: SetStateAction<any>) {
    const lista = ListItens;
    const maxSum =
      ListItens.length > 0
        ? Math.max(...ListItens.map((obj: any) => parseInt(obj.id) + 1))
        : 1;
    resposta.id = maxSum;
    const valor1 = Number(resposta.vFinal.replace(".", "").replace(",", "."));
    const ValorGeral = valor1;
    const valor = Math.round(parseFloat(valor1.toFixed(2)) * 100) / 100;
    resposta.total = Math.round(parseFloat(ValorGeral.toFixed(2)) * 100) / 100;
    resposta.expo = false;
    resposta.mont = false;
    resposta.codg = resposta.prodId;
    resposta.Qtd = 1;
    const retorno = {
      ...resposta,

      total: Math.round(parseFloat(valor.toFixed(2)) * 100) / 100,
    };
    const newItens = lista.map((f: any) => ({
      ...f,
      expo: !f.expo ? false : f.expo > false ? f.expo : false,
      mont: !f.mont ? false : f.mont > false ? f.mont : false,
      Qtd: !f.Qtd ? 1 : f.Qtd > 1 ? f.Qtd : 1,
    }));
    const ListaRetorno: any = [...newItens, retorno];
    setItens(ListaRetorno);
  }


  function getLoading(load: SetStateAction<boolean>) {
    setLoadingTable(load);
  }

  function getItemFinal(itemFinal: SetStateAction<any>) {
    const filterItens = ListItens.filter((i: any) => i.id !== itemFinal);
    setItens(filterItens);
  }


  if (loadingGeral) {
    return <Loading size="200px">Carregando...</Loading>;
  }

  const setFreteSave = (e: any) => {
    const Valor = e.target.value
    const sinal = Valor.split("")
    const valorLinpo = SetValue(Valor)
    setFreteCif(!valorLinpo ? '0,00' : valorLinpo)
  }

  const setAdddescont = (e: any) => {
    const Valor = e.target.value
    const sinal = Valor.split("")
    if (!Valor) {
      setDescontoAdd('0,00')
    } else if (sinal[0] === '-') {
      const valorLinpo = SetValueNumero(Valor)
      setDescontoAdd(sinal[0] + valorLinpo)
    } else {
      const valorLinpo = SetValue(Valor)
      setDescontoAdd(valorLinpo)
    }
  }



  return (
    <>
      <Flex h="100vh" w="100%" flexDir={"column"} px={'5'} py={1} bg={'gray.800'} color={'white'} justifyContent={'space-between'} >
        <Box w="100%" bg={'gray.800'} mt={3}>
          <Flex gap={3} alignItems={'center'}>
            <IconButton aria-label='voltar' rounded={'3xl'} onClick={() => router.back()} icon={<BsArrowLeftCircleFill size={30} color="#136dcc" />} />
            <Heading size="md">Proposta comercial</Heading>
          </Flex>
          <Box display="flex" flexWrap={'wrap'} gap={5} alignItems="center" mt={3} mx={5}>
            <Box me={2}>
              <ListaEmpresa onChangeValue={Nome} />
            </Box>
            <Box me={2}>
              <CompBusiness Resp={saveNegocio} />
            </Box>
            <Box>
              <FormLabel
                fontSize="xs"
                fontWeight="md"
              >
                Data
              </FormLabel>
              <Input
                shadow="sm"
                type={"date"}
                size="xs"
                w="24"
                fontSize="xs"
                rounded="md"
                isDisabled
                onChange={(e) => setDate(e.target.value)}
                value={date}
              />
            </Box>
            <Box>
              <FormLabel
                fontSize="xs"
                fontWeight="md"
              >
                Data Entrega
              </FormLabel>
              <Input
                shadow="sm"
                type={"date"}
                color={'white'}
                 size="xs"
                 w="28"
                fontSize="xs"
                rounded="md"
                onChange={(e) => setDateEntrega(e.target.value)}
                value={DateEntrega}
              />
            </Box>
            <Box>
              <FormLabel
                fontSize="xs"
                fontWeight="md"
              >
                Fornecedor
              </FormLabel>
              <Select
                shadow="sm"
                 size="xs"
                w="28"
                fontSize="xs"
                rounded="md"
                onChange={(e) => setLoja(e.target.value)}
                value={Loja}
              >
                <option style={{ backgroundColor: "#1A202C" }} value=''>
                  Selecione um Fornecedor
                </option>
                {ListFornecedor.map((item) => {
                  return (
                    <option key={item.id} style={{ backgroundColor: "#1A202C" }} value={item.id}>
                      {item.title}
                    </option>
                  );
                })}
              </Select>
            </Box>
            <Box>
              <FormLabel
                fontSize="xs"
                fontWeight="md"
              >
                Condição de pagamento
              </FormLabel>
              <Select
                shadow="sm"
                 size="xs"
                w="36"
                fontSize="xs"
                rounded="md"
                onChange={(e) => setPrazo(e.target.value)}
                value={prazo}
              >
                <option style={{ backgroundColor: "#1A202C" }} >Tipos de pagamentos</option>
                <option style={{ backgroundColor: "#1A202C" }} value="Máximo prazo de pagamento">Máximo prazo de pagamento</option>
                <option style={{ backgroundColor: "#1A202C" }} value="Antecipado">Antecipado</option>
                <option style={{ backgroundColor: "#1A202C" }} value="À vista">À vista</option>
                <option style={{ backgroundColor: "#1A202C" }} value="A Prazo">A prazo</option>
              </Select>
            </Box>
            <Box hidden={prazo === "A Prazo" ? false : true}>
              <CompPrazo Resp={tipoprazo} onAddResp={getPrazo} oncnpj={cnpj} />
            </Box>
            <Box>
              <FormLabel
                fontSize="xs"
                fontWeight="md"
              >
                Frete
              </FormLabel>
              <Select
                shadow="sm"
                 size="xs"
                w="24"
                fontSize="xs"
                rounded="md"
                onChange={(e) => setFrete(e.target.value)}
                value={frete}
              >
                <option style={{ backgroundColor: "#1A202C" }}>Selecione um tipo de Frete</option>
                <option style={{ backgroundColor: "#1A202C" }} value="CIF">CIF</option>
                <option style={{ backgroundColor: "#1A202C" }} value="FOB">FOB</option>
              </Select>
            </Box>
            <Box hidden={frete === "CIF" ? false : true}>
              <FormLabel
                fontSize="xs"
                fontWeight="md"
              >
                Valor de Frete
              </FormLabel>
              <Input
                type="text"
                textAlign={"end"}
                 size="xs"
                w={24}
                step={'0.01'}
                fontSize="xs"
                rounded="md"
                onChange={setFreteSave}
                value={freteCif}
              />
            </Box>
            {session?.user.pemission !== 'Adm' ? null : (
              <>
                <Box>
                  <FormLabel
                    fontSize="xs"
                    fontWeight="md"
                  >
                    Desconto Adicional
                  </FormLabel>
                  <Input
                    type="text"
                    textAlign={"end"}
                     size="xs"
                    w={24}
                    fontSize="xs"
                    rounded="md"
                    onChange={setAdddescont}
                    value={DescontoAdd}
                  />
                </Box>
              </>
            )}
          </Box>
          <Box mt={4}>
            <Heading  size="sm">Itens da proposta comercial</Heading>
          </Box>
          <Box display="flex" gap={5} alignItems="center" mt={3} mx={5}>
            {!disbleProd && (<Box w={"300px"} />)}
            {!!disbleProd && (
              <Box w={"300px"} alignItems="center" >
                <ProdutiList Lista={props.produtos} Retorno={getIten} Reload={getLoading}
                />
              </Box>
            )}
            <Box alignItems="center">
              <FormLabel
                fontSize="xs"
                fontWeight="md"
              >
                Pedido do Cliente N°:
              </FormLabel>
              <Input
                shadow="sm"
                type={"text"}
                size="xs"
                w="32"
                fontSize="xs"
                rounded="md"
                onChange={(e) => setClientePedido(e.target.value)}
                value={clientePedido}
              />
            </Box>
            <Box w={"40rem"}>
              <Box display="flex" gap={5} alignItems="center">
                <Box w="full">
                  <FormLabel
                    fontSize="xs"
                    fontWeight="md"
                  >
                    Observação
                  </FormLabel>
                  <Textarea
                    w="full"
                    h={"10"}
                    onChange={(e) => setObs(e.target.value)}
                    placeholder="Breve descrição sobre o andamento"
                    size="xs"
                    value={obs}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
          <Box mt={8} w={"100%"} mb={5} bg={'gray.800'}>
            <Box>
              <TableContainer>
                <Table variant='simple'>
                  <Thead>
                    <Tr bg={'#ffffff12'}>
                      <Th px='0' w={"1.3rem"}></Th>
                      <Th px='0' w={"10rem"} color='white' textAlign={'center'} fontSize={'0.7rem'}>Item</Th>
                      <Th px='0' w={"5rem"} color='white' textAlign={'center'} fontSize={'0.7rem'}>
                        Código
                      </Th>
                      <Th px='0' w={"3rem"} color='white' textAlign={'center'} fontSize={'0.7rem'}>
                        Qtd
                      </Th>
                      <Th px='0' w={"5rem"} color='white' textAlign={'center'} fontSize={'0.7rem'}>
                        altura
                      </Th>
                      <Th px='0' w={"5rem"} color='white' textAlign={'center'} fontSize={'0.7rem'}>
                        largura
                      </Th>
                      <Th px='0' w={"5rem"} color='white' textAlign={'center'} fontSize={'0.7rem'}>
                        comprimento
                      </Th>
                      <Th px='0' w={"3rem"} color='white' textAlign={'center'} fontSize={'0.7rem'}>
                        Mont.
                      </Th>
                      <Th px='0' w={"3rem"} color='white' textAlign={'center'} fontSize={'0.7rem'}>
                        Expo.
                      </Th>
                      <Th px='0' w={"6rem"} color='white' textAlign={'center'} fontSize={'0.7rem'}>
                        Preço un
                      </Th>
                      <Th px='0' w={"6rem"} color='white' textAlign={'center'} fontSize={'0.7rem'}>
                        Preço total
                      </Th>
                      <Th px='0' textAlign={"center"} w={"5rem"}>
                        <Icon as={BsTrash} boxSize={4} color={"whatsapp.600"} />
                      </Th>
                    </Tr>
                  </Thead>
                  <TableConteudo
                    Itens={ListItens}
                    loading={loadingTable}
                    returnItem={getItemFinal}
                  />
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </Box>
        <Box display={"flex"} justifyContent={"space-between"} me={10} mb={5} bg={'gray.800'}>
          <Flex gap={20}>
            <chakra.p>
              Total de itens: {!ListItens ? "" : ListItens.length}
            </chakra.p>
            <chakra.p>
              Frete:{" "}
              {!freteCif || freteCif === "" ? "R$ 0,00" : parseFloat(freteCif.replace(".", "").replace(',', '.')).toLocaleString("pt-br", {
                style: "currency",
                currency: "BRL",
              })}
            </chakra.p>
            <chakra.p>Desconto: {Desconto.toLocaleString("pt-br", {
              style: "currency",
              currency: "BRL",
            })}</chakra.p>
            <chakra.p>Valor Total: {(SetValueNumero(freteCif) + totalGeral).toLocaleString("pt-br", {
              style: "currency",
              currency: "BRL",
            })}</chakra.p>
          </Flex>
          <Button colorScheme={"whatsapp"} onClick={SalvarProdutos} isDisabled={loadingTable}>
            Salvar Proposta
          </Button>
        </Box>
      </Flex>
    </>
  );
}
