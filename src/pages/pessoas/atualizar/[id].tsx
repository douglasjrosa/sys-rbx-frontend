import {
  chakra,
  Box,
  Button,
  FormControl,
  FormLabel,
  GridItem,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Textarea,
  Flex,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import ListaEmpresa from '../../../components/pessoas/listaEmpresa';
import { useRouter } from 'next/router';
import ListaEmpresaAt from '../../../components/pessoas/listaEmpresaAt';

export default function PessoaId() {
  const router = useRouter();
  const [ID, setId] = useState('');
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [obs, setObs] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [Empresas, setEmpresas] = useState([]);
  const [work, setWork] = useState([]);
  const [workId, setWorkId] = useState('');
  const [workNome, setWorkNome] = useState('');
  const [workfantasia, setWorkfantasia] = useState('');
  const [workEndereco, setWorkEndereco] = useState('');
  const [workNumero, setWorkNumero] = useState('');
  const [workComplemento, setWorkComplemento] = useState('');
  const [workBairro, setWorkBairro] = useState('');
  const [workCep, setWorkCep] = useState('');
  const [workCidade, setWorkCidade] = useState('');
  const [workUf, setWorkUf] = useState('');
  const [workFone, setWorkFone] = useState('');
  const [workCelular, setWorkCelular] = useState('');
  const [workSite, setWorkSite] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [workEmailNfe, setWorkEmailNfe] = useState('');
  const [workCNPJ, setWorkCNPJ] = useState('');
  const [empresaId, setEmpresaId] = useState([]);

  useEffect(() => {
    const GetPessoas = async () => {
      const id = router.query.id;
      const url = `/api/db/pessoas/consulta/${id}`;
      const response = await axios(url);
      const pessoa = await response.data.data;

      setId(pessoa.id);
      setNome(pessoa.attributes.nome);
      setWhatsapp(pessoa.attributes.whatsapp);
      setTelefone(pessoa.attributes.telefone);
      setEmail(pessoa.attributes.email);
      setObs(pessoa.attributes.obs);
      setEmpresas(pessoa.attributes.empresas.data);
    };
    GetPessoas();
    consultaEmpresa();
    if (empresa !== '' && workId === '') {
      consultaEmp();
    }
  }, []);

  const consultaEmpresa = () => {
    let url = '/api/db/empresas/getEmpresas/get';
    axios({
      method: 'GET',
      url: url,
    })
      .then(function (response) {
        console.log(response.data.data);
        setWork(response.data.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const consultaEmpresaId = async (e) => {
    const id = e.target.value;
    console.log(id);
    let url = '/api/db/empresas/consulta/' + id;
    await axios({
      method: 'GET',
      url: url,
    })
      .then(function (response) {
        console.log(response.data.data.id);
        setEmpresa(response.data.data.id);
        setWorkId(response.data.data.id);
        setWorkNome(response.data.data.attributes.nome);
        setWorkfantasia(response.data.data.attributes.fantasia);
        setWorkEndereco(response.data.data.attributes.endereco);
        setWorkNumero(response.data.data.attributes.numero);
        setWorkComplemento(response.data.data.attributes.complemento);
        setWorkBairro(response.data.data.attributes.bairro);
        setWorkCep(response.data.data.attributes.cep);
        setWorkCidade(response.data.data.attributes.cidade);
        setWorkUf(response.data.data.attributes.uf);
        setWorkFone(response.data.data.attributes.fone);
        setWorkCelular(response.data.data.attributes.celular);
        setWorkSite(response.data.data.attributes.site);
        setWorkEmail(response.data.data.attributes.email);
        setWorkEmailNfe(response.data.data.attributes.emailNfe);
        setWorkCNPJ(response.data.data.attributes.CNPJ);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const consultaEmp = async () => {
    const id = empresa;
    console.log(id);
    let url = '/api/db/empresas/consulta/' + id;
    await axios({
      method: 'GET',
      url: url,
    })
      .then(function (response) {
        console.log(response.data);
        setEmpresa(response.data.data.id);
        setWorkId(response.data.data.id);
        setWorkNome(response.data.data.attributes.nome);
        setWorkfantasia(response.data.data.attributes.fantasia);
        setWorkEndereco(response.data.data.attributes.endereco);
        setWorkNumero(response.data.data.attributes.numero);
        setWorkComplemento(response.data.data.attributes.complemento);
        setWorkBairro(response.data.data.attributes.bairro);
        setWorkCep(response.data.data.attributes.cep);
        setWorkCidade(response.data.data.attributes.cidade);
        setWorkUf(response.data.data.attributes.uf);
        setWorkFone(response.data.data.attributes.fone);
        setWorkCelular(response.data.data.attributes.celular);
        setWorkSite(response.data.data.attributes.site);
        setWorkEmail(response.data.data.attributes.email);
        setWorkEmailNfe(response.data.data.attributes.emailNfe);
        setWorkCNPJ(response.data.data.attributes.CNPJ);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const save = async () => {
    const id = Empresas.map((item) => item.id)
    const idemp = [...id, parseInt(empresa)];
    const data = {
      data: {
        nome: nome,
        whatsapp: whatsapp,
        telefone: telefone,
        obs: obs,
        status: true,
        empresas: idemp,
      },
    };
    const url = '/api/db/pessoas/atualizacao/' + ID;
    await axios({
      method: 'PUT',
      url: url,
      data: data,
    })
      .then((response) => {
        return response.data;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <Flex justifyContent={'center'} alignItems={'center'} h={'100vh'}>
        <Box
          _dark={{
            bg: '#111',
          }}
          px={5}
          pt={3}
        >
          <Box mt={[5, 0]}>
            <SimpleGrid
              display={{
                base: 'initial',
                md: 'grid',
              }}
              columns={{
                md: 1,
              }}
              spacing={{
                md: 6,
              }}
            >
              <GridItem
                mt={[5, null, 0]}
                colSpan={{
                  md: 2,
                }}
                border={'1px solid'}
                borderColor={'blackAlpha.400'}
                rounded={20}
                bg="#edf3f8"
              >
                <chakra.form
                  shadow="base"
                  rounded={[null, 20]}
                  overflow={{
                    sm: 'hidden',
                  }}
                >
                  <Stack
                    px={4}
                    py={3}
                    _dark={{
                      bg: '#141517',
                    }}
                    spacing={6}
                  >
                    <SimpleGrid columns={12} spacing={3}>
                      <Heading as={GridItem} colSpan={12} size="lg">
                        Cadastro de cliente
                      </Heading>
                    </SimpleGrid>
                    <Heading as={GridItem} colSpan={12} size="sd">
                      Dados do Cliente
                    </Heading>
                    <SimpleGrid columns={9} spacing={3}>
                      <FormControl as={GridItem} colSpan={[12, 5, 2]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                          color="gray.700"
                          _dark={{
                            color: 'gray.50',
                          }}
                        >
                          nome
                        </FormLabel>
                        <Input
                          type="text"
                          placeholder="nome completo"
                          _placeholder={{ color: 'inherit' }}
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          textTransform={'uppercase'}
                          onChange={(e) => setNome(e.target.value)}
                          value={nome}
                        />
                      </FormControl>

                      <FormControl as={GridItem} colSpan={[12, 6, 2]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                          color="gray.700"
                          _dark={{
                            color: 'gray.50',
                          }}
                        >
                          Email
                        </FormLabel>
                        <Input
                          type="text"
                          placeholder="email.email@email.com.br"
                          _placeholder={{ color: 'inherit' }}
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          onChange={(e) => setEmail(e.target.value)}
                          value={email}
                        />
                      </FormControl>
                      <FormControl as={GridItem} colSpan={[12, 3, null, 1]}>
                        <FormLabel
                          htmlFor="cep"
                          fontSize="xs"
                          fontWeight="md"
                          color="gray.700"
                          _dark={{
                            color: 'gray.50',
                          }}
                        >
                          Telelfone
                        </FormLabel>
                        <Input
                          type="text"
                          placeholder="(00) 0000-0000"
                          _placeholder={{ color: 'inherit' }}
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          onChange={(e) => setTelefone(e.target.value)}
                          value={telefone}
                        />
                      </FormControl>

                      <FormControl as={GridItem} colSpan={[12, 6, null, 1]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                          color="gray.700"
                          _dark={{
                            color: 'gray.50',
                          }}
                        >
                          whatsapp
                        </FormLabel>
                        <Input
                          type="text"
                          placeholder="(00) 0 0000-0000"
                          _placeholder={{ color: 'inherit' }}
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          onChange={(e) => setWhatsapp(e.target.value)}
                          value={whatsapp}
                        />
                      </FormControl>
                    </SimpleGrid>
                  </Stack>
                  <Stack
                    px={4}
                    py={3}
                    _dark={{
                      bg: '#141517',
                    }}
                    spacing={3}
                  >
                    <SimpleGrid columns={12} spacing={3}>
                      <Heading as={GridItem} colSpan={12} size="sd">
                        Observações
                      </Heading>
                      <Box as={GridItem} colSpan={12} m="auto">
                        <Textarea
                          w={['80vw', '70vw']}
                          borderColor="gray.500"
                          placeholder="Especifique aqui, todos os detalhes do cliente"
                          _placeholder={{ color: 'inherit' }}
                          size="sm"
                          resize={'none'}
                          onChange={(e) => setObs(e.target.value)}
                          value={obs}
                        />
                      </Box>
                    </SimpleGrid>

                    <SimpleGrid columns={12} spacing={5}>
                      <Heading as={GridItem} colSpan={12} mb={3} size="sd">
                        Empresas
                      </Heading>
                      <FormControl as={GridItem} colSpan={[12, 9]}>
                        {workNome === '' ? null : (
                          <ListaEmpresa
                            id={workId}
                            nome={workNome}
                            fantasia={workfantasia}
                            endereco={workEndereco}
                            numero={workNumero}
                            complemento={workComplemento}
                            bairro={workBairro}
                            cep={workCep}
                            cidade={workCidade}
                            uf={workUf}
                            fone={workFone}
                            celular={workCelular}
                            site={workSite}
                            email={workEmail}
                            emailNfe={workEmailNfe}
                            CNPJ={workCNPJ}
                          />
                        )}
                        {Empresas.map((item) => {
                          return (
                            <ListaEmpresaAt
                              idPessoa={ID}
                              id={item.id}
                              nome={item.attributes.nome}
                              fantasia={item.attributes.fantasia}
                              endereco={item.attributes.endereco}
                              numero={item.attributes.numero}
                              complemento={item.attributes.complemento}
                              bairro={item.attributes.bairro}
                              cep={item.attributes.cep}
                              cidade={item.attributes.cidade}
                              uf={item.attributes.uf}
                              fone={item.attributes.fone}
                              celular={item.attributes.celular}
                              site={item.attributes.site}
                              email={item.attributes.email}
                              emailNfe={item.attributes.emailNfe}
                              CNPJ={item.attributes.CNPJ}
                            />
                          );
                        })}
                      </FormControl>

                      <FormControl as={GridItem} colSpan={[12, 3]}>
                        <Heading mb={3} size="xs">
                          empresa
                        </Heading>
                        <FormLabel
                          htmlFor="prazo pagamento"
                          fontSize="xs"
                          fontWeight="md"
                          color="gray.700"
                          _dark={{
                            color: 'gray.50',
                          }}
                        >
                          Empresa relacionada
                        </FormLabel>
                        <Select
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          fontSize="xs"
                          rounded="md"
                          placeholder="Selecione uma tabela"
                          onChange={consultaEmpresaId}
                          value={workId}
                        >
                          {work.map((item) => {
                            return (
                              // eslint-disable-next-line react/jsx-key
                              <option value={item.id}>
                                {item.attributes.nome}
                              </option>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </SimpleGrid>
                  </Stack>
                  <Box
                    px={{
                      base: 4,
                      sm: 6,
                    }}
                    py={5}
                    pb={[12, null, 10]}
                    _dark={{
                      bg: '#121212',
                    }}
                    textAlign="right"
                  >
                    <Button
                      type="submit"
                      colorScheme="red"
                      me={5}
                      _focus={{
                        shadow: '',
                      }}
                      fontWeight="md"
                    >
                      Cancelar
                    </Button>
                    <Button
                      colorScheme="whatsapp"
                      _focus={{
                        shadow: '',
                      }}
                      fontWeight="md"
                      onClick={save}
                    >
                      Save
                    </Button>
                  </Box>
                </chakra.form>
              </GridItem>
            </SimpleGrid>
          </Box>
        </Box>
      </Flex>
    </>
  );
}
