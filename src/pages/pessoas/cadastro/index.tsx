/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
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
  Icon,
  Toast,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import { mask, unMask } from 'remask';
import ListaEmpresa from '../../../components/pessoas/listaEmpresa';
import { cpf } from 'cpf-cnpj-validator';
import { MdAddBusiness } from "react-icons/md";
import { useRouter } from 'next/router';

export default function Cadastro() {
  const router = useRouter()
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [obs, setObs] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [CPF, setCPF] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');

  const [work, setWork] = useState([]);

  //mask
  const [whatsappMask, setWhatsappMask] = useState('');
  const [telefoneMask, setTelefoneMask] = useState('');

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

  const consultaEmpresa = () => {
    let url = '/api/db/empresas/getEmpresas/get';
    axios({
      method: 'GET',
      url: url,
    })
      .then(function (response) {
        console.log(response.data);
        setWork(response.data.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  useEffect(() => {
    consultaEmpresa();
    if (empresa !== '' && workId === '') {
      consultaEmp();
    }
  }, []);

  const MaskWhatsapp = (e) => {
    const originalVelue = unMask(e.target.value);
    const maskedValue = mask(originalVelue, ['(99) 9 9999-9999']);
    setWhatsapp(originalVelue);
    setWhatsappMask(maskedValue);
  };

  const MaskTel = (e) => {
    const originalVelue = unMask(e.target.value);
    const maskedValue = mask(originalVelue, ['(99) 9999-9999']);
    setTelefone(originalVelue);
    setTelefoneMask(maskedValue);
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
    let url = '/api/db/empresas/consulta/' + id ;
    await axios({
      method: 'GET',
      url: url,
    })
      .then(function (response) {
        console.log(response.data.data);
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

  const resent = () => {
    setTimeout(() => {
      router.back()
    }, 500)
  };

  const CEP = (e) => {
    const data = e.target.value.replace(/[a-zA-Z]+/g, '');
    setCep(data);
  };

  const NUMERO = (e) => {
    const data = e.target.value.replace(/[a-zA-Z]+/g, '');
    setNumero(data);
  };

  const checkCep = async () => {
    const url = `https://viacep.com.br/ws/${cep}/json/`;
    await axios(url)
      .then((res) => {
        setEndereco(res.data.logradouro);
        setCidade(res.data.localidade);
        setBairro(res.data.bairro);
        setUf(res.data.uf);
      })
      .catch((err) => console.log(err));
  };

  const save = async () => {
    const data1 = {
      data: {
        nome: nome,
        celular: whatsapp,
        telefone: telefone,
        email: email,
        CPF: CPF,
        CEP: cep,
        uf: uf,
        endereco: endereco,
        numero: numero,
        bairro: bairro,
        cidade: cidade,
        obs: obs,
        status: 'true',
        empresas: workfantasia,
      },
    };

    const UrlRb = '/api/db_bling/pessoas/Post';
    await axios({
      method: 'POST',
      url: UrlRb,
      data: data1,
    })
      .then(async (response) => {
        console.log(response);
        if (response.data.retorno.erros[0].erro.cod === 60) {
          console.log('O pessoa não pode ser cadastrado sem nome');
        }
        if (response.data.retorno.erros[0].erro.cod === 62) {
          console.log(
            'O pessoa não pode ser cadastrado CPF, ou CPF esta incorreto',
          );
        }
        if (response.data.retorno.erros[0].erro.cod === 68) {
          console.log('O pessoa com CPF esta incorreto, favor verificar');
        }
        if (response.data.retorno.erros[0].erro.cod === 70) {
          console.log('O pessoa já cadastrado');
        } else {
          const data = {
            data: {
              nome: nome,
              celular: whatsapp,
              telefone: telefone,
              email: email,
              CPF: CPF,
              CEP: cep,
              uf: uf,
              endereco: endereco,
              numero: numero,
              bairro: bairro,
              cidade: cidade,
              obs: obs,
              status: true,
              empresas: [parseInt(empresa)],
            },
          };

          const url = '/api/pessoas/Post';

          await axios({
            method: 'POST',
            url: url,
            data: data,
          })
            .then((response) => {
              console.log(response);
              resent();
              return response.data;
            })
            .catch((err) => {
              console.log(err);
            });
        }
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

                      <FormControl as={GridItem} colSpan={[12, 5, 2]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                          color="gray.700"
                          _dark={{
                            color: 'gray.50',
                          }}
                        >
                          CPF
                        </FormLabel>
                        <Input
                          type="text"
                          placeholder="CPF"
                          _placeholder={{ color: 'inherit' }}
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          textTransform={'uppercase'}
                          maxLength={11}
                          onChange={(e) => {
                            const cpfv = e.target.value.replace(
                              /[a-zA-Z]+/g,
                              '',
                            );

                            setCPF(cpfv);
                          }}
                          onBlur={(e) => {
                            const cpfv = e.target.value.replace(
                              /[a-zA-Z]+/g,
                              '',
                            );
                            const validcpf = cpf.isValid(cpfv);

                            if (cpfv.length < 11) {
                              Toast({
                                title: 'erro no CPF',
                                description: 'CPF menor que esperado',
                                status: 'error',
                                duration: 7000,
                                position: 'top-right',
                                isClosable: true,
                              });
                            }
                            if (cpfv.length > 11) {
                              Toast({
                                title: 'erro no CPF',
                                description: 'CPF imcompativel',
                                status: 'error',
                                duration: 7000,
                                position: 'top-right',
                                isClosable: true,
                              });
                            }

                            if (validcpf === false) {
                              Toast({
                                title: 'erro no CPF',
                                description: 'CPF incorreto',
                                status: 'error',
                                duration: 7000,
                                position: 'top-right',
                                isClosable: true,
                              });
                            }
                          }}
                          value={CPF}
                        />
                      </FormControl>

                      <FormControl as={GridItem} colSpan={[12, 3, null, 1]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                          color="gray.700"
                          _dark={{
                            color: 'gray.50',
                          }}
                        >
                          cep
                        </FormLabel>
                        <Input
                          type="text"
                          placeholder="cep"
                          _placeholder={{ color: 'inherit' }}
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          textTransform={'uppercase'}
                          onChange={CEP}
                          onBlur={checkCep}
                          value={cep}
                        />
                      </FormControl>

                      <FormControl as={GridItem} colSpan={[12, 5, 2]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                          color="gray.700"
                          _dark={{
                            color: 'gray.50',
                          }}
                        >
                          Endereço
                        </FormLabel>
                        <Input
                          type="text"
                          _placeholder={{ color: 'inherit' }}
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          textTransform={'uppercase'}
                          value={endereco}
                        />
                      </FormControl>

                      <FormControl as={GridItem} colSpan={[12, 3, null, 1]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                          color="gray.700"
                          _dark={{
                            color: 'gray.50',
                          }}
                        >
                          Nº
                        </FormLabel>
                        <Input
                          type="text"
                          _placeholder={{ color: 'inherit' }}
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          onChange={NUMERO}
                          value={numero}
                        />
                      </FormControl>

                      <FormControl as={GridItem} colSpan={[12, 5, 2]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                          color="gray.700"
                          _dark={{
                            color: 'gray.50',
                          }}
                        >
                          Cidade
                        </FormLabel>
                        <Input
                          type="text"
                          _placeholder={{ color: 'inherit' }}
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          value={cidade}
                        />
                      </FormControl>

                      <FormControl as={GridItem} colSpan={[12, 5, 2]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                          color="gray.700"
                          _dark={{
                            color: 'gray.50',
                          }}
                        >
                          Bairro
                        </FormLabel>
                        <Input
                          type="text"
                          _placeholder={{ color: 'inherit' }}
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          value={bairro}
                        />
                      </FormControl>

                      <FormControl as={GridItem} colSpan={[12, 3, null, 1]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                          color="gray.700"
                          _dark={{
                            color: 'gray.50',
                          }}
                        >
                          uf
                        </FormLabel>
                        <Input
                          type="text"
                          _placeholder={{ color: 'inherit' }}
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          value={uf}
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
                          onChange={MaskTel}
                          value={telefoneMask}
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
                          onChange={MaskWhatsapp}
                          value={whatsappMask}
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
                      </FormControl>

                      <FormControl as={GridItem} colSpan={[12, 3]}>
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
                        <Box mt={5}>

                        <Button w={'100%'} colorScheme={'telegram'}>Adicionar{' '} <Icon as={MdAddBusiness} /></Button>
                        </Box>
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
