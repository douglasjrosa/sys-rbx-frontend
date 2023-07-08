/* eslint-disable react/no-unknown-property */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
  chakra,
  Checkbox,
  Flex,
  FormLabel,
  Heading,
  Icon,
  IconButton,
  Input,
  Select,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
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
import { ListFornecedor } from "../../../components/data/fornecedor";
import { ListaEmpresa } from "@/components/Proposta/ListaEmpresa";
import { CompBusiness } from "@/components/Proposta/business";
import { CompPrazo } from "@/components/Proposta/prazo";
import { ProdutiList } from "@/components/Proposta/produt";
import { TableConteudo } from "@/components/Proposta/tabela";
import Loading from "@/components/elements/loading";
import { mask, unMask } from "remask";
import { SetValue } from "@/function/currenteValor";

export default function Proposta() {
  const { data: session } = useSession();
  const router = useRouter();
  const Email = session?.user.email;
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [loadingGeral, setLoadingGeral] = useState<boolean>(false);
  const [NomeEnpresa, setNomeEmpresa] = useState("");
  const [RelatEnpresa, setRelatEmpresa] = useState([]);
  const [RelatEnpresaId, setRelatEmpresaId] = useState("");
  const [Produtos, SetProdutos] = useState([]);
  const [ListItens, setItens] = useState<any>([]);
  const [date, setDate] = useState("");
  const [DateEntrega, setDateEntrega] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [frete, setFrete] = useState("");
  const [freteCif, setFreteCif] = useState('');
  const [Loja, setLoja] = useState("");
  const [prazo, setPrazo] = useState("");
  const [tipoprazo, setTipoPrazo] = useState("");
  const [totalGeral, setTotalGeral] = useState("");
  const [Desconto, setDesconto] = useState("");
  const [Andamento, setAndamento] = useState([]);
  const [saveNegocio, setSaveNegocio] = useState("");
  const [dados, setDados] = useState<any>([]);
  const [hirtori, setHistory] = useState([]);
  const [MSG, setMSG] = useState([]);
  const [obs, setObs] = useState("");
  const [Id, setId] = useState("");
  const [BId, setBId] = useState("");
  const [clientePedido, setClientePedido] = useState("");

  const toast = useToast();


  useEffect(() => {
    (async () => {
      setLoadingGeral(true)
      const PEDIDO = router.query.pedido;
      const request = await axios("/api/db/proposta/get/pedido/" + PEDIDO);
      const [resp]: any = request.data;
      if (resp.attributes.Bpedido !== null) {
        router.back()
      }
      setCnpj(resp.attributes.CNPJClinet);
      const retornoProd = await fetch(
        "/api/query/get/produto/cnpj/" + resp.attributes.CNPJClinet,
        {
          method: "POST",
          body: JSON.stringify(Email),
        }
      );
      const respProd = await retornoProd.json();
      setDados(resp);
      SetProdutos(respProd);
      setId(resp.id);
      setAndamento(resp.attributes?.andamento);
      setFrete(resp.attributes?.frete);
      setDate(resp.attributes?.dataPedido);
      setItens(resp.attributes?.itens);
      setPrazo(resp.attributes?.condi);
      setRelatEmpresa(resp.attributes?.empresa.data);
      setRelatEmpresaId(resp.attributes?.empresa.data.id);
      setFreteCif(resp.attributes?.valorFrete);
      setLoja(resp.attributes?.fornecedor);
      setObs(resp.attributes?.obs);
      setSaveNegocio(resp.attributes?.business.data.attributes?.nBusiness);
      setBId(resp.attributes?.business.data.id);
      setHistory(resp.attributes?.business.data.attributes?.history);
      const nome = resp.attributes?.empresa.data.attributes?.nome;
      setMSG(resp.attributes?.business.data.attributes?.incidentRecord)
      setNomeEmpresa(nome);
      setLoadingGeral(false)
      setClientePedido(resp.attributes?.cliente_pedido)
      setTipoPrazo(resp.attributes?.prazo)
      setDateEntrega(resp.attributes.dataEntrega)
    })();
  }, []);

  const disbleProd =
    prazo === ""
      ? true
      : prazo === "A Prazo" && tipoprazo === ""
        ? true
        : false;

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
      toast({
        title: "Esta Faltando informação",
        description:
          "Você deve vincular essa proposta a um n° Business ou negocio",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    } else {
      const Date5 = new Date(date);
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
        dataPedido: date,
        dataEntrega: DateEntrega,
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
        cliente_pedido: clientePedido
      };
      const url = `/api/db/proposta/put/${Id}`;
      await axios({
        method: "PUT",
        url: url,
        data: data,
      })
        .then(async (res: any) => {
          toast({
            title: "Proposta Atualizada",
            description: res.data.message,
            status: "success",
            duration: 1000,
            isClosable: true,
          });

          const date = new Date();
          const DateAtua = date.toISOString();

          const msg = {
            date: DateAtua,
            user: "Sistema",
            msg: `Proposta atualizada, valor total agora é ${totalGeral}, pasando a ter ${parseInt(ListItens.length) + 1
              } items`,
          };

          const record = [...MSG, msg];

          const data = {
            data: {
              incidentRecord: record,
              Budget: totalGeral
            },
          };

          await axios({
            method: "PUT",
            url: "/api/db/business/put/id/" + BId,
            data: data,
          });

          router.back();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  function handleInputChange(event: any) {
    const valor: any = event.target.value;
    setFreteCif(valor);
  }

  function getPrazo(prazo: SetStateAction<string>) {
    setTipoPrazo(prazo);
  }

  function getCnpj(CNPJ: SetStateAction<string>) {
    setCnpj(CNPJ);
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
              <ListaEmpresa onChangeValue={getCnpj} />
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
                size="xs"
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
                size="xs"
                w="full"
                fontSize="xs"
                rounded="md"
                placeholder="Tipos de pagamentos"
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
                size="xs"
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
                size="xs"
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
            <Box w={"300px"} alignItems="center">
              <ProdutiList
                onCnpj={cnpj}
                onResp={getIten}
                ontime={disbleProd}
                retunLoading={getLoading}
                idProd={ListItens.length}
              />
            </Box>
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
                      <Th px='0' w={"8rem"} color='white' fontSize={'0.7rem'}>Item</Th>
                      <Th px='0' w={"5rem"} color='white' fontSize={'0.7rem'}>
                        Código
                      </Th>
                      <Th px='0' w={"3rem"} color='white' fontSize={'0.7rem'}>
                        Qtd
                      </Th>
                      <Th px='0' w={"5rem"} color='white' fontSize={'0.7rem'}>
                        altura
                      </Th>
                      <Th px='0' w={"5rem"} color='white' fontSize={'0.7rem'}>
                        largura
                      </Th>
                      <Th px='0' w={"5rem"} color='white' fontSize={'0.7rem'}>
                        comprimento
                      </Th>
                      <Th px='0' w={"3rem"} color='white' fontSize={'0.7rem'}>
                        Mont.
                      </Th>
                      <Th px='0' w={"3rem"} color='white' fontSize={'0.7rem'}>
                        Expo.
                      </Th>
                      <Th px='0' w={"6rem"} color='white' fontSize={'0.7rem'}>
                        Preço un
                      </Th>
                      <Th px='0' w={"6rem"} color='white' fontSize={'0.7rem'}>
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
              Total de itens: {ListItens.length === 0 ? "" : ListItens.length}
            </chakra.p>
            <chakra.p>
              Frete:{" "}
              {freteCif === "" ? "R$ 0,00" : parseFloat(freteCif.replace(".", "").replace(',', '.')).toLocaleString("pt-br", {
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
