/* eslint-disable react-hooks/exhaustive-deps */
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
  Tbody,
  Textarea,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SetStateAction, useEffect, useState } from "react";
import { BsArrowLeftCircleFill, BsTrash } from "react-icons/bs";
import { DateIso } from "../../../components/data/Date";
import { ListFornecedor } from "../../../components/data/fornecedor";
import { ListaEmpresa } from "@/components/Proposta/ListaEmpresa";
import { CompBusiness } from "@/components/Proposta/business";
import { CompPrazo } from "@/components/Proposta/prazo";
import { ProdutiList } from "@/components/Proposta/produt";
import { TableConteudo } from "@/components/Proposta/tabela";
import Loading from "@/components/elements/loading";
import { SetValue } from "@/function/currenteValor";

const tempo = DateIso;

export const FormProposta = (props: { ondata: any | null; onResponse: any; produtos: any; ITENS: any }) => {
  const router = useRouter();
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
  const [freteCif, setFreteCif] = useState<string>('');
  const [Loja, setLoja] = useState("");
  const [prazo, setPrazo] = useState("");
  const [tipoprazo, setTipoPrazo] = useState("");
  const [totalGeral, setTotalGeral] = useState("");
  const [Desconto, setDesconto] = useState("");
  const [saveNegocio, setSaveNegocio] = useState("");
  const [hirtori, setHistory] = useState([]);
  const [MSG, setMSG] = useState([]);
  const [obs, setObs] = useState("");
  const [Id, setId] = useState("");
  const [clientePedido, setClientePedido] = useState("");
  const [incidentRecord, setIncidentRecord] = useState([]);
  const toast = useToast();

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
    }
    if (props.ITENS) {
      setItens(props.ITENS);
    }
  }, [props.ondata]);

  const disbleProd = !prazo || !DateEntrega || !Loja || !frete ? false : true;

  const TotalGreal = () => {
    if (ListItens.length === 0) return "R$ 0,00";
    const totalItem = ListItens.reduce((acc: number, item: any) => {
      const valorOriginal = Number(item.vFinal.replace(".", "").replace(",", "."))
      const valor: number = valorOriginal - item.desconto;
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
    return totalItem.toLocaleString("pt-br", {
      style: "currency",
      currency: "BRL",
    });
  };

  const DescontoGeral = () => {
    if (ListItens.length === 0) return "R$ 0,00";
    const descontos = ListItens.map((i: any) => i.desconto * i.Qtd);
    const total = descontos.reduce(
      (acc: number, valorAtual: number) => acc + valorAtual
    );
    return total.toLocaleString("pt-br", {
      style: "currency",
      currency: "BRL",
    });
  };

  useEffect(() => {
    setTotalGeral(TotalGreal());
    setDesconto(DescontoGeral());
  }, [DescontoGeral, ListItens, TotalGreal]);

  useEffect(() => {
    if (prazo === "Antecipado") {
      setItens(
        ListItens.map((f: any) => {
          const valor = Number(f.vFinal.replace(".", "").replace(",", "."));
          const ValorGeral =
            Math.round(parseFloat(valor.toFixed(2)) * 100) / 100;
          const descont = ValorGeral * 0.05;
          const somaDescontMin =
            Math.round(parseFloat(descont.toFixed(2)) * 100) / 100;
          const TotalDesc = ValorGeral - somaDescontMin;
          f.total = Math.round(parseFloat(TotalDesc.toFixed(2)) * 100) / 100;
          f.desconto =
            Math.round(parseFloat(somaDescontMin.toFixed(2)) * 100) / 100;
          const data = { ...f };
          return data;
        })
      );
    } else {
      setItens(
        ListItens.map((f: any) => {
          const valor = Number(f.vFinal.replace(".", "").replace(",", "."));
          const ValorGeral =
            Math.round(parseFloat(valor.toFixed(2)) * 100) / 100;
          f.total = Math.round(parseFloat(ValorGeral.toFixed(2)) * 100) / 100;
          f.desconto = 0;
          const data = { ...f };
          return data;
        })
      );
    }
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
        const descont = tipoprazo === "Antecipado" ? ValorOriginal * 0.05 : 0;
        const somaAcrescimo =
          acrec === 0 ? ValorOriginal * i.Qtd : ValorOriginal * acrec * i.Qtd;
        const somaDescont = descont * i.Qtd;
        const somaDescontMin =
          Math.round(parseFloat(somaDescont.toFixed(2)) * 100) / 100;
        const TotalItem = somaAcrescimo - somaDescontMin;
        const result = Math.round(parseFloat(TotalItem.toFixed(2)) * 100) / 100;

        return {
          ...i,
          total: result,
        };
      });

      const totalItem = ListItens.reduce((acc: number, item: any) => {
        const valorOriginal = Number(item.vFinal.replace(".", "").replace(",", "."))
        const valor: number = valorOriginal - item.desconto;
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

      const totalValor = totalItem.toLocaleString("pt-br", {
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
        deconto: prazo !== 'Antecipado'
          ? "R$ 0,00"
          : Desconto,
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
        fornecedorId: session?.user.id
      };
      props.onResponse(data);
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
    const desconto = prazo === "Antecipado" ? valor * 0.05 : 0;
    const somaDescontMin =
      Math.round(parseFloat(desconto.toFixed(2)) * 100) / 100;
    const TotalDesc = valor - somaDescontMin;
    const retorno = {
      ...resposta,
      desconto: Math.round(parseFloat(somaDescontMin.toFixed(2)) * 100) / 100,
      total: Math.round(parseFloat(TotalDesc.toFixed(2)) * 100) / 100,
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
    const valorLinpo = SetValue(Valor)
    setFreteCif(valorLinpo)
  }


  return (
    <>
      <Flex h="100vh" w="100%" flexDir={"column"} px={'10'} py={1} bg={'gray.800'} color={'white'} justifyContent={'space-between'} >
        <Box w="100%" bg={'gray.800'} mt={5}>
          <Flex gap={3}>
            <IconButton aria-label='voltar' rounded={'3xl'} onClick={() => router.back()} icon={<BsArrowLeftCircleFill size={30} color="#136dcc" />} />
            <Heading size="md">Proposta comercial</Heading>
          </Flex>
          <Box display="flex" flexWrap={'wrap'} gap={5} alignItems="center" mt={3} mx={5}>
            <Box>
              <ListaEmpresa onChangeValue={Nome} />
            </Box>
            <Box>
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
                size="sm"
                w="full"
                fontSize="xs"
                rounded="md"
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
                size="sm"
                w="full"
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
                size="sm"
                w="full"
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
                size="sm"
                w="full"
                fontSize="xs"
                rounded="md"
                onChange={(e) => setPrazo(e.target.value)}
                value={prazo}
              >
                <option style={{ backgroundColor: "#1A202C" }} >Tipos de pagamentos</option>
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
                size="sm"
                w="full"
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
                size="sm"
                w={"7rem"}
                step={'0.01'}
                fontSize="xs"
                rounded="md"
                onChange={setFreteSave}
                value={freteCif}
              />
            </Box>
          </Box>
          <Box mt={7}>
            <Heading size="sm">Itens da proposta comercial</Heading>
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
                size="sm"
                w="full"
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
                    onChange={(e) => setObs(e.target.value)}
                    placeholder="Breve descrição sobre o andamento"
                    size="sm"
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
                    Prazo={prazo}
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
            <chakra.p>Desconto: {Desconto}</chakra.p>
            <chakra.p>Valor Total: {totalGeral}</chakra.p>
          </Flex>
          <Button colorScheme={"whatsapp"} onClick={SalvarProdutos} isDisabled={loadingTable}>
            Salvar Proposta
          </Button>
        </Box>
      </Flex>
    </>
  );
}
