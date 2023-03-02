/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
  chakra,
  Flex,
  FormControl,
  FormLabel,
  GridItem,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Textarea,
  Toast,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import { cpf } from 'cpf-cnpj-validator';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { mask, unMask } from 'remask';
import { RelaciomentoEmpr } from '../../../components/elements/lista/relacionamentoEmpresa';
import ListaEmpresa from '../../../components/pessoas/listaEmpresa';

export default function Cadastro() {
  const router = useRouter();
  const { data: session } = useSession();
  const toast = useToast();
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [obs, setObs] = useState('');
  const [Empresa, setEmpresa] = useState<any>([]);
  const [CPF, setCPF] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [work, setWork] = useState([]);
  const [whatsappMask, setWhatsappMask] = useState('');
  const [telefoneMask, setTelefoneMask] = useState('');
  const [CepMask, setCepMask] = useState('');
  const [CpfMask, setCpfMask] = useState('');

  useEffect(() => {
    setWork(Empresa.map((i: { id: any }) => i.id));
  }, [Empresa]);

  const MaskWhatsapp = (e: any) => {
    const originalVelue = unMask(e.target.value);
    const maskedValue = mask(originalVelue, ['(99) 9 9999-9999']);
    setWhatsapp(originalVelue);
    setWhatsappMask(maskedValue);
  };

  const MaskTel = (e: any) => {
    const originalVelue = unMask(e.target.value);
    const maskedValue = mask(originalVelue, ['(99) 9999-9999']);
    setTelefone(originalVelue);
    setTelefoneMask(maskedValue);
  };

  const MaskCpf = (e: any) => {
    const originalVelue = unMask(e.target.value);
    const maskedValue = mask(originalVelue, ['999.999.999-99']);
    setCPF(originalVelue);
    setCpfMask(maskedValue);
  };

  const CEP = (e: any) => {
    const originalVelue = unMask(e.target.value);
    const maskedValue = mask(originalVelue, ['99.999-999']);
    setCepMask(maskedValue);
    setCep(originalVelue);
  };


  const NUMERO = (e: any) => {
    const data = e.target.value.replace(/[a-zA-Z]+/g, '');
    setNumero(data);
  };

  const resent = () => {
    setTimeout(() => {
      router.back();
    }, 1000);
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
    const date = new Date();
    const dateIsso = date.toISOString();
    const historico = {
      date: dateIsso,
      vendedor: session.user.name,
      msg: `cinete ${nome} foi cadastrado`,
    };
    const data = {
      data: {
        nome: nome,
        whatsapp: whatsapp,
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
        empresas: work,
        history: [historico],
      },
    };
    console.log(data);
    const url = '/api/db/pessoas/Post';

    if (!nome) {
      toast({
        title: 'Como devemos chamar esse cliente',
        description:
          'Não te disseram que  é falta de educação não chamar as pessoas pelo nome!',
        status: 'warning',
        duration: 6000,
        isClosable: true,
      });
    } else if (!telefone && !whatsapp) {
      toast({
        title: 'Sem numero de contato',
        description:
          'Desse jeito não tem como você ou a equipe entrar em contato com o cliente!',
        status: 'warning',
        duration: 6000,
        isClosable: true,
      });
    } else {
      await axios({
        method: 'POST',
        url: url,
        data: data,
      })
        .then((response) => {
          console.log(response);
          resent();
          toast({
            title: 'salvo',
            description: response.data,
            status: 'warning',
            duration: 6000,
            isClosable: true,
          });
          return response.data;
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  function getEmpresa(empresa: any) {
    setEmpresa([...Empresa, empresa]);
  }

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
                          onChange={(e: any) => setNome(e.target.value)}
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
                          onChange={MaskCpf}
                          onBlur={(e: any) => {
                            const cpfv = unMask(e.target.value);
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
                          value={CpfMask}
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
                          value={CepMask}
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
                          onChange={(e: any) => setEmail(e.target.value)}
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
                          onChange={(e: any) => setObs(e.target.value)}
                          value={obs}
                        />
                      </Box>
                    </SimpleGrid>

                    <SimpleGrid columns={12} spacing={5}>
                      <Heading as={GridItem} colSpan={12} mb={3} size="sd">
                        Empresas
                      </Heading>
                      <FormControl as={GridItem} colSpan={[12, 8]}>
                        <SimpleGrid
                          p="1rem"
                          columns={{ base: 1, md: 3 }}
                          row={{ base: 1, md: 3 }}
                          spacing={{ base: 3, md: 5 }}
                        >
                          {Empresa.map((i: any, x: number) => {
                            return (
                              <ListaEmpresa
                                key={x}
                                index={x}
                                id={i.id}
                                nome={i.attributes.nome}
                                fantasia={i.attributes.fantasia}
                                endereco={i.attributes.endereco}
                                numero={i.attributes.numero}
                                complemento={i.attributes.complemento}
                                bairro={i.attributes.bairro}
                                cep={i.attributes.cep}
                                cidade={i.attributes.cidade}
                                uf={i.attributes.uf}
                                fone={i.attributes.fone}
                                celular={i.attributes.celular}
                                site={i.attributes.site}
                                email={i.attributes.email}
                                emailNfe={i.attributes.emailNfe}
                                CNPJ={i.attributes.CNPJ}
                              />
                            );
                          })}
                        </SimpleGrid>
                      </FormControl>

                      <FormControl ms={10} as={GridItem} colSpan={[12, 3]}>
                        <RelaciomentoEmpr onGetValue={getEmpresa} />
                      </FormControl>
                    </SimpleGrid>
                  </Stack>
                  <Box
                    px={{
                      base: 4,
                      sm: 6,
                    }}
                    py={5}
                    pb={[12, null, 5]}
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
                      onClick={() => router.back()}
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
