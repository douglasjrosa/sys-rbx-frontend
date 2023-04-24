/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
  chakra,
  Flex,
  FormLabel,
  Heading,
  Icon,
  Input,
  Select,
  Table,
  TableContainer,
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
import { BsTrash } from "react-icons/bs";
import { DateIso } from "../../../components/data/Date";
import { ListFornecedor } from "../../../components/data/fornecedor";
import { ListaEmpresa } from "@/components/Proposta/ListaEmpresa";
import { CompBusiness } from "@/components/Proposta/business";
import { CompPrazo } from "@/components/Proposta/prazo";
import { ProdutiList } from "@/components/Proposta/produt";
import { TableConteudo } from "@/components/Proposta/tabela";

const tempo = DateIso;

export default function Proposta() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [ListItens, setItens] = useState<any>([]);
  const [date, setDate] = useState(tempo);
  const [cnpj, setCnpj] = useState("");
  const [frete, setFrete] = useState("");
  const [freteCif, setFreteCif] = useState(0.0);
  const [Loja, setLoja] = useState("");
  const [prazo, setPrazo] = useState("");
  const [tipoprazo, setTipoPrazo] = useState("");
  const [totalGeral, setTotalGeral] = useState("");
  const [Desconto, setDesconto] = useState("");
  const [incidentRecord, setIncidentRecord] = useState([]);
  const [hirtori, setHistory] = useState([]);
  const [saveNegocio, setSaveNegocio] = useState("");
  const [obs, setObs] = useState("");
  const toast = useToast();

  const disbleProd =
    prazo === ""
      ? true
      : prazo === "A Prazo" && tipoprazo === ""
      ? true
      : false;

  useEffect(() => {
    (async () => {
      const id: any = localStorage.getItem("id");
      const resposta = await fetch("/api/db/business/get/id/" + id);
      const resp = await resposta.json();
      setSaveNegocio(resp.attributes.nBusiness);
      setHistory(resp.attributes.incidentRecord);
      setIncidentRecord(resp.attributes.incidentRecord);
    })();
  }, []);

  const TotalGreal = () => {
    if (ListItens.length === 0) return "R$ 0,00";
    const totalItem = ListItens.reduce((acc: number, item: any) => {
      const valor: number = item.total;
      const valorOriginal: number = parseFloat(item.vFinal.replace(",", "."));
      const qtd: number = item.Qtd;
      const mont: boolean = item.mont;
      const expo: boolean = item.expo;
      const acrec: number =
        mont && expo ? 1.2 : expo && !mont ? 1.1 : !expo && mont ? 1.1 : 0;
      const somaAcrescimo: number =
        acrec === 0 ? 0 : (valorOriginal * acrec - valorOriginal) * qtd;
      const total: number = valor * qtd + somaAcrescimo;
      return acc + total;
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
      const VencDate = `${Date5.getUTCFullYear()}-${
        Date5.getUTCMonth() + 1 < 10
          ? "0" + (Date5.getUTCMonth() + 1)
          : Date5.getUTCMonth() + 1
      }-${
        Date5.getUTCDate() < 10 ? "0" + Date5.getUTCDate() : Date5.getUTCDate()
      }`;
      const VencDatePrint = `${
        Date5.getUTCDate() < 10 ? "0" + Date5.getUTCDate() : Date5.getUTCDate()
      }/${
        Date5.getUTCMonth() + 1 < 10
          ? "0" + (Date5.getUTCMonth() + 1)
          : Date5.getUTCMonth() + 1
      }/${Date5.getUTCFullYear()}`;

      const id: any = localStorage.getItem("id");

      const data: any = {
        cliente: cnpj,
        itens: ListItens,
        empresa: Loja,
        dataPedido: date,
        vencPedido: VencDate,
        vencPrint: VencDatePrint,
        condi: prazo,
        prazo: tipoprazo,
        totalGeral: totalGeral,
        deconto: !Desconto
          ? "R$ 0,00"
          : Desconto === undefined
          ? "R$ 0,00"
          : Desconto === ""
          ? "R$ 0,00"
          : Desconto,
        vendedor: session?.user.name,
        vendedorId: session?.user.id,
        frete: frete,
        valorFrete: freteCif,
        business: id,
        obs: obs,
      };
      const url = "/api/db/proposta/post";
      await axios({
        method: "POST",
        url: url,
        data: data,
      })
        .then(async (res: any) => {
          toast({
            title: "Proposta Criada",
            description: res.data.message,
            status: "success",
            duration: 3000,
            isClosable: true,
          });

          const date = new Date();
          const DateAtua = date.toISOString();

          const msg = {
            vendedor: session?.user.name,
            date:
              new Date().toLocaleDateString() +
              " " +
              new Date().toLocaleTimeString(),
            msg: `Vendedor ${session?.user.name} criou essa proposta `,
          };
          const msg2 = {
            date: DateAtua,
            msg: `Proposta criada com o valor total ${totalGeral} contendo ${
              parseInt(ListItens.length) + 1
            } items`,
            user: "Sistema",
          };

          const record = [...hirtori, msg];
          const record2 = [...incidentRecord, msg2];

          const data = {
            data: {
              history: record,
              incidentRecord: record2,
            },
          };

          await axios({
            method: "PUT",
            url: "/api/db/business/put/id/" + id,
            data: data,
          });
          setTimeout(() => {
            router.back();
          }, 3100);
        })
        .catch((err) => {
          console.error(err.data);
        });
    }
  };

  function handleInputChange(event: any) {
    const valor = event.target.value;
    setFreteCif(parseFloat(valor));
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
      expo: false,
      mont: false,
      Qtd: 1,
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

  return (
    <>
      <Flex h="100vh" px={10} w="100%" flexDir={"column"} mt="5">
        <Heading size="lg">Proposta comercial</Heading>
        <Box display="flex" gap={8} alignItems="center" mt={5} mx={5}>
          <Box>
            <ListaEmpresa onChangeValue={getCnpj} />
          </Box>
          <Box>
            <CompBusiness Resp={saveNegocio} />
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
              Data
            </FormLabel>
            <Input
              shadow="sm"
              type={"date"}
              size="sm"
              w="full"
              fontSize="xs"
              rounded="md"
              placeholder="Selecione uma Empresa"
              onChange={(e) => setDate(e.target.value)}
              value={date}
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
              Fornecedor
            </FormLabel>
            <Select
              shadow="sm"
              size="xs"
              w="full"
              fontSize="xs"
              rounded="md"
              placeholder="Selecione um Fornecedor"
              onChange={(e) => setLoja(e.target.value)}
              value={Loja}
            >
              {ListFornecedor.map((item) => {
                return (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                );
              })}
            </Select>
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
              Condição de pagamento
            </FormLabel>
            <Select
              shadow="sm"
              size="xs"
              w="full"
              fontSize="xs"
              rounded="md"
              placeholder="tipos de pagamentos"
              onChange={(e) => setPrazo(e.target.value)}
              value={prazo}
            >
              <option value="Antecipado">Antecipado</option>
              <option value="A vista">Avista</option>
              <option value="A Prazo">A prazo</option>
            </Select>
          </Box>
          <Box hidden={prazo === "A Prazo" ? false : true}>
            <CompPrazo Resp={tipoprazo} onAddResp={getPrazo} />
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
              Frete
            </FormLabel>
            <Select
              shadow="sm"
              size="xs"
              w="full"
              fontSize="xs"
              rounded="md"
              placeholder="Selecione um tipo de Frete"
              onChange={(e) => setFrete(e.target.value)}
            >
              <option value="CIF">CIF</option>
              <option value="FOB">FOB</option>
            </Select>
          </Box>
          <Box hidden={frete === "CIF" ? false : true}>
            <FormLabel
              htmlFor="cidade"
              fontSize="xs"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: "gray.50",
              }}
            >
              Valor de Frete
            </FormLabel>
            <Input
              textAlign={"end"}
              size="xs"
              w={"7rem"}
              fontSize="xs"
              rounded="md"
              onChange={handleInputChange}
              value={freteCif}
            />
          </Box>
        </Box>
        <Box mt={12}>
          <Heading size="md">Itens da proposta comercial</Heading>
        </Box>
        <Box display="flex" gap={8} alignItems="center" mt={5} mx={5}>
          <Box gap={8} w={"320px"} alignItems="center">
            <ProdutiList
              onCnpj={cnpj}
              onResp={getIten}
              ontime={disbleProd}
              retunLoading={getLoading}
              idProd={ListItens.length}
            />
          </Box>
          <Box w={"40rem"}>
            <Box display="flex" gap={8} alignItems="center">
              <Box w="full">
                <FormLabel
                  htmlFor="cidade"
                  fontSize="xs"
                  fontWeight="md"
                  color="gray.700"
                  _dark={{
                    color: "gray.50",
                  }}
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
        <Box mt={12} w={"100%"} h={"46%"} overflowY={"auto"}>
          <Box>
            <TableContainer>
              <Table variant="striped" colorScheme="green">
                <Thead>
                  <Tr>
                    <Th w={"2%"}></Th>
                    <Th w={"28%"}>Item</Th>
                    <Th w={"8%"} textAlign={"center"}>
                      Código
                    </Th>
                    <Th w={"10%"} textAlign={"center"}>
                      Qtd
                    </Th>
                    <Th w={"7%"} textAlign={"center"}>
                      altura
                    </Th>
                    <Th w={"7%"} textAlign={"center"}>
                      largura
                    </Th>
                    <Th w={"7%"} textAlign={"center"}>
                      comprimento
                    </Th>
                    <Th w={"5%"} textAlign={"center"}>
                      Mont.
                    </Th>
                    <Th w={"5%"} textAlign={"center"}>
                      Expo.
                    </Th>
                    <Th w={"5%"} textAlign={"center"}>
                      Preço un
                    </Th>
                    <Th w={"5%"} textAlign={"center"}>
                      Preço total
                    </Th>
                    <Th textAlign={"center"} w={"5%"}>
                      <Icon as={BsTrash} boxSize={5} color={"whatsapp.600"} />
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
        <chakra.p
          textAlign={"center"}
          color={"gray.500"}
          fontSize={"sm"}
          mt={5}
          mb={8}
        >
          Lista de produtos adicionados para proposta comercial
        </chakra.p>
        <Box display={"flex"} justifyContent={"space-between"} me={10}>
          <Flex gap={20}>
            <chakra.p>
              Total de itens: {ListItens.length === 0 ? "" : ListItens.length}
            </chakra.p>
            <chakra.p>
              Frete:{" "}
              {freteCif.toLocaleString("pt-br", {
                style: "currency",
                currency: "BRL",
              })}
            </chakra.p>
            <chakra.p>Desconto: {Desconto}</chakra.p>
            <chakra.p>Valor Total: {totalGeral}</chakra.p>
          </Flex>
          <Button colorScheme={"whatsapp"} onClick={SalvarProdutos}>
            Salvar Proposta
          </Button>
        </Box>
      </Flex>
    </>
  );
}
