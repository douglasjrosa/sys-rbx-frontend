import { capitalizeWords } from "@/function/captalize";
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
} from "@chakra-ui/react";
import axios from "axios";
import { cpf } from "cpf-cnpj-validator";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { mask, unMask } from "remask";

export const FormPessoa = (props: { Data?: any, retornaData: any}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const toast = useToast();
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [obs, setObs] = useState('');
  const [CPF, setCPF] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [complemento, setComplemento] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [whatsappMask, setWhatsappMask] = useState('');
  const [telefoneMask, setTelefoneMask] = useState('');
  const [CepMask, setCepMask] = useState('');
  const [CpfMask, setCpfMask] = useState('');
  const [Departamento, setDepartamento] = useState('');
  const [Cargo, setCargo] = useState('');
  const [historico, sethistorico] = useState([]);

  useEffect(() => {
    if (props.Data) {
      const pessoa = props.Data;
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
    }
  }, [props.Data]);

  const MaskWhatsapp = (e: any) => {
    const originalVelue = unMask(e.target.value);
    const maskedValue = mask(originalVelue, ["(99) 9 9999-9999"]);
    setWhatsapp(originalVelue);
    setWhatsappMask(maskedValue);
  };

  const MaskTel = (e: any) => {
    const originalVelue = unMask(e.target.value);
    const maskedValue = mask(originalVelue, ["(99) 9999-9999"]);
    setTelefone(originalVelue);
    setTelefoneMask(maskedValue);
  };

  const MaskCpf = (e: any) => {
    const originalVelue = unMask(e.target.value);
    const maskedValue = mask(originalVelue, ["999.999.999-99"]);
    setCPF(originalVelue);
    setCpfMask(maskedValue);
  };

  const CEP = (e: any) => {
    const originalVelue = unMask(e.target.value);
    const maskedValue = mask(originalVelue, ["99.999-999"]);
    setCepMask(maskedValue);
    setCep(originalVelue);
  };

  const NUMERO = (e: any) => {
    const data = e.target.value.replace(/[a-zA-Z]+/g, "");
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
    const date = new Date();
    const dateIsso = date.toISOString();
    const historicoAt = {
      date: dateIsso,
      vendedor: session?.user.name,
      msg: `cinete ${nome} foi cadastrado`,
    };

    const data = {
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
      history: [...historico, historicoAt],
      departamento: Departamento,
      cargo: Cargo,
      complemento: complemento,
    };

    props.retornaData(data)

  };

  return (
    <>
      <Flex justifyContent={"center"} alignItems={"center"} h={"100%"} w={'100%'} bg={'gray.800'} color={'white'}>
        <Box
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
                rounded={8}
                bg="#ffffff12"
              >
                <chakra.form
                  shadow="base"
                  overflow={{
                    sm: "hidden",
                  }}
                >
                  <Stack
                    px={4}
                    py={3}
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
                        >
                          Nome
                        </FormLabel>
                        <Input
                          type="text"
                          focusBorderColor="white"
                          bg={'#ffffff12'}
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
                        >
                          CPF
                        </FormLabel>
                        <Input
                          type="text"
                          focusBorderColor="white"
                          bg={'#ffffff12'}
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
                        >
                          Cep
                        </FormLabel>
                        <Input
                          type="text"
                          focusBorderColor="white"
                          bg={'#ffffff12'}
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
                        >
                          Endereço
                        </FormLabel>
                        <Input
                          type="text"
                          focusBorderColor="white"
                          bg={'#ffffff12'}
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
                        >
                          Complemento
                        </FormLabel>
                        <Input
                          type="text"
                          focusBorderColor="white"
                          bg={'#ffffff12'}
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
                        >
                          Nº
                        </FormLabel>
                        <Input
                          type="text"
                          focusBorderColor="white"
                          bg={'#ffffff12'}
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
                        >
                          Cidade
                        </FormLabel>
                        <Input
                          type="text"
                          focusBorderColor="white"
                          bg={'#ffffff12'}
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
                        >
                          Bairro
                        </FormLabel>
                        <Input
                          type="text"
                          focusBorderColor="white"
                          bg={'#ffffff12'}
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          onChange={(e: any) => setBairro(capitalizeWords(e.target.value))}
                          value={bairro}
                        />
                      </FormControl>

                      <FormControl as={GridItem} colSpan={[12, 2, null, 1]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                        >
                          UF.
                        </FormLabel>
                        <Input
                          type="text"
                          focusBorderColor="white"
                          bg={'#ffffff12'}
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
                        >
                          E-mail
                        </FormLabel>
                        <Input
                          type="text"
                          focusBorderColor="white"
                          bg={'#ffffff12'}
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          onChange={(e: any) => setEmail(e.target.value)}
                          value={email}
                        />
                      </FormControl>
                      <FormControl as={GridItem} colSpan={[12, 2, null, 1]}>
                        <FormLabel
                          htmlFor="cep"
                          fontSize="xs"
                          fontWeight="md"
                        >
                          Telefone
                        </FormLabel>
                        <Input
                          type="text"
                          placeholder="(00) 0000-0000"
                          focusBorderColor="white"
                          bg={'#ffffff12'}
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          onChange={MaskTel}
                          value={telefoneMask}
                        />
                      </FormControl>

                      <FormControl as={GridItem} colSpan={[12, 2, null, 1]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                        >
                          Whatsapp
                        </FormLabel>
                        <Input
                          type="text"
                          placeholder="(00) 0 0000-0000"
                          focusBorderColor="white"
                          bg={'#ffffff12'}
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          onChange={MaskWhatsapp}
                          value={whatsappMask}
                        />
                      </FormControl>
                      <FormControl as={GridItem} colSpan={[12, 4, null, 2]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                        >
                          Departamento
                        </FormLabel>
                        <Input
                          type="text"
                          focusBorderColor="white"
                          bg={'#ffffff12'}
                          shadow="sm"
                          size="xs"
                          w="full"
                          rounded="md"
                          onChange={(e) => setDepartamento(capitalizeWords(e.target.value))}
                          value={Departamento}
                        />
                      </FormControl>
                      <FormControl as={GridItem} colSpan={[12, 4, null, 2]}>
                        <FormLabel
                          fontSize="xs"
                          fontWeight="md"
                        >
                          Cargo
                        </FormLabel>
                        <Input
                          type="text"
                          focusBorderColor="white"
                          bg={'#ffffff12'}
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
                          borderColor="white"
                          bg={'#ffffff12'}
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
                      onClick={() => router.back()}
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
