/* eslint-disable react/jsx-key */
/* eslint-disable react-hooks/exhaustive-deps */
import Loading from '@/components/elements/loading';
import { capitalizeWords } from '@/function/captalize';
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

export default function PessoaId() {
  const router = useRouter();
  const { data: session } = useSession();
  const toast = useToast();
  const id = router.query.id;
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [obs, setObs] = useState('');
  const [Empresa, setEmpresa] = useState<any>([]);
  const [CPF, setCPF] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [complemento, setComplemento] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [work, setWork] = useState([]);
  const [whatsappMask, setWhatsappMask] = useState('');
  const [telefoneMask, setTelefoneMask] = useState('');
  const [CepMask, setCepMask] = useState('');
  const [CpfMask, setCpfMask] = useState('');
  const [Departamento, setDepartamento] = useState('');
  const [Cargo, setCargo] = useState('');
  const [Dados, setDados] = useState([]);
  const [historico, sethistorico] = useState([]);
  const [loading, setloading] = useState(false);

  useEffect(() => {
    (async () => {
      setloading(true)
      const url = `/api/db/pessoas/consulta/${id}`;
      const response = await axios(url);
      const pessoa = await response.data.data;
      setNome(capitalizeWords(pessoa.attributes.nome));
      setWhatsapp(pessoa.attributes.whatsapp);
      const maskedValuezap = !pessoa.attributes.whatsapp
        ? ''
        : mask(pessoa.attributes.whatsapp, ['(99) 9 9999-9999']);
      setWhatsappMask(maskedValuezap);
      setTelefone(pessoa.attributes.telefone);
      const MaskedValueTel = !pessoa.attributes.telefone
        ? ''
        : mask(pessoa.attributes.telefone, ['(99) 9999-9999']);
      setTelefoneMask(MaskedValueTel);
      setEmail(pessoa.attributes.email);
      setObs(pessoa.attributes.obs);
      setEmpresa(pessoa.attributes.empresas.data);
      setDados(pessoa.attributes.empresas.data);
      setCPF(pessoa.attributes.CPF);
      const maskedValue = mask(pessoa.attributes.CPF, ['999.999.999-99']);
      setCpfMask(maskedValue);
      setCep(pessoa.attributes.CEP);
      const maskedValuecep = mask(pessoa.attributes.CEP, ['99.999-999']);
      setCepMask(maskedValuecep);
      setEndereco(capitalizeWords(pessoa.attributes.endereco));
      setNumero(pessoa.attributes.numero);
      setBairro(capitalizeWords(pessoa.attributes.bairro));
      setCidade(capitalizeWords(pessoa.attributes.cidade));
      setUf(pessoa.attributes.uf);
      setDepartamento(capitalizeWords(pessoa.attributes.departamento));
      setCargo(capitalizeWords(pessoa.attributes.cargo));
      sethistorico(pessoa.attributes.history);
      setloading(false);
    })();
  }, []);

  useEffect(() => {
    setWork(Empresa.map((i: { id: any }) => i.id));
  }, [Empresa]);

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

  const save = async () => {
    setloading(true)
    const date = new Date();
    const dateIsso = date.toISOString();

    const url = `/api/db/pessoas/consulta/${id}`;
    const response = await axios(url);
    const pessoa = await response.data.data;
    const Alteração =
      nome !== pessoa.attributes.nome
        ? 'O nome do cliente foi alterado'
        : whatsapp !== pessoa.attributes.whatsapp
        ? 'O WhatsApp do cliente foi alterado'
        : telefone !== pessoa.attributes.telefone
        ? 'O telefone do cliente foi alterado'
        : email !== pessoa.attributes.email
        ? 'O email do cliente'
        : CPF !== pessoa.attributes.CPF
        ? 'O CPF do cliente foi alterado'
        : cep !== pessoa.attributes.CEP
        ? 'O cep do cliente foi alterado'
        : uf !== pessoa.attributes.uf
        ? 'O Esado do cliente foi alterado'
        : endereco !== pessoa.attributes.endereco
        ? 'O endereco do cliente foi alterado'
        : numero !== pessoa.attributes.numero
        ? 'O numero do cliente foi alterado'
        : work !== pessoa.attributes.empresas.data.id
        ? 'O empresas do cliente foi alterado'
        : Departamento !== pessoa.attributes.departamento
        ? 'O departamento do cliente foi alteradp'
        : Cargo !== pessoa.attributes.cargo
        ? 'O Cargo do cliente foi alter'
        : '';
    const historicoAt = {
      date: dateIsso,
      vendedor: session?.user.name,
      msg: `cinete ${nome} foi atualizado`,
      alteração: Alteração,
    };

    const IdEmpresa = localStorage.getItem('id');

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
        empresas: IdEmpresa,
        history: [...historico, historicoAt],
        departamento: Departamento,
        cargo: Cargo,
        complemento: complemento,
      },
    };

    if (!nome) {
      toast({
        title: 'Como devemos chamar esse cliente',
        description: 'Obrigatorio ter o nome do cliente!',
        status: 'warning',
        duration: 6000,
        isClosable: true,
      });
    } else if (!telefone && !whatsapp) {
      toast({
        title: 'Sem numero de contato',
        description: 'É nessesario o numero de WhatsApp!',
        status: 'warning',
        duration: 6000,
        isClosable: true,
      });
    } else {
      const url = '/api/db/pessoas/atualizacao/' + id;
      await axios({
        method: 'PUT',
        url: url,
        data: data,
      })
        .then((response) => {
          toast({
            title: 'salvo',
            description: 'cliente atualizado',
            status: 'success',
            duration: 6000,
            isClosable: true,
          });
          setloading(false)
          setTimeout(() => {
            const idRet: any = localStorage.getItem('idRetorno')
            if(idRet){
            router.push(`/empresas/atualizar/${idRet}`)
            localStorage.removeItem('idRetorno')
            } else {
              router.push(`/empresas`)
            }
          }, 100);
        })
        .catch((err) => {
          setloading(false)
          console.log(err);
        });
    }
  };

  if (loading) {
    return <Loading size="200px">Carregando...</Loading>;
  }

  return (
    <>
    <Flex justifyContent={"center"} alignItems={"center"} h={"100vh"}>
        <Box
          _dark={{
            bg: "#111",
          }}
          px={5}
          pt={3}
        >
          <Box mt={[5, 0]}>
            <SimpleGrid
              display={{
                base: "initial",
                md: "grid",
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
                border={"1px solid"}
                borderColor={"blackAlpha.400"}
                rounded={20}
                bg="#edf3f8"
              >
                <chakra.form
                  shadow="base"
                  rounded={[null, 20]}
                  overflow={{
                    sm: "hidden",
                  }}
                >
                  <Stack
                    px={4}
                    py={3}
                    _dark={{
                      bg: "#141517",
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
                            color: "gray.50",
                          }}
                        >
                          Nome
                        </FormLabel>
                        <Input
                          type="text"
                          placeholder="nome completo"
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          onChange={(e: any) => setNome(capitalizeWords(e.target.value))}
                          value={nome}
                        />
                      </FormControl>

                      <FormControl as={GridItem} colSpan={[12, 5, 2]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                          color="gray.700"
                          _dark={{
                            color: "gray.50",
                          }}
                        >
                          CPF
                        </FormLabel>
                        <Input
                          type="text"
                          placeholder="CPF"
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"

                          onChange={MaskCpf}
                          onBlur={(e: any) => {
                            const cpfv = unMask(e.target.value);
                            const validcpf = cpf.isValid(cpfv);

                            if (cpfv.length < 11) {
                              Toast({
                                title: "erro no CPF",
                                description: "CPF menor que esperado",
                                status: "error",
                                duration: 7000,
                                position: "top-right",
                                isClosable: true,
                              });
                            }
                            if (cpfv.length > 11) {
                              Toast({
                                title: "erro no CPF",
                                description: "CPF imcompativel",
                                status: "error",
                                duration: 7000,
                                position: "top-right",
                                isClosable: true,
                              });
                            }

                            if (validcpf === false) {
                              Toast({
                                title: "erro no CPF",
                                description: "CPF incorreto",
                                status: "error",
                                duration: 7000,
                                position: "top-right",
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
                            color: "gray.50",
                          }}
                        >
                          Cep
                        </FormLabel>
                        <Input
                          type="text"
                          placeholder="cep"
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"

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
                            color: "gray.50",
                          }}
                        >
                          Endereço
                        </FormLabel>
                        <Input
                          type="text"
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"

                          onChange={(e: any) => setEndereco(capitalizeWords(e.target.value))}
                          value={endereco}
                        />
                      </FormControl>

                      <FormControl as={GridItem} colSpan={[12, 5, 3]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                          color="gray.700"
                          _dark={{
                            color: "gray.50",
                          }}
                        >
                          Complemento
                        </FormLabel>
                        <Input
                          type="text"
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"

                          onChange={(e: any) => setComplemento(capitalizeWords(e.target.value))}
                          value={complemento}
                        />
                      </FormControl>

                      <FormControl as={GridItem} colSpan={[12, 3, null, 1]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                          color="gray.700"
                          _dark={{
                            color: "gray.50",
                          }}
                        >
                          Nº
                        </FormLabel>
                        <Input
                          type="text"
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
                            color: "gray.50",
                          }}
                        >
                          Cidade
                        </FormLabel>
                        <Input
                          type="text"
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          onChange={(e: any) => setCidade(capitalizeWords(e.target.value))}
                          value={cidade}
                        />
                      </FormControl>

                      <FormControl as={GridItem} colSpan={[12, 5, 2]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                          color="gray.700"
                          _dark={{
                            color: "gray.50",
                          }}
                        >
                          Bairro
                        </FormLabel>
                        <Input
                          type="text"
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          onChange={(e: any) => setBairro(capitalizeWords(e.target.value))}
                          value={bairro}
                        />
                      </FormControl>

                      <FormControl as={GridItem} colSpan={[12, 3, null, 1]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                          color="gray.700"
                        >
                          UF.
                        </FormLabel>
                        <Input
                          type="text"
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          onChange={(e: any) => setUf(e.target.value)}
                          value={uf}
                        />
                      </FormControl>

                      <FormControl as={GridItem} colSpan={[12, 6, 2]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                          color="gray.700"
                        >
                          E-mail
                        </FormLabel>
                        <Input
                          type="text"
                          placeholder="email.email@email.com.br"
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
                        >
                          Telefone
                        </FormLabel>
                        <Input
                          type="text"
                          placeholder="(00) 0000-0000"
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
                        >
                          Whatsapp
                        </FormLabel>
                        <Input
                          type="text"
                          placeholder="(00) 0 0000-0000"
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
                      <FormControl as={GridItem} colSpan={[12, 6, null, 2]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                          color="gray.700"
                        >
                          Departamento
                        </FormLabel>
                        <Input
                          type="text"
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          onChange={(e) => setDepartamento(capitalizeWords(e.target.value))}
                          value={Departamento}
                        />
                      </FormControl>
                      <FormControl as={GridItem} colSpan={[12, 6, null, 2]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                          color="gray.700"
                        >
                          Cargo
                        </FormLabel>
                        <Input
                          type="text"
                          borderColor="gray.600"
                          focusBorderColor="brand.400"
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          onChange={(e) => setCargo(capitalizeWords(e.target.value))}
                          value={Cargo}
                        />
                      </FormControl>
                    </SimpleGrid>
                  </Stack>
                  <Stack
                    px={4}
                    py={3}
                    spacing={3}
                  >
                    <SimpleGrid columns={12} spacing={3}>
                      <Heading as={GridItem} colSpan={12} size="sd">
                        Observações
                      </Heading>
                      <Box as={GridItem} colSpan={12} m="auto">
                        <Textarea
                          w={["80vw", "70vw"]}
                          borderColor="gray.500"
                          placeholder="Especifique aqui, todos os detalhes do cliente"
                          size="sm"
                          resize={"none"}
                          onChange={(e: any) => setObs(capitalizeWords(e.target.value))}
                          value={obs}
                        />
                      </Box>
                    </SimpleGrid>
                  </Stack>
                  <Box
                    px={{
                      base: 4,
                      sm: 6,
                    }}
                    py={5}
                    pb={[12, null, 5]}
                    textAlign="right"
                  >
                    <Button
                      type="submit"
                      colorScheme="red"
                      me={5}
                      fontWeight="md"
                      onClick={() =>{
                        const idRet: any = localStorage.getItem('idRetorno')
                        router.push(`/empresas/atualizar/${idRet}`)
                        localStorage.removeItem('idRetorno')
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      colorScheme="whatsapp"
                      fontWeight="md"
                      onClick={save}
                    >
                      Salvar
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
