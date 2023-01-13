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
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { BiPlusCircle } from 'react-icons/bi';
import { BsTrash } from 'react-icons/bs';

export default function Proposta() {
  const [Enpresa, setEmpresa] = useState([]);
  const [Produtos, SetProdutos] = useState([]);
  const [ListItens, setItens] = useState([]);
  const [itenId, setItenId] = useState('');
  const [search, setSearch] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [searchName, setSearchName] = useState('');

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
    })();
  }, []);

  const ConsultProd = async () => {
    const url = '/api/query/get/produto/cnpj/' + cnpj;
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify(email),
    })
      .then((resp) => resp.json())
      .then((resposta) => {
        const retonoIdeal = resposta.status === false ? [] : resposta;
        SetProdutos(retonoIdeal);
      })
      .catch((err) => console.log(err));
  };

  const addItens = async () => {
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
        } else {
          setItens([resposta]);
        }
        setItenId('');
      })
      .catch((err) => console.log(err));
  };

  const lista = () => {
    const resp = ListItens.map((i, x) => {
      const Id = i.prodId;
      const remove = () => {
        DelPrudutos(Id);
      };
      return (
        <>
          <Tbody>
            <Tr h={3} key={Id}>
              <Td px={3} py={2} isNumeric>
                {x + 1}
              </Td>
              <Td px={3} py={2} ps={8}>
                {i.nomeProd}
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
                />
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
                />
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
                />
              </Td>
              <Td textAlign={'center'}>25.4</Td>
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
                />
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
                />
              </Td>
              <Td>
                <Input
                  type={'text'}
                  size="xs"
                  borderColor="whatsapp.600"
                  rounded="md"
                  focusBorderColor="whatsapp.400"
                  _hover={{
                    borderColor: 'whatsapp.600',
                  }}
                />
              </Td>
              <Td>
                <Button onClick={remove}>
                  <BsTrash />
                </Button>
              </Td>
            </Tr>
          </Tbody>
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
  console.log(ListItens);
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
              onChange={(e) => setSearch(e.target.value)}
              value={search}
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
              // onChange={(e) => setSearch(e.target.value)}
              // value={search}
            />
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
              placeholder="Selecione uma Empresa"
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
        <Box mt={16} w={'100%'}>
          <Box>
            <TableContainer>
              <Table variant="striped" colorScheme="green">
                <TableCaption>
                  Lista de produtos adicionados para proposta comercial
                </TableCaption>
                <Thead>
                  <Tr>
                    <Th px={2} py={1}></Th>
                    <Th w={'35%'}>Item</Th>
                    <Th w={'10%'}>Código</Th>
                    <Th w={'5%'}>Un</Th>
                    <Th w={'5%'}>Qtde</Th>
                    <Th w={'10%'}>Preço lista</Th>
                    <Th w={'5%'}>Desc %</Th>
                    <Th w={'5%'}>Preço un</Th>
                    <Th w={'5%'}>Preço total</Th>
                    <Th>
                      <Icon as={BsTrash} boxSize={5} color={'whatsapp.600'} />
                    </Th>
                  </Tr>
                </Thead>
                {lista()}
              </Table>
            </TableContainer>
          </Box>
        </Box>
        <Box>
          {' '}
          <Button colorScheme={'whatsapp'}>Nova Proposta</Button>
        </Box>
      </Flex>
    </>
  );
}
