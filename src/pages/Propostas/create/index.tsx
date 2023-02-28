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
import { DateIso } from '../../../components/data/Date';
import { CompBusiness } from '../../../components/elements/lista/business';
import { CompFornecedor } from '../../../components/elements/lista/fornecedor';
import { CompPrazo } from '../../../components/elements/lista/prazo';

import Loading from '../../../components/elements/loading';

const tempo = DateIso;

export default function Proposta() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingTable, setLoadingTable] = useState<boolean>(false);
  const [Enpresa, setEmpresa] = useState([]);
  const [Produtos, SetProdutos] = useState([]);
  const [ListItens, setItens] = useState([]);
  const [itenId, setItenId] = useState('');
  const [date, setDate] = useState(tempo);
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [frete, setFrete] = useState('');
  const [freteCif, setFreteCif] = useState(0.0);
  const [Loja, setLoja] = useState('');
  const [prazo, setPrazo] = useState('');
  const [tipoprazo, setTipoPrazo] = useState('');
  const [totalGeral, setTotalGeral] = useState('');
  const [Desconto, setDesconto] = useState('');
  const [negocio, setNegocio] = useState([]);
  const [saveNegocio, setSaveNegocio] = useState('');
  const [obs, setObs] = useState('');
  const toast = useToast();

  const disbleProd =
    prazo === ''
      ? true
      : prazo === 'A Prazo' && tipoprazo === ''
      ? true
      : Produtos.length === 0
      ? true
      : false;

  const hidemPod = cnpj === '' ? true : false;

  useEffect(() => {
    (async () => {
      const Emaillocal = localStorage.getItem('email');
      const Email = JSON.parse(Emaillocal);
      setEmail(Email);
      const resposta = await fetch('/api/query/get', {
        method: 'POST',
        body: JSON.stringify(Email),
      });
      const resp = await resposta.json();
      setEmpresa(resp);
      setLoading(false);
    })();
  }, []);

  const addItens = async () => {
    setLoadingTable(true);
    const url = `/api/query/get/produto/id/${itenId}`;
    try {
      const resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(email),
      });
      const resposta = await resp.json();

      const maxSum = Math.max(...ListItens.map((obj) => obj.id + 1));
      resposta.id = maxSum || 1;

      const valor1 = Number(resposta.vFinal.replace('.', '').replace(',', '.'));
      const ValorGeral = valor1;
      const valor = Math.round(parseFloat(valor1.toFixed(2)) * 100) / 100;
      resposta.total =
        Math.round(parseFloat(ValorGeral.toFixed(2)) * 100) / 100;
      resposta.expo = false;
      resposta.mont = false;
      resposta.Qtd = 1;
      const desconto = prazo === 'Antecipado' ? valor * 0.05 : 0;
      const somaDescontMin =
        Math.round(parseFloat(desconto.toFixed(2)) * 100) / 100;
      const TotalDesc = valor - somaDescontMin;
      const retorno = {
        ...resposta,
        desconto: Math.round(parseFloat(somaDescontMin.toFixed(2)) * 100) / 100,
        total: Math.round(parseFloat(TotalDesc.toFixed(2)) * 100) / 100,
      };

      const newItens = ListItens.map((f) => ({
        ...f,
        expo: false,
        mont: false,
        Qtd: 1,
      }));
      const ListaRetorno = [...newItens, retorno];
      setItens(ListaRetorno);

      setLoadingTable(false);
    } catch (err) {
      console.log(err);
      setLoadingTable(false);
      toast({
        title: 'opss.',
        description: err,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const TotalGreal = () => {
    if (ListItens.length === 0) return 'R$ 0,00';

    const totalItem = ListItens.reduce((acc, item) => {
      const valor: number = item.total;
      const valorOriginal: number = parseFloat(item.vFinal.replace(',', '.'));
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

    return totalItem.toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const DescontoGeral = () => {
    if (ListItens.length === 0) return 'R$ 0,00';
    const descontos = ListItens.map((i) => i.desconto * i.Qtd);
    const total = descontos.reduce(
      (acc: number, valorAtual: number) => acc + valorAtual,
    );
    return total.toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  useEffect(() => {
    setTotalGeral(TotalGreal());
    setDesconto(DescontoGeral());
  }, [DescontoGeral, ListItens, TotalGreal]);

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
  }, []);

  const ConsultProd = async () => {
    const url = '/api/query/get/produto/cnpj/' + cnpj;
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify(email),
    })
      .then((resp) => resp.json())
      .then((resposta) => {
        const retonoIdeal = resposta.length === 0 ? false : true;
        if (retonoIdeal) {
          SetProdutos(resposta);
        } else {
          toast({
            title: 'opss.',
            description: 'Esta empresa não possui produtos.',
            status: 'warning',
            duration: 9000,
            isClosable: true,
          });
        }
      })
      .catch((err) => console.log(err));
  };

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
                    size="sm"
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
    if (!saveNegocio || saveNegocio === '') {
      toast({
        title: 'Esta Faltando informação',
        description:
          'Você deve vincular essa proposta a um n° Business ou negocio',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    } else {
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
          ? 'R$ 0,00'
          : Desconto === undefined
          ? 'R$ 0,00'
          : Desconto === ''
          ? 'R$ 0,00'
          : Desconto,
        vendedor: session.user.name,
        vendedorId: session.user.id,
        frete: frete,
        valorFrete: freteCif,
        business: saveNegocio,
        obs: obs,
      };
      const url = '/api/db/proposta/post';
      await axios({
        method: 'POST',
        url: url,
        data: data,
      })
        .then((res) => {
          // console.log(res.data.message);
          toast({
            title: 'Proposta Criada',
            description: res.data.message,
            status: 'success',
            duration: 3000,
            isClosable: true,
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

  if (ListItens.length > 0 && prazo === 'A Prazo')
    if (loading) {
      return <Loading size="200px">Carregando...</Loading>;
    }

  const loadDiv = () => {
    return (
      <Spinner
        thickness="6px"
        speed="0.45s"
        emptyColor="gray.200"
        color="whatsapp.600"
        size="xl"
        hidden={hidemPod}
      />
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
        <Loading mt="-13vh" size="150px">
          Carregando Produtos...
        </Loading>
      </>
    );
  };

  function handleInputChange(event: any) {
    const valor = event.target.value;
    setFreteCif(parseFloat(valor));
  }

  function getLoja(loja: SetStateAction<string>) {
    setLoja(loja);
  }
  function getPrazo(prazo: SetStateAction<string>) {
    setTipoPrazo(prazo);
  }
  function getNegocio(negocio: SetStateAction<string>) {
    setSaveNegocio(negocio);
  }

  return (
    <>
      <Flex h="100vh" px={10} w="100%" flexDir={'column'} mt="5">
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
            <Select
              shadow="sm"
              size="xs"
              w="full"
              fontSize="xs"
              rounded="md"
              placeholder="Selecione uma Empresa"
              onChange={(e) => setCnpj(e.target.value)}
              onBlur={ConsultProd}
              value={cnpj}
            >
              {Enpresa.map((item) => {
                return (
                  <>
                    <option value={item.CNPJ}>{item.nome}</option>
                  </>
                );
              })}
            </Select>
          </Box>
          <Box>
            <CompBusiness Resp={saveNegocio} onAddResp={getNegocio} />
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
            >
              <option value="CIF">CIF</option>
              <option value="FOB">FOB</option>
            </Select>
          </Box>
          <Box hidden={frete === 'CIF' ? false : true}>
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
          <Box gap={8} w={'320px'} alignItems="center">
            {disbleProd === true ? loadDiv() : ProdutiDiv()}
          </Box>
          <Box w={'40rem'}>
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
              {freteCif.toLocaleString('pt-br', {
                style: 'currency',
                currency: 'BRL',
              })}
            </chakra.p>
            <chakra.p>Desconto: {Desconto}</chakra.p>
            <chakra.p>Valor Total: {totalGeral}</chakra.p>
          </Flex>
          <Button colorScheme={'whatsapp'} onClick={SalvarProdutos}>
            Salvar Proposta
          </Button>
        </Box>
      </Flex>
    </>
  );
}
