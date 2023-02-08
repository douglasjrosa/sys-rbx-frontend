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
  Spinner,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  chakra,
  Th,
  Thead,
  Tr,
  useToast,
  Checkbox,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { BiPlusCircle } from 'react-icons/bi';
import { BsTrash } from 'react-icons/bs';
import { DateIso } from '../../components/data/Date';
import Loading from '../../components/elements/loading';
import { useSession } from 'next-auth/react';

const tempo = DateIso;

export default function Proposta() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<boolean>(true);
  const [Enpresa, setEmpresa] = useState([]);
  const [Produtos, SetProdutos] = useState([]);
  const [ListItens, setItens] = useState([]);
  const [itenId, setItenId] = useState('');
  const [date, setDate] = useState(tempo);
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const toast = useToast();

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
      console.log(resp);
      setEmpresa(resp);
      setLoading(false);
    })();
  }, []);

  const ConsultProd = async () => {
    setLoading(true);
    const url = '/api/query/get/produto/cnpj/' + cnpj;
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify(email),
    })
      .then((resp) => resp.json())
      .then((resposta) => {
        const retonoIdeal = resposta.status === false ? [] : resposta;
        SetProdutos(retonoIdeal);
        console.log(Produtos);
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
    const filter = ListItens.filter((i) => i.prodId === itenId);
    if (itenId.length === 0) {
      toast({
        title: 'Selecione um Produto',
        position: 'top-right',
        status: 'warning',
        isClosable: true,
      });
      setLoading(false);
    } else if (filter.length !== 0) {
      toast({
        title: 'Iten já adicionado',
        position: 'top-right',
        status: 'warning',
        isClosable: true,
      });
      setLoading(false);
    } else {
      setLoading(true);
      const url = '/api/query/get/produto/id/' + itenId;
      await fetch(url, {
        method: 'POST',
        body: JSON.stringify(email),
      })
        .then((resp) => resp.json())
        .then((resposta) => {
          console.log(ListItens);
          if (ListItens.length !== 0) {
            const intero = [...ListItens, resposta];
            setItens(intero);
            setLoading(false);
          } else {
            setItens([resposta]);
            setLoading(false);
          }
          setItenId('');
        })
        .catch((err) => console.log(err));
    }
  };

  const handleAdd = (Obj: any, Id: number) => {
    const [ListaObj] = ListItens.filter((i) => i.prodId === Id);
    const intero = Object.assign(ListaObj, Obj);
    setItens((ListItens) => {
      let newArray = [...ListItens];
      let index = newArray.findIndex((element) => element.id === Id);
      newArray[index] = intero;
      return newArray;
    });
  };

  const lista = () => {
    const resp = ListItens.map((i, x) => {
      const Id = i.prodId;
      const remove = () => {
        DelPrudutos(Id);
      };

      const total = () => {
        if (!i.unid || i.unid === '') {
          return '0,00';
        }
        if (!i.desconto || i.desconto === '') {
          const valor1: number = i.unid;
          const valor2Original = i.vFinal.replace('.', '');
          const valor2: number = Number(valor2Original.replace(',', '.'));
          const multplica = valor1 * valor2;
          return multplica.toFixed(2);
        } else {
          const valor1: number = i.unid;
          const valor2Original = i.vFinal.replace('.', '');
          const valor2: number = Number(valor2Original.replace(',', '.'));
          const descontoOriginal = i.desconto;
          const teste = descontoOriginal.indexOf(',') !== -1 ? true : false;
          if (teste == true) {
            const multplica = valor1 * valor2;
            const desc = Number(descontoOriginal.replace(',', '.'));
            const resp = multplica * (1 - desc / 100);
            return resp.toFixed(2);
          } else {
            const multplica = valor1 * valor2;
            const resp = multplica * (1 - descontoOriginal / 100);
            return resp.toFixed(2);
          }
        }
      };

      const codig = () => {
        if (!i.codg || i.codg === '') {
          const dt = { codg: Id };
          handleAdd(dt, Id);
          return Id;
        }
        return Id;
      };

      return (
        <>
          <Tr h={3} key={Id}>
            <Td px={3} py={2} isNumeric>
              {x + 1}
            </Td>
            <Td px={3} py={2} ps={8}>
              {i.nomeProd}
            </Td>
            <Td px={2} py={2} textAlign={'center'}>
              {codig()}
            </Td>
            <Td px={2} py={2}>
              <Input
                type={'text'}
                size="xs"
                borderColor="whatsapp.600"
                rounded="md"
                focusBorderColor="whatsapp.400"
                _hover={{
                  borderColor: 'whatsapp.600',
                }}
                onChange={(e) => {
                  const valor = e.target.value;
                  const dt = { unid: valor };
                  handleAdd(dt, Id);
                }}
              />
            </Td>
            <Td textAlign={'center'}>{i.altura}</Td>
            <Td textAlign={'center'}>{i.largura}</Td>
            <Td textAlign={'center'}>{i.comprimento}</Td>
            <Td px={2} py={2}>
              <Input
                type={'text'}
                size="xs"
                borderColor="whatsapp.600"
                rounded="md"
                focusBorderColor="whatsapp.400"
                _hover={{
                  borderColor: 'whatsapp.600',
                }}
                onChange={(e) => {
                  const valor = e.target.value;
                  const dt = { desconto: valor };
                  handleAdd(dt, Id);
                }}
              />
            </Td>
            <Td textAlign={'center'}>{i.vFinal}</Td>
            <Td textAlign={'center'}>{total()}</Td>
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
  const DelPrudutos = (Id: any) => {
    console.log(Id);
    const filterItens = ListItens.filter((i) => i.prodId !== Id);
    console.log(filterItens);
    setItens(filterItens);
  };

  const SalvarProdutos = async () => {
    const data: any = {
      empresa: cnpj,
      periodo: date,
      vendedor: session.user.name,
      responsavel: responsavel,
      itens: ListItens,
    };
    const url = '/api/query/post/proposta';

    await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
    })
      .then((res) => res.json)
      .then((resp) => console.log(resp))
      .catch((err) => console.log(err));
  };
  console.log(Produtos);

  if (loading) {
    return <Loading size="200px">Carregando...</Loading>;
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
              Aos cuidados de
            </FormLabel>
            <Input
              shadow="sm"
              size="sm"
              w="full"
              fontSize="xs"
              rounded="md"
              placeholder="Selecione uma Empresa"
              onChange={(e) => setResponsavel(e.target.value)}
              value={responsavel}
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
              Condição de pagamento
            </FormLabel>
            <Select
              shadow="sm"
              size="xs"
              w="full"
              fontSize="xs"
              rounded="md"
              placeholder="Selecione uma Empresa"
              onChange={(e) => setCnpj(e.target.value)}
              value={cnpj}
            >
              <option value="5%">Antecipado</option>
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
              Loja
            </FormLabel>
            <Select
              shadow="sm"
              size="xs"
              w="full"
              fontSize="xs"
              rounded="md"
              placeholder="Selecione uma Empresa"
              // onChange={(e) => setCnpj(e.target.value)}
              // value={cnpj}
            >
              <option value="Ribermax Embalagens de Madeira">
                RIBERMAX EMBALAGENS DE MADEIRA
              </option>
              <option value="Renato">{}</option>
              <option value="Bragheto Paletes e Embalagens">
                BRAGHETO PALETES E EMBALAGENS
              </option>
            </Select>
          </Box>
        </Box>
        <Box mt={12}>
          <Heading size="md">Itens da proposta comercial</Heading>
        </Box>
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
              mt={5}
              color={'whatsapp.600'}
              cursor="pointer"
              onClick={addItens}
            />
          </Box>
        </Box>
        <Box mt={16} w={'100%'} h={'48%'} overflowY={'auto'}>
          <Box>
            <TableContainer>
              <Table variant="striped" colorScheme="green">
                <Thead>
                  <Tr>
                    <Th px={2} py={1}></Th>
                    <Th w={'35%'}>Item</Th>
                    <Th w={'10%'}>Código</Th>
                    <Th w={'5%'}>Un</Th>
                    <Th w={'10%'}>altura</Th>
                    <Th w={'10%'}>largura</Th>
                    <Th w={'10%'}>comprimento</Th>
                    <Th w={'5%'}>Desc %</Th>
                    <Th w={'5%'}>Preço un</Th>
                    <Th w={'5%'}>Preço total</Th>
                    <Th textAlign={'center'}>
                      <Icon as={BsTrash} boxSize={5} color={'whatsapp.600'} />
                    </Th>
                  </Tr>
                </Thead>
                <Tbody overflowY={'auto'}>{lista()}</Tbody>
              </Table>
            </TableContainer>
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
          <chakra.p>
            Total de itens: {ListItens.length === 0 ? '' : ListItens.length}
          </chakra.p>
          <Button colorScheme={'whatsapp'} onClick={SalvarProdutos}>
            Salvar Proposta
          </Button>
        </Box>
      </Flex>
    </>
  );
}
