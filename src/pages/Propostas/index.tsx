/* eslint-disable react/no-unknown-property */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
  Flex,
  FormLabel,
  Heading,
  Icon,
  Input,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  chakra,
  Th,
  Thead,
  Tr,
  useToast,
  Checkbox,
  ListItem,
  Center,
  WrapItem,
  Spinner,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { BiPlusCircle } from 'react-icons/bi';
import { BsTrash } from 'react-icons/bs';
import { DateIso } from '../../components/data/Date';
import Loading from '../../components/elements/loading';
import { useSession } from 'next-auth/react';
import { number } from 'yup';

const tempo = DateIso;

export default function Proposta() {
  const [reqPrazo, setReqPrazo] = useState([]);
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
  const [freteCif, setFreteCif] = useState('');
  const [freteCifMask, setFreteCifMask] = useState('R$ 0,00');
  const [Loja, setLoja] = useState('');
  const [prazo, setPrazo] = useState('');
  const [tipoprazo, setTipoPrazo] = useState('');
  const [totalGeral, setTotalGeral] = useState();
  const [desconto, setDesconto] = useState();
  const [paymentExpiration, setPaymentExpiration] = useState([]);
  const toast = useToast();

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

  console.log(paymentExpiration);

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
      const requestPrazo = await fetch('/api/db/prazo/get');
      const RespPrazoB: any = await requestPrazo.json();
      setReqPrazo(RespPrazoB.data);
      const resposta = await fetch('/api/query/get', {
        method: 'POST',
        body: JSON.stringify(Email),
      });
      const resp = await resposta.json();
      setEmpresa(resp);
      setLoading(false);
    })();
  }, []);

  const ConsultProd = async () => {
    // setLoading(true);
    const url = '/api/query/get/produto/cnpj/' + cnpj;
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify(email),
    })
      .then((resp) => resp.json())
      .then((resposta) => {
        const retonoIdeal = resposta.status === false ? [] : resposta;
        SetProdutos(retonoIdeal);
        if (resposta.status !== false) {
          setLoading(false);
        }
        if (resposta.status === false) {
          toast({
            title: 'opss.',
            description: 'Esta empresa não possui produtos.',
            status: 'warning',
            duration: 9000,
            isClosable: true,
          });
          setLoading(false);
        }
      })
      .catch((err) => console.log(err));
  };

  const addItens = async () => {
    setLoadingTable(true);
    const url = '/api/query/get/produto/id/' + itenId;
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify(email),
    })
      .then((resp) => resp.json())
      .then((resposta) => {
        if (ListItens.length !== 0) {
          const maxSum = Math.max(...ListItens.map((obj) => obj.id + 1));
          resposta.id = maxSum;
          const valor = Number(
            resposta.vFinal.replace('.', '').replace(',', '.'),
          );
          resposta.total = valor.toFixed(2);
          resposta.expo = false;
          resposta.mont = false;
          const intero = [...ListItens, resposta];
          setItens(intero);
          setLoadingTable(false);
          const total = ListItens.map((i) => i.total).reduce(
            (acc, valorAtual) => acc + valorAtual,
          );
          setTotalGeral(total);
        } else {
          resposta.id = 1;
          const valor = Number(
            resposta.vFinal.replace('.', '').replace(',', '.'),
          );
          resposta.total = valor.toFixed(2);
          resposta.expo = false;
          resposta.mont = false;
          setItens([resposta]);
          setLoadingTable(false);
          setTotalGeral(resposta.total);
        }
        setItenId('');
      })
      .catch((err) => console.log(err));
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

  const lista = () => {
    const resp = ListItens.map((i, x) => {
      const Id = i.prodId;
      const remove = () => {
        DelPrudutos(i.id);
      };

      const valor2Original = i.vFinal.replace('.', '');
      const ValorProd = Number(valor2Original.replace(',', '.'));
      const desc = prazo === 'Antecipado' ? ValorProd * 0.05 : 0;
      const ValorGeral =
        prazo === 'Antecipado' ? ValorProd - ValorProd * 0.05 : ValorProd;

      if (!i.Qtd) {
        i.Qtd = 1;
      }

      const total = () => {
        if (!i.Qtd || i.Qtd === '') {
          return i.total;
        }
        if (i.expo === true && i.mont === false) {
          const valor1: number = i.Qtd;
          const valor2: number = ValorGeral * 1.1;
          const multplica = valor2 * valor1;
          return multplica.toFixed(2);
        }
        if (i.mont === true && i.expo === false) {
          const valor1: number = i.Qtd;
          const valor2: number = ValorGeral * 1.1;
          const multplica = valor2 * valor1;
          return multplica.toFixed(2);
        }
        if (i.mont === true && i.expo === true) {
          const valor1: number = i.Qtd;
          const valor2: number = ValorGeral * 1.2;
          const multplica = valor2 * valor1;
          return multplica.toFixed(2);
        } else {
          const valor1: number = i.Qtd;
          const valor2: number = ValorGeral;
          const multplica = valor2 * valor1;
          return multplica.toFixed(2);
        }
      };

      const codig = () => {
        if (!i.codg || i.codg === '') {
          const dt = { codg: Id };
          handleAdd(dt, i.id);
          return Id;
        }
        return Id;
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
                onChange={(e) => {
                  const valor = e.target.value;
                  const dt = { Qtd: valor };
                  handleAdd(dt, i.id);
                }}
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
                onChange={(e) => {
                  const valor = e.target.checked;
                  const dt = { mont: valor };
                  handleAdd(dt, i.id);
                }}
              />
            </Td>
            <Td>
              <Checkbox
                borderColor="whatsapp.600"
                rounded="md"
                px="3"
                onChange={(e) => {
                  const valor = e.target.checked;
                  const dt = { expo: valor };
                  handleAdd(dt, i.id);
                }}
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
                  if (ListItens.length === 1) {
                    const [total] = ListItens.map((i) => i.total);
                    setTotalGeral(total);
                  }
                  if (ListItens.length > 1) {
                    const total = ListItens.map((i) => i.total).reduce(
                      (acc, valorAtual) => acc + valorAtual,
                    );
                  }
                  setTotalGeral(total);
                  const filter = paymentExpiration.filter((f) => f.id === i.id);
                  if (filter.length === 0) {
                    const dt2 = { id: i.id, desconto: desc };
                    setPaymentExpiration([dt2]);
                  }
                  if (filter.length === 1) {
                    setPaymentExpiration(
                      paymentExpiration.map((f) =>
                        f.id === i.id ? { ...f, desconto: desc } : f,
                      ),
                    );
                  }
                  if (paymentExpiration.length === 1) {
                    const [total] = paymentExpiration.map((i) => i.desconto);
                    setDesconto(total);
                  }
                  if (paymentExpiration.length > 1) {
                    const total = paymentExpiration
                      .map((i) => i.desconto)
                      .reduce((acc, valorAtual) => acc + valorAtual);
                    setDesconto(total);
                  }
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
    return resp;
  };
  const DelPrudutos = (x: any) => {
    const filterItens = ListItens.filter((i) => i.id !== x);
    setItens(filterItens);
  };

  const SalvarProdutos = async () => {
    const Date5 = new Date(date);
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

    const mapItens = ListItens.map((i) => {});
    const data: any = {
      cliente: cnpj,
      itens: ListItens,
      empresa: Loja,
      dataPedido: date,
      vencPedido: VencDate,
      vencPrint: VencDatePrint,
      condi: prazo,
      prazo: tipoprazo,
      totalGeral: 7000.0,
      vendedor: session.user.name,
      vendedorId: session.user.id,
      frete: frete,
      valorFrete: freteCif,
    };
    const url = '/api/query/post/proposta';

    await fetch(url, {
      method: 'POST',
      // body: JSON.stringify(data),
    })
      .then((res) => res.json)
      .then((resp) => console.log(resp))
      .catch((err) => console.log(err));
  };

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
      <Box display="flex" gap={8} alignItems="center" hidden={hidemPod}>
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

  console.log(totalGeral);

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
            <FormLabel
              htmlFor="cidade"
              fontSize="xs"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: 'gray.50',
              }}
            >
              Loja
            </FormLabel>
            <Select
              shadow="sm"
              size="xs"
              w="full"
              fontSize="xs"
              rounded="md"
              placeholder="Selecione uma Empresa"
              onChange={(e) => setLoja(e.target.value)}
            >
              <option value="Ribermax">RIBERMAX EMBALAGENS DE MADEIRA</option>
              <option value="Renato">RENATO HUGO</option>
              <option value="Bragheto">BRAGHETO PALETES E EMBALAGENS</option>
            </Select>
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
            <FormLabel
              htmlFor="cidade"
              fontSize="xs"
              fontWeight="md"
              color="gray.700"
              _dark={{
                color: 'gray.50',
              }}
            >
              Tipos de prazo
            </FormLabel>
            <Select
              shadow="sm"
              size="xs"
              w="full"
              fontSize="xs"
              rounded="md"
              placeholder=" "
              onChange={(e) => setTipoPrazo(e.target.value)}
              value={tipoprazo}
            >
              {reqPrazo.map((p) => {
                return (
                  <>
                    <option key={p.id} value={p.attributes.valor}>
                      {p.attributes.titulo}
                    </option>
                  </>
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
              onChange={(e) => {
                const value = e.target.value;
                const regex = /[^0-9,.]/g;
                () => {
                  const sanitizedValue = value.replace(regex, '');
                  const numericValue = Number(sanitizedValue.replace(',', '.'));
                  setFreteCif(numericValue.toString());
                  const Mask: string = numericValue.toLocaleString('pt-br', {
                    style: 'currency',
                    currency: 'BRL',
                  });
                  setFreteCifMask(Mask);
                };
              }}
              value={freteCifMask}
            />
          </Box>
        </Box>
        <Box mt={12}>
          <Heading size="md">Itens da proposta comercial</Heading>
        </Box>
        <Box display="flex" gap={8} alignItems="center" mt={5} mx={5}>
          <Box>{disbleProd === true ? loadDiv() : ProdutiDiv()}</Box>
        </Box>
        <Box mt={16} w={'100%'} h={'48%'} overflowY={'auto'}>
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
                    <Tbody overflowY={'auto'}>{lista()}</Tbody>
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
            <chakra.p>Frete: {freteCifMask}</chakra.p>
            <chakra.p>Desconto: {!desconto ? 'R$ 0,00' : desconto}</chakra.p>
            <chakra.p>
              Valor Total: {!totalGeral ? 'R$ 0,00' : totalGeral}
            </chakra.p>
          </Flex>
          <Button colorScheme={'whatsapp'} onClick={SalvarProdutos}>
            Salvar Proposta
          </Button>
        </Box>
      </Flex>
    </>
  );
}
