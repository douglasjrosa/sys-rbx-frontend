import {
  Avatar,
  chakra,
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  GridItem,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftAddon,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  VisuallyHidden,
} from '@chakra-ui/react';
import { useState } from 'react';
import axios from 'axios';

export default function Cadastro(): JSX.Element {
  const [CNPJ, setCNPJ] = useState('');
  const [dados, setDados]: any = useState([]);

  const [razao, setRazao] = useState('');
  const [tel, setTel] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [CNAE, setCNAE] = useState('');
  const [Ie, setIE] = useState('');

  const [end, setEnd] = useState('');
  const [nuber, setNuber] = useState('');
  const [bairro, setBairro] = useState('');
  const [complemento, setComplemento] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [cep, setCep] = useState('');
  const [pais, setPais] = useState('');
  const [codpais, setCodpais] = useState('');

  const consulta = () => {
    console.log(CNPJ);
    let url = 'https://api.cnpja.com/office/' + CNPJ;

    axios({
      method: 'GET',
      url: url,
      headers: {
        Authorization: process.env.ATORIZZATION_CNPJ,
      },
    })
      .then(function (response) {
        let ddd = response.data.phones[0].area;
        let tel1 = response.data.phones[0].number;
        setDados(response.data);
        setRazao(response.data.alias);
        setEmail(response.data.emails[0].address);
        setStatus(response.data.status.text);
        setCNAE(response.data.mainActivity.id);
        setEnd(response.data.address.street);
        setNuber(response.data.address.number);
        setBairro(response.data.address.district);
        setComplemento(response.data.address.details);
        setCidade(response.data.address.city);
        setUf(response.data.address.state);
        setCep(response.data.address.zip);
        setPais(response.data.address.country.name);
        setCodpais(response.data.address.country.id);
        setTel(ddd + tel1);
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  console.log(dados);

  const resprazao = razao.length !== 0 ? true : false;
  const respemail = email.length !== 0 ? true : false;
  const respStatus = status.length !== 0 ? true : false;
  const respCNAE = CNAE.length !== 0 ? true : false;
  const respend = end.length !== 0 ? true : false;
  const respnuber = nuber.length !== 0 ? true : false;
  const respbairro = bairro.length !== 0 ? true : false;
  const respcomplemento = complemento.length !== 0 ? true : false;
  const respcidade = cidade.length !== 0 ? true : false;
  const respuf = uf.length !== 0 ? true : false;
  const respcep = cep.length !== 0 ? true : false;
  const resppais = pais.length !== 0 ? true : false;
  const respcodpais = codpais.length !== 0 ? true : false;

  return (
    <>
      <Box
        bg="#edf3f8"
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
              rounded={20}
            >
              <chakra.form
                method="POST"
                shadow="base"
                rounded={[null, 20]}
                overflow={{
                  sm: 'hidden',
                }}
              >
                <Stack
                  px={4}
                  py={3}
                  bg="gray.100"
                  _dark={{
                    bg: '#141517',
                  }}
                  spacing={6}
                >
                  <SimpleGrid columns={12} spacing={3}>
                  <Heading as={GridItem} colSpan={12} size="md">
                      Cadastro de cliente
                    </Heading>
                   </SimpleGrid>
                  <SimpleGrid columns={12} spacing={3}>
                    <Heading as={GridItem} colSpan={12} size="sd">
                      Dados da empresa
                    </Heading>
                    <FormControl as={GridItem} colSpan={[8, 5, null, 2]}>
                      <FormLabel
                        htmlFor="cnpj"
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        Cnpj
                      </FormLabel>
                      <Input
                        type="text"
                        name="cnpj"
                        id="cnpj"
                        autoComplete="family-name"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setCNPJ(e.target.value)}
                      />
                    </FormControl>
                    <Button
                      as={GridItem}
                      colSpan={[8, 4, null, 2]}
                      h={8}
                      mt={5}
                      colorScheme="messenger"
                      onClick={consulta}
                    >
                      Buscar dados
                    </Button>
                  </SimpleGrid>

                  <SimpleGrid columns={9} spacing={3}>
                    <FormControl as={GridItem} colSpan={[5, 2]}>
                      <FormLabel
                        htmlFor="rozao"
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        Razão social
                      </FormLabel>
                      <Input
                        type="text"
                        name="rozao"
                        id="rozao"
                        autoComplete="given-name"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        disabled={resprazao}
                        value={razao}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 2]}>
                      <FormLabel
                        htmlFor="email"
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
                        name="email"
                        id="email"
                        autoComplete="email"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        disabled={respemail}
                        value={email}
                      />
                    </FormControl>
                    <FormControl as={GridItem} colSpan={[6, 2]}>
                      <FormLabel
                        htmlFor="cnae"
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        CNAE
                      </FormLabel>
                      <Input
                        type="text"
                        name="cnae"
                        id="cnae"
                        autoComplete="email"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        disabled={respCNAE}
                        value={CNAE}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 1]}>
                      <FormLabel
                        htmlFor="ie"
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        IE
                      </FormLabel>
                      <Input
                        type="text"
                        name="ie"
                        id="ie"
                        autoComplete="email"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setIE(e.target.value)}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 1]}>
                      <FormLabel
                        htmlFor="status"
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        Status
                      </FormLabel>
                      <Input
                        type="text"
                        name="status"
                        id="status"
                        autoComplete="email"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        disabled={respStatus}
                        value={status}
                      />
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={12} spacing={3}>
                    <FormControl as={GridItem} colSpan={[6, 2]}>
                      <FormLabel
                        htmlFor="pais"
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        Pais
                      </FormLabel>
                      <Input
                        type="text"
                        name="pais"
                        id="pais"
                        autoComplete="email"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        disabled={resppais}
                        value={pais}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 2, 1]}>
                      <FormLabel
                        htmlFor="cod.pais"
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        Cod.pais
                      </FormLabel>
                      <Input
                        type="text"
                        name="cod.pais"
                        id="cod.pais"
                        autoComplete="email"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        disabled={respcodpais}
                        value={codpais}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 3]}>
                      <FormLabel
                        htmlFor="endereço"
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        end
                      </FormLabel>
                      <Input
                        type="text"
                        name="endereço"
                        id="endereço"
                        autoComplete="street-address"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        disabled={respend}
                        value={end}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 1]}>
                      <FormLabel
                        htmlFor="numero"
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        N°
                      </FormLabel>
                      <Input
                        type="text"
                        name="numero"
                        id="numero"
                        autoComplete="street-address"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        disabled={respnuber}
                        value={nuber}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 2]}>
                      <FormLabel
                        htmlFor="complemento"
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        Complemento
                      </FormLabel>
                      <Input
                        type="text"
                        name="complemento"
                        id="complemento"
                        autoComplete="street-address"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        disabled={respcomplemento}
                        value={complemento}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 3, null, 3]}>
                      <FormLabel
                        htmlFor="bairro"
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
                        name="bairro"
                        id="bairro"
                        autoComplete="postal-code"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        disabled={respbairro}
                        value={bairro}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 3, null, 2]}>
                      <FormLabel
                        htmlFor="cep"
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        Cep
                      </FormLabel>
                      <Input
                        type="text"
                        name="cep"
                        id="cep"
                        autoComplete="postal-code"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        disabled={respcep}
                        value={cep}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 6, null, 2]}>
                      <FormLabel
                        htmlFor="cidade"
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
                        name="cidade"
                        id="cidade"
                        autoComplete="cidade"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        disabled={respcidade}
                        value={cidade}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[3, null, 1]}>
                      <FormLabel
                        htmlFor="uf"
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
                        name="uf"
                        id="uf"
                        autoComplete="uf"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        disabled={respuf}
                        value={uf}
                      />
                    </FormControl>
                  </SimpleGrid>
                </Stack>
                <Stack
                  px={4}
                  py={3}
                  bg="gray.100"
                  _dark={{
                    bg: '#141517',
                  }}
                  spacing={3}
                >
                  <SimpleGrid columns={12} spacing={4}>
                    <Heading as={GridItem} colSpan={12} size="sd">
                      Configurações da Emprsa
                    </Heading>
                    <FormControl as={GridItem} colSpan={[6, 3, null, 2]}>
                      <FormLabel
                        htmlFor="tabela de calculo"
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        Tabela de calculo
                      </FormLabel>
                      <Select
                        name="tabela de calculo"
                        id="tabela de calculo"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        fontSize="xs"
                        rounded="md"
                        placeholder="selecine uma opção"
                      >
                        <option value="Vip">Vip</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                      </Select>
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 3, null, 2]}>
                      <FormLabel
                        htmlFor="prazo pagamento"
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        Prazo pagamento
                      </FormLabel>
                      <Select
                        name="prazo pagamento"
                        id="prazo pagamento"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        fontSize="xs"
                        rounded="md"
                        placeholder="selecine uma opção"
                      >
                        <option value="28 dias">28 Dias</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                      </Select>
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 3, null, 2]}>
                      <FormLabel
                        htmlFor="pagamento"
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        Pagamento
                      </FormLabel>
                      <Select
                        name="pagamento"
                        id="pagamento"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        fontSize="xs"
                        rounded="md"
                        placeholder="selecine uma opção"
                      >
                        <option value="À VISTA">À VISTA</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                      </Select>
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 3, null, 2]}>
                      <FormLabel
                        htmlFor="frete"
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
                        name="frete"
                        id="frete"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        fontSize="xs"
                        rounded="md"
                        placeholder="selecine uma opção"
                      >
                        <option value="CIF">CIF - Por conta da Ribermax</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={12} spacing={5}>
                    <Heading as={GridItem} colSpan={12} mb={3} size="sd">
                      Configurações de Embalagens
                    </Heading>

                    <Box as={GridItem} colSpan={[6, 3, null, 2]}>
                      <Flex>
                        <Flex alignItems="center" h={5}>
                          <Checkbox
                            colorScheme="green"
                            borderColor="gray.400"
                            rounded="md"
                          />
                        </Flex>
                        <Box ml={3} fontSize="xs">
                          <chakra.label
                            fontWeight="md"
                            color="gray.700"
                            _dark={{
                              color: 'gray.50',
                            }}
                          >
                            Adesivo Frágil nas Laterais
                          </chakra.label>
                        </Box>
                      </Flex>
                    </Box>

                    <Box as={GridItem} colSpan={[6, 3, null, 2]}>
                      <Flex>
                        <Flex alignItems="center" h={5}>
                          <Checkbox
                            colorScheme="green"
                            borderColor="gray.400"
                            rounded="md"
                          />
                        </Flex>
                        <Box ml={3} fontSize="xs">
                          <chakra.label
                            fontWeight="md"
                            color="gray.700"
                            _dark={{
                              color: 'gray.50',
                            }}
                          >
                            Adesivo Frágil nas Cabeceiras
                          </chakra.label>
                        </Box>
                      </Flex>
                    </Box>

                    <Box as={GridItem} colSpan={[6, 3, null, 2]}>
                      <Flex>
                        <Flex alignItems="center" h={5}>
                          <Checkbox
                            colorScheme="green"
                            borderColor="gray.400"
                            rounded="md"
                          />
                        </Flex>
                        <Box ml={3} fontSize="xs">
                          <chakra.label
                            fontWeight="md"
                            color="gray.700"
                            _dark={{
                              color: 'gray.50',
                            }}
                          >
                            Adesivo Especial nas Laterais
                          </chakra.label>
                        </Box>
                      </Flex>
                    </Box>

                    <Box as={GridItem} colSpan={[6, 3, null, 2]}>
                      <Flex>
                        <Flex alignItems="center" h={5}>
                          <Checkbox
                            colorScheme="green"
                            borderColor="gray.400"
                            rounded="md"
                          />
                        </Flex>
                        <Box ml={3} fontSize="xs">
                          <chakra.label
                            fontWeight="md"
                            color="gray.700"
                            _dark={{
                              color: 'gray.50',
                            }}
                          >
                            Adesivo Especial nas Cabeceiras
                          </chakra.label>
                        </Box>
                      </Flex>
                    </Box>

                    <Box as={GridItem} colSpan={[6, 3, null, 2]}>
                      <Flex>
                        <Flex alignItems="center" h={5}>
                          <Checkbox
                            colorScheme="green"
                            borderColor="gray.400"
                            rounded="md"
                          />
                        </Flex>
                        <Box ml={3} fontSize="xs">
                          <chakra.label
                            fontWeight="md"
                            color="gray.700"
                            _dark={{
                              color: 'gray.50',
                            }}
                          >
                            Laterais por fora das Cabeceiras
                          </chakra.label>
                        </Box>
                      </Flex>
                    </Box>

                    <Box as={GridItem} colSpan={[6, 3, null, 2]}>
                      <Flex>
                        <Flex alignItems="center" h={5}>
                          <Checkbox
                            colorScheme="green"
                            borderColor="gray.400"
                            rounded="md"
                          />
                        </Flex>
                        <Box ml={3} fontSize="xs">
                          <chakra.label
                            fontWeight="md"
                            color="gray.700"
                            _dark={{
                              color: 'gray.50',
                            }}
                          >
                            Cabeceiras até o chão
                          </chakra.label>
                        </Box>
                      </Flex>
                    </Box>

                    <Box as={GridItem} colSpan={[6, 3, null, 2]}>
                      <Flex>
                        <Flex alignItems="center" h={5}>
                          <Checkbox
                            colorScheme="green"
                            borderColor="gray.400"
                            rounded="md"
                          />
                        </Flex>
                        <Box ml={3} fontSize="xs">
                          <chakra.label
                            fontWeight="md"
                            color="gray.700"
                            _dark={{
                              color: 'gray.50',
                            }}
                          >
                            Cabeceiras até o topo
                          </chakra.label>
                        </Box>
                      </Flex>
                    </Box>
                  </SimpleGrid>

                  <SimpleGrid columns={12} spacing={5}>

                    <Heading as={GridItem} colSpan={12} mb={5} size="sd">
                      Modelos de Caixas
                    </Heading>

                    <Box as={GridItem} colSpan={[6, 3, null, 2]}>
                      <Flex>
                        <Flex alignItems="center" h={5}>
                          <Checkbox
                            colorScheme="green"
                            borderColor="gray.400"
                            rounded="md"
                          />
                        </Flex>
                        <Box ml={3} fontSize="xs">
                          <chakra.label
                            fontWeight="md"
                            color="gray.700"
                            _dark={{
                              color: 'gray.50',
                            }}
                          >
                            Caixa econômica
                          </chakra.label>
                        </Box>
                      </Flex>
                    </Box>

                    <Box as={GridItem} colSpan={[6, 3, null, 2]}>
                      <Flex>
                        <Flex alignItems="center" h={5}>
                          <Checkbox
                            colorScheme="green"
                            borderColor="gray.400"
                            rounded="md"
                          />
                        </Flex>
                        <Box ml={3} fontSize="xs">
                          <chakra.label
                            fontWeight="md"
                            color="gray.700"
                            _dark={{
                              color: 'gray.50',
                            }}
                          >
                            Caixa estrturada
                          </chakra.label>
                        </Box>
                      </Flex>
                    </Box>

                    <Box as={GridItem} colSpan={[6, 3, null, 2]}>
                      <Flex>
                        <Flex alignItems="center" h={5}>
                          <Checkbox
                            colorScheme="green"
                            borderColor="gray.400"
                            rounded="md"
                          />
                        </Flex>
                        <Box ml={3} fontSize="xs">
                          <chakra.label
                            fontWeight="md"
                            color="gray.700"
                            _dark={{
                              color: 'gray.50',
                            }}
                          >
                            Caixa leve
                          </chakra.label>
                        </Box>
                      </Flex>
                    </Box>

                    <Box as={GridItem} colSpan={[6, 3, null, 2]}>
                      <Flex>
                        <Flex alignItems="center" h={5}>
                          <Checkbox
                            colorScheme="green"
                            borderColor="gray.400"
                            rounded="md"
                          />
                        </Flex>
                        <Box ml={3} fontSize="xs">
                          <chakra.label
                            fontWeight="md"
                            color="gray.700"
                            _dark={{
                              color: 'gray.50',
                            }}
                          >
                            Caixa Reforçada
                          </chakra.label>
                        </Box>
                      </Flex>
                    </Box>

                    <Box as={GridItem} colSpan={[6, 3, null, 2]}>
                      <Flex>
                        <Flex alignItems="center" h={5}>
                          <Checkbox
                            colorScheme="green"
                            borderColor="gray.400"
                            rounded="md"
                          />
                        </Flex>
                        <Box ml={3} fontSize="xs">
                          <chakra.label
                            fontWeight="md"
                            color="gray.700"
                            _dark={{
                              color: 'gray.50',
                            }}
                          >
                            Caixa Super Reforçada
                          </chakra.label>
                        </Box>
                      </Flex>
                    </Box>

                    <Box as={GridItem} colSpan={[6, 3, null, 2]}>
                      <Flex>
                        <Flex alignItems="center" h={5}>
                          <Checkbox
                            colorScheme="green"
                            borderColor="gray.400"
                            rounded="md"
                          />
                        </Flex>
                        <Box ml={3} fontSize="xs">
                          <chakra.label
                            fontWeight="md"
                            color="gray.700"
                            _dark={{
                              color: 'gray.50',
                            }}
                          >
                            Paletes sob medida
                          </chakra.label>
                        </Box>
                      </Flex>
                    </Box>

                    <Box as={GridItem} colSpan={[6, 3, null, 2]}>
                      <Flex>
                        <Flex alignItems="center" h={5}>
                          <Checkbox
                            colorScheme="green"
                            borderColor="gray.400"
                            rounded="md"
                          />
                        </Flex>
                        <Box ml={3} fontSize="xs">
                          <chakra.label
                            fontWeight="md"
                            color="gray.700"
                            _dark={{
                              color: 'gray.50',
                            }}
                          >
                            Caixa Resistente
                          </chakra.label>
                        </Box>
                      </Flex>
                    </Box>

                    <Box as={GridItem} colSpan={[6, 3, null, 2]}>
                      <Flex>
                        <Flex alignItems="center" h={5}>
                          <Checkbox
                            colorScheme="green"
                            borderColor="gray.400"
                            rounded="md"
                          />
                        </Flex>
                        <Box ml={3} fontSize="xs">
                          <chakra.label
                            fontWeight="md"
                            color="gray.700"
                            _dark={{
                              color: 'gray.50',
                            }}
                          >
                            Engradado econômico
                          </chakra.label>
                        </Box>
                      </Flex>
                    </Box>

                    <Box as={GridItem} colSpan={[6, 3, null, 2]}>
                      <Flex>
                        <Flex alignItems="center" h={5}>
                          <Checkbox
                            colorScheme="green"
                            borderColor="gray.400"
                            rounded="md"
                          />
                        </Flex>
                        <Box ml={3} fontSize="xs">
                          <chakra.label
                            fontWeight="md"
                            color="gray.700"
                            _dark={{
                              color: 'gray.50',
                            }}
                          >
                            Engradado leve
                          </chakra.label>
                        </Box>
                      </Flex>
                    </Box>

                    <Box as={GridItem} colSpan={[6, 3, null, 2]}>
                      <Flex>
                        <Flex alignItems="center" h={5}>
                          <Checkbox
                            colorScheme="green"
                            borderColor="gray.400"
                            rounded="md"
                          />
                        </Flex>
                        <Box ml={3} fontSize="xs">
                          <chakra.label
                            fontWeight="md"
                            color="gray.700"
                            _dark={{
                              color: 'gray.50',
                            }}
                          >
                            Engradado reforçado
                          </chakra.label>
                        </Box>
                      </Flex>
                    </Box>

                    <Box as={GridItem} colSpan={[6, 3, null, 2]}>
                      <Flex>
                        <Flex alignItems="center" h={5}>
                          <Checkbox
                            colorScheme="green"
                            borderColor="gray.400"
                            rounded="md"
                          />
                        </Flex>
                        <Box ml={3} fontSize="xs">
                          <chakra.label
                            fontWeight="md"
                            color="gray.700"
                            _dark={{
                              color: 'gray.50',
                            }}
                          >
                            Engradado resistente
                          </chakra.label>
                        </Box>
                      </Flex>
                    </Box>

                  </SimpleGrid>
                </Stack>
                <Box
                  px={{
                    base: 4,
                    sm: 6,
                  }}
                  py={2}
                  pb={[12,null,0]}
                  bg="gray.100"
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
                    type="submit"
                    colorScheme="whatsapp"
                    _focus={{
                      shadow: '',
                    }}
                    fontWeight="md"
                  >
                    Save
                  </Button>
                </Box>
              </chakra.form>
            </GridItem>
          </SimpleGrid>
        </Box>
      </Box>
      ;
    </>
  );
}
