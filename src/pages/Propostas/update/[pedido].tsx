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
} from '@chakra-ui/react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { SetStateAction, useEffect, useState } from 'react';
import { BiPlusCircle } from 'react-icons/bi';
import { BsTrash } from 'react-icons/bs';
import { CompFornecedor } from '../../../components/elements/lista/fornecedor';
import { CompPrazo } from '../../../components/elements/lista/prazo';
import Loading from '../../../components/elements/loading';

export default function Proposta() {
  const { data: session } = useSession();
  const router = useRouter();
  const Email = session.user.email;
  const [reqPrazo, setReqPrazo] = useState([]);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [NomeEnpresa, setNomeEmpresa] = useState('');
  const [RelatEnpresa, setRelatEmpresa] = useState([]);
  const [RelatEnpresaId, setRelatEmpresaId] = useState('');
  const [Produtos, SetProdutos] = useState([]);
  const [ListItens, setItens] = useState([]);
  const [itenId, setItenId] = useState('');
  const [date, setDate] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [frete, setFrete] = useState('');
  const [freteCif, setFreteCif] = useState('');
  const [Loja, setLoja] = useState('');
  const [prazo, setPrazo] = useState('');
  const [tipoprazo, setTipoPrazo] = useState('');
  const [totalGeral, setTotalGeral] = useState('');
  const [Desconto, setDesconto] = useState('');
  const [Andamento, setAndamento] = useState([]);
  const [negocio, setNegocio] = useState('');
  const [Fornecedor, setFornecedor] = useState([]);
  const [FornecedorId, setFornecedorId] = useState();
  const [dados, setDados] = useState<any>([]);
  const [obs, setObs] = useState('');
  const [Id, setId] = useState('');

  const toast = useToast();

  useEffect(() => {
    (async () => {
      const PEDIDO = router.query.pedido;
      const request = await axios('/api/db/proposta/get/pedido/' + PEDIDO);
      const [resp]: any = request.data;
      console.log(resp);
      setId(resp.id);
      setCnpj(resp.attributes.CNPJClinet);
      const retornoProd = await fetch(
        '/api/query/get/produto/cnpj/' + resp.attributes.CNPJClinet,
        {
          method: 'POST',
          body: JSON.stringify(Email),
        },
      );
      const respProd = await retornoProd.json();
      const requestPrazo = await fetch('/api/db/prazo/get');
      const RespPrazoB: any = await requestPrazo.json();
      setReqPrazo(RespPrazoB.data);
      setAndamento(resp.attributes.andamento);
      setDados(resp.attributes);
      SetProdutos(respProd);
      setFrete(resp.attributes.frete);
      setDate(resp.attributes.dataPedido);
      setItens(resp.attributes.itens);
      setPrazo(resp.attributes.condi);
      setRelatEmpresa(resp.attributes.empresa.data);
      setRelatEmpresaId(resp.attributes.empresaId);
      setLoja(resp.attributes.matriz);
      setFreteCif(resp.attributes.valorFrete);
      setFornecedor(resp.attributes.fornecedor.data);
      setFornecedorId(resp.attributes.fornecedorId);
      setObs(resp.attributes.obs);
      setNegocio(resp.attributes.business.data.attributes.nBusiness);
      const nome = resp.attributes.empresa.data.attributes.nome;
      setNomeEmpresa(nome);
    })();
  }, []);

  const disablefrete = () => {
    if (frete === 'CIF') return false;
    else {
      if (freteCif === '0,00') return true;
      else {
        setFreteCif('0,00');
        return true;
      }
    }
  };

  const disbleProd =
    prazo === ''
      ? true
      : prazo === 'A Prazo' && tipoprazo === ''
      ? true
      : Produtos.length === 0
      ? true
      : false;

  const hidemPod = cnpj === '' ? true : false;

  const addItens = async () => {
    setLoadingTable(true);
    const url = '/api/query/get/produto/id/' + itenId;
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify(Email),
    })
      .then((resp) => resp.json())
      .then((resposta) => {
        if (ListItens.length !== 0) {
          const maxSum = Math.max(...ListItens.map((obj: any) => obj.id + 1));
          resposta.id = maxSum;
          const valor1 = Number(
            resposta.vFinal.replace('.', '').replace(',', '.'),
          );
          const ValorGeral = valor1;
          const valor = Math.round(parseFloat(valor1.toFixed(2)) * 100) / 100;
          resposta.total =
            Math.round(parseFloat(ValorGeral.toFixed(2)) * 100) / 100;
          resposta.expo = false;
          resposta.mont = false;
          resposta.Qtd = 1;
          const descont = prazo === 'Antecipado' ? valor * 0.05 : 0;
          const somaDescontMin =
            Math.round(parseFloat(descont.toFixed(2)) * 100) / 100;
          const TotalDesc = valor - somaDescontMin;
          const retorno = {
            ...resposta,
            desconto:
              Math.round(parseFloat(somaDescontMin.toFixed(2)) * 100) / 100,
            total: Math.round(parseFloat(TotalDesc.toFixed(2)) * 100) / 100,
          };
          setItens(
            ListItens.map((f) => {
              f.expo = false;
              f.mont = false;
              f.Qtd = 1;
              const data = { ...f };
              return data;
            }),
          );
          setTimeout(() => {
            const ListaRetorno = [...ListItens, retorno];
            setItens(ListaRetorno);
            setLoadingTable(false);
          }, 50);
        } else {
          resposta.id = 1;
          const valor1 = Number(
            resposta.vFinal.replace('.', '').replace(',', '.'),
          );
          const ValorGeral = valor1;
          const valor = Math.round(parseFloat(valor1.toFixed(2)) * 100) / 100;
          resposta.total =
            Math.round(parseFloat(ValorGeral.toFixed(2)) * 100) / 100;
          resposta.expo = false;
          resposta.mont = false;
          resposta.Qtd = 1;
          const descont = prazo === 'Antecipado' ? valor * 0.05 : 0;
          const somaDescontMin =
            Math.round(parseFloat(descont.toFixed(2)) * 100) / 100;
          const TotalDesc = valor - somaDescontMin;
          const retorno = {
            ...resposta,
            desconto:
              Math.round(parseFloat(somaDescontMin.toFixed(2)) * 100) / 100,
            total: Math.round(parseFloat(TotalDesc.toFixed(2)) * 100) / 100,
          };
          const ListaRetorno = [retorno];
          setItens(ListaRetorno);
          setLoadingTable(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoadingTable(false);
        toast({
          title: 'opss.',
          description: err,
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      });
  };

  useEffect(() => {
    setTotalGeral(TotalGreal());
    setDesconto(DescontoGeral());
  }, [ListItens]);

  useEffect(() => {
    if (ListItens.length > 0 && prazo === 'Antecipado') {
      setItens(
        ListItens.map((f) => {
          const valor = Number(f.vFinal.replace('.', '').replace(',', '.'));
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
        }),
      );
    } else {
      setItens(
        ListItens.map((f) => {
          const valor = Number(f.vFinal.replace('.', '').replace(',', '.'));
          const ValorGeral =
            Math.round(parseFloat(valor.toFixed(2)) * 100) / 100;
          f.total = Math.round(parseFloat(ValorGeral.toFixed(2)) * 100) / 100;
          f.desconto = 0;
          const data = { ...f };
          return data;
        }),
      );
    }
  }, [prazo]);

  const DelPrudutos = (x: any) => {
    setLoadingTable(true);
    const filterItens = ListItens.filter((i) => i.id !== x);
    setItens(filterItens);
    setLoadingTable(false);
  };

  const handleAdd = (Obj: any, id: number) => {
    const [ListaObj] = ListItens.filter((i) => i.id === id);
    const intero = Object.assign(ListaObj, Obj);
    setItens((ListItens) => {
      let newArray = [...ListItens];
      let index = newArray.findIndex((element) => element.id === id);
      newArray[index] = intero;
      return newArray;
    });
  };

  const TableItens =
    ListItens.length === 0
      ? null
      : ListItens.map((i, x) => {
          const Id = i.prodId;
          const remove = () => {
            DelPrudutos(i.id);
          };

          const valor2Original = i.vFinal.replace('.', '');
          const ValorProd = Number(valor2Original.replace(',', '.'));
          const somaDescont = ValorProd * i.Qtd;
          const somaDescontMin = parseInt(somaDescont.toFixed(2));

          if (!i.Qtd) {
            i.Qtd = 1;
          }

          const total = () => {
            if (i.Qtd === 1) {
              return i.total;
            }
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
            const descont = prazo === 'Antecipado' ? ValorOriginal * 0.05 : 0;
            const somaAcrescimo =
              acrec === 0
                ? ValorOriginal * i.Qtd
                : ValorOriginal * acrec * i.Qtd;
            const somaDescont = descont * i.Qtd;
            const somaDescontMin =
              Math.round(parseFloat(somaDescont.toFixed(2)) * 100) / 100;
            const TotalItem = somaAcrescimo - somaDescontMin;
            return Math.round(parseFloat(TotalItem.toFixed(2)) * 100) / 100;
          };

          const codig = () => {
            if (!i.codg || i.codg === '') {
              const dt = { codg: Id };
              handleAdd(dt, i.id);
              return Id;
            }
            return Id;
          };

          const GetQtd = (e: any) => {
            const valor = e.target.value;
            const dt = { Qtd: valor };
            handleAdd(dt, i.id);
          };

          const GetMont = (e: any) => {
            const valor = e.target.checked;
            const dt = { mont: valor };
            handleAdd(dt, i.id);
          };

          const GetExpo = (e: any) => {
            const valor = e.target.checked;
            const dt = { expo: valor };
            handleAdd(dt, i.id);
          };

          return (
            <>
              <Tr h={3} key={i.id}>
                <Td isNumeric>{x + 1}</Td>
                <Td>{i.nomeProd}</Td>
                <Td textAlign={'center'}>{codig()}</Td>
                <Td px={12}>
                  <Input
                    type={'text'}
                    size="xs"
                    w="2.9rem"
                    me={0}
                    borderColor="whatsapp.600"
                    rounded="md"
                    focusBorderColor="whatsapp.400"
                    _hover={{
                      borderColor: 'whatsapp.600',
                    }}
                    maxLength={4}
                    onChange={GetQtd}
                    value={i.Qtd}
                  />
                </Td>
                <Td textAlign={'center'}>{i.altura}</Td>
                <Td textAlign={'center'}>{i.largura}</Td>
                <Td textAlign={'center'}>{i.comprimento}</Td>
                <Td>
                  <Checkbox
                    borderColor="whatsapp.600"
                    rounded="md"
                    px="3"
                    onChange={GetMont}
                    value={i.mont}
                  />
                </Td>
                <Td>
                  <Checkbox
                    borderColor="whatsapp.600"
                    rounded="md"
                    px="3"
                    onChange={GetExpo}
                    value={i.expo}
                  />
                </Td>
                <Td textAlign={'center'}>{i.vFinal}</Td>
                <Td>
                  R$ {''}
                  <Input
                    type={'text'}
                    size="xs"
                    borderColor="whatsapp.600"
                    rounded="md"
                    w="16"
                    focusBorderColor="whatsapp.400"
                    _hover={{
                      borderColor: 'whatsapp.600',
                    }}
                    onChange={(e) => {
                      const valor = e.target.value;
                      const dt = { total: valor };
                      handleAdd(dt, i.id);
                    }}
                    value={total()}
                  />
                </Td>
                <Td>
                  <Button onClick={remove}>
                    <BsTrash />
                  </Button>
                </Td>
              </Tr>
            </>
          );
        });

  const SalvarProdutos = async () => {
    const Date5 = new Date(date);
    Date5.setDate(Date5.getDate() + 5);
    const VencDate = `${Date5.getUTCFullYear()}-${
      Date5.getUTCMonth() + 1 < 10
        ? '0' + (Date5.getUTCMonth() + 1)
        : Date5.getUTCMonth() + 1
    }-${
      Date5.getUTCDate() < 10 ? '0' + Date5.getUTCDate() : Date5.getUTCDate()
    }`;

    const VencDatePrint = `${
      Date5.getUTCDate() < 10 ? '0' + Date5.getUTCDate() : Date5.getUTCDate()
    }/${
      Date5.getUTCMonth() + 1 < 10
        ? '0' + (Date5.getUTCMonth() + 1)
        : Date5.getUTCMonth() + 1
    }/${Date5.getUTCFullYear()}`;

    const data: any = {
      nPedido: router.query.pedido,
      cliente: cnpj,
      itens: ListItens,
      empresa: RelatEnpresa,
      dataPedido: date,
      vencPedido: VencDate,
      vencPrint: VencDatePrint,
      condi: prazo,
      prazo: tipoprazo,
      totalGeral: totalGeral,
      desconto: Desconto,
      vendedor: session.user.name,
      vendedorId: session.user.id,
      frete: frete,
      valorFrete: freteCif,
      andamento: Andamento,
      empresaId: RelatEnpresaId,
      fornecedor: Fornecedor,
      fornecedorId: FornecedorId,
      matriz: Loja,
      obs: obs,
      CNPJClinet: cnpj,
      business: dados.business.data.id,
    };
    console.log(Id);
    const origin = window.location.origin;
    const url = origin + '/api/db/proposta/put/' + Id;
    await axios({
      method: 'put',
      url: url,
      data: data,
    })
      .then((res) => {
        console.error(res.data.message);
        toast({
          title: 'Proposta Criada',
          description: res.data.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        // setTimeout(() => {
        //   router.back();
        // }, 3100);
      })
      .catch((err) => {
        console.error(err);
        const desc = err.data;
        toast({
          title: 'Proposta não pode ser criada Criada',
          description: desc,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      });
  };

  const TotalGreal = () => {
    if (ListItens.length === 0) return 'R$ 0,00';
    if (ListItens.length === 1) {
      const [valor]: any = ListItens.map((i) => i.total);
      const [ValorP]: any = ListItens.map((i) => i.vFinal);
      const ValorOriginal = ValorP.replace('.', '').replace(',', '.');
      const [Qtd]: any = ListItens.map((i) => i.Qtd);
      const [mont]: any = ListItens.map((i) => i.mont);
      const [expo]: any = ListItens.map((i) => i.expo);
      const total = valor * Qtd;
      const acrec =
        mont === true && expo === true
          ? 1.2
          : expo === true && mont === false
          ? 1.1
          : expo === false && mont === true
          ? 1.1
          : 0;

      const somaAcrescimo =
        acrec === 0 ? 0 : (ValorOriginal * acrec - ValorOriginal) * Qtd;
      const TotalItem = total + somaAcrescimo;
      return TotalItem.toLocaleString('pt-br', {
        style: 'currency',
        currency: 'BRL',
      });
    }
    if (ListItens.length > 1) {
      const lista: any = ListItens.map((i) => {
        const valor: any = i.total;
        const ValorOriginal: any = i.vFinal.replace('.', '').replace(',', '.');
        const Qtd: any = i.Qtd;
        const mont: any = i.mont;
        const expo: any = i.expo;
        const total = valor * Qtd;
        const acrec =
          mont === true && expo === true
            ? 1.2
            : expo === true && mont === false
            ? 1.1
            : expo === false && mont === true
            ? 1.1
            : 0;
        const somaAcrescimo =
          acrec === 0 ? 0 : (ValorOriginal * acrec - ValorOriginal) * Qtd;
        const TotalItem = total + somaAcrescimo;
        return TotalItem;
      });

      return lista
        .reduce((acc: number, valorAtual: number) => acc + valorAtual)
        .toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL',
        });
    }
  };

  const DescontoGeral = () => {
    if (ListItens.length === 0) return 'R$ 0,00';
    if (ListItens.length === 1) {
      const valor: any = ListItens.map((i) => i.desconto);
      const Qtd: any = ListItens.map((i) => i.Qtd);
      const total = Qtd * valor;
      return total.toLocaleString('pt-br', {
        style: 'currency',
        currency: 'BRL',
      });
    }
    if (ListItens.length > 1) {
      const list: any = ListItens.map((i) => {
        const valor: any = i.desconto;
        const Qtd: any = i.Qtd;
        const total = Qtd * valor;
        return total;
      });
      return list
        .reduce((acc: number, valorAtual: number) => acc + valorAtual)
        .toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL',
        });
    }
  };

  const loadDiv = () => {
    return (
      <Box w={'320px'} display="flex" flexDir={'row'} justifyContent="center">
        <Spinner
          thickness="6px"
          speed="0.45s"
          emptyColor="gray.200"
          color="whatsapp.600"
          size="xl"
          hidden={hidemPod}
        />
      </Box>
    );
  };

  const ProdutiDiv = () => {
    return (
      <Box
        display="flex"
        gap={8}
        w={'320px'}
        alignItems="center"
        hidden={hidemPod}
      >
        <Box>
          <FormLabel
            htmlFor="cidade"
            fontSize="xs"
            fontWeight="md"
            color="gray.700"
            _dark={{
              color: 'gray.50',
            }}
          >
            produtos
          </FormLabel>
          <Select
            shadow="sm"
            size="sm"
            w="full"
            fontSize="xs"
            rounded="md"
            placeholder="Selecione um Produto"
            onChange={(e) => setItenId(e.target.value)}
            value={itenId}
          >
            {Produtos.map((item) => {
              return (
                <>
                  <option value={item.prodId}>{item.nomeProd}</option>
                </>
              );
            })}
          </Select>
        </Box>
        <Box>
          <Icon
            as={BiPlusCircle}
            boxSize={8}
            mt={8}
            color="whatsapp.600"
            cursor="pointer"
            onClick={addItens}
          />
        </Box>
      </Box>
    );
  };

  const LoadingTable = () => {
    return (
      <>
        <Box>
          <Loading mt="-13vh" size="150px">
            Carregando Produtos...
          </Loading>
        </Box>
      </>
    );
  };

  function handleInputChange(event: any) {
    const valor = event.target.value;
    setFreteCif(valor);
  }

  const description = (e: any) => {
    const valor = e.target.value;
    setObs(valor);
  };

  function getLoja(loja: SetStateAction<string>) {
    setLoja(loja);
  }

  function getPrazo(prazo: SetStateAction<string>) {
    setTipoPrazo(prazo);
  }

  return (
    <>
      <Flex h="100vh" px={20} w="100%" flexDir={'column'} mt="5">
        <Heading size="lg">Proposta comercial</Heading>
        <Box display="flex" gap={8} alignItems="center" mt={5} mx={5}>
          <Box>
            <FormLabel
              htmlFor="cidade"
              fontSize="xs"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: 'gray.50',
              }}
            >
              Empresas
            </FormLabel>
            <Input
              textAlign={'center'}
              size="xs"
              w={'10rem'}
              fontSize="xs"
              rounded="md"
              placeholder="Selecione uma Empresa"
              value={NomeEnpresa}
            />
          </Box>
          <Box>
            <FormLabel
              htmlFor="cidade"
              fontSize="xs"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: 'gray.50',
              }}
            >
              N° Business
            </FormLabel>
            <Input
              textAlign={'center'}
              size="xs"
              w={'10rem'}
              fontSize="xs"
              rounded="md"
              placeholder="Selecione uma Empresa"
              value={negocio}
            />
          </Box>

          <Box>
            <FormLabel
              htmlFor="cidade"
              fontSize="xs"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: 'gray.50',
              }}
            >
              Data
            </FormLabel>
            <Input
              shadow="sm"
              type={'date'}
              size="xs"
              w="full"
              fontSize="xs"
              rounded="md"
              placeholder="Selecione uma Empresa"
              onChange={(e) => setDate(e.target.value)}
              value={date}
            />
          </Box>
          <Box>
            <CompFornecedor Resp={Loja} onAddResp={getLoja} />
          </Box>
          <Box>
            <FormLabel
              htmlFor="cidade"
              fontSize="xs"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: 'gray.50',
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
          <Box hidden={prazo === 'A Prazo' ? false : true}>
            <CompPrazo Resp={tipoprazo} onAddResp={getPrazo} />
          </Box>
          <Box>
            <FormLabel
              htmlFor="cidade"
              fontSize="xs"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: 'gray.50',
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
              value={frete}
            >
              <option value="CIF">CIF</option>
              <option value="FOB">FOB</option>
            </Select>
          </Box>
          <Box hidden={disablefrete()}>
            <FormLabel
              htmlFor="cidade"
              fontSize="xs"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: 'gray.50',
              }}
            >
              Valor de Frete
            </FormLabel>
            <Input
              textAlign={'end'}
              size="xs"
              w={'7rem'}
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
          <Box>{disbleProd === true ? loadDiv() : ProdutiDiv()}</Box>
          <Box w={'30rem'}>
            <Box display="flex" gap={8} alignItems="center">
              <Box w="full">
                <FormLabel
                  htmlFor="cidade"
                  fontSize="xs"
                  fontWeight="md"
                  color="gray.700"
                  _dark={{
                    color: 'gray.50',
                  }}
                >
                  obs
                </FormLabel>
                <Textarea
                  w="full"
                  onChange={description}
                  placeholder="Breve descrição sobre o andamento"
                  size="sm"
                  value={obs}
                />
              </Box>
            </Box>
          </Box>
        </Box>
        <Box mt={16} w={'100%'} h={'46%'} overflowY={'auto'}>
          <Box>
            {loadingTable ? (
              LoadingTable()
            ) : (
              <>
                <TableContainer>
                  <Table variant="striped" colorScheme="green">
                    <Thead>
                      <Tr>
                        <Th w={'2%'}></Th>
                        <Th w={'28%'}>Item</Th>
                        <Th w={'8%'} textAlign={'center'}>
                          Código
                        </Th>
                        <Th w={'10%'} textAlign={'center'}>
                          Qtd
                        </Th>
                        <Th w={'7%'} textAlign={'center'}>
                          altura
                        </Th>
                        <Th w={'7%'} textAlign={'center'}>
                          largura
                        </Th>
                        <Th w={'7%'} textAlign={'center'}>
                          comprimento
                        </Th>
                        <Th w={'5%'} textAlign={'center'}>
                          Mont.
                        </Th>
                        <Th w={'5%'} textAlign={'center'}>
                          Expo.
                        </Th>
                        <Th w={'5%'} textAlign={'center'}>
                          Preço un
                        </Th>
                        <Th w={'5%'} textAlign={'center'}>
                          Preço total
                        </Th>
                        <Th textAlign={'center'} w={'5%'}>
                          <Icon
                            as={BsTrash}
                            boxSize={5}
                            color={'whatsapp.600'}
                          />
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody overflowY={'auto'}>{TableItens}</Tbody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Box>
        </Box>
        <chakra.p
          textAlign={'center'}
          color={'gray.500'}
          fontSize={'sm'}
          mt={5}
          mb={8}
        >
          Lista de produtos adicionados para proposta comercial
        </chakra.p>
        <Box display={'flex'} justifyContent={'space-between'} me={10}>
          <Flex gap={20}>
            <chakra.p>
              Total de itens: {ListItens.length === 0 ? '' : ListItens.length}
            </chakra.p>
            <chakra.p>
              Frete:{' '}
              {parseFloat(freteCif).toLocaleString('pt-br', {
                style: 'currency',
                currency: 'BRL',
              })}
            </chakra.p>
            <chakra.p>Desconto: {Desconto}</chakra.p>
            <chakra.p>Valor Total: {totalGeral}</chakra.p>
          </Flex>
          <Button colorScheme={'whatsapp'} onClick={SalvarProdutos}>
            Atualizar Proposta
          </Button>
        </Box>
      </Flex>
    </>
  );
}