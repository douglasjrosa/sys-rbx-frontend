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
        Authorization:
          '665e9589-575e-4b33-b429-2eb989f36117-ab620fe3-7b9c-4388-bc25-a80b362bee92',
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
        p={10}
      >
        <Box mt={[10, 0]}>
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
              boxShadow="dark-lg"
            >
              <chakra.form
                method="POST"
                shadow="base"
                rounded={[null, 'md']}
                overflow={{
                  sm: 'hidden',
                }}
                rounded={20}
              >
                <Stack
                  px={4}
                  py={5}
                  p={[null, 6]}
                  bg="gray.100"
                  _dark={{
                    bg: '#141517',
                  }}
                  spacing={6}
                >
                  <SimpleGrid columns={9} spacing={[1, 4, 9]}>
                  <Heading as={GridItem} colSpan={9} size='sd'>Modelos de Caixas</Heading>
                    <FormControl as={GridItem} colSpan={[8, 5, null, 2]}>
                      <FormLabel
                        htmlFor="last_name"
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
                        name="last_name"
                        id="last_name"
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
                      mt={'4'}
                      colorScheme="messenger"
                      onClick={consulta}
                    >
                      Buscar dados
                    </Button>
                  </SimpleGrid>

                  <SimpleGrid columns={9} spacing={3}>
                    <FormControl as={GridItem} colSpan={[5, 2]}>
                      <FormLabel
                        htmlFor="first_name"
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
                        name="first_name"
                        id="first_name"
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
                        htmlFor="email_address"
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        Email address
                      </FormLabel>
                      <Input
                        type="text"
                        name="email_address"
                        id="email_address"
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
                        htmlFor="email_address"
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
                        name="email_address"
                        id="email_address"
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
                        htmlFor="email_address"
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
                        name="email_address"
                        id="email_address"
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
                        htmlFor="email_address"
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
                        name="email_address"
                        id="email_address"
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

                  <SimpleGrid columns={12} spacing={6}>
                    <FormControl as={GridItem} colSpan={[6, 2]}>
                      <FormLabel
                        htmlFor="country"
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
                        name="email_address"
                        id="email_address"
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

                    <FormControl as={GridItem} colSpan={[6, 1]}>
                      <FormLabel
                        htmlFor="country"
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
                        name="email_address"
                        id="email_address"
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

                    <FormControl as={GridItem} colSpan={[6, 4]}>
                      <FormLabel
                        htmlFor="street_address"
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
                        name="street_address"
                        id="street_address"
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
                        htmlFor="street_address"
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
                        name="street_address"
                        id="street_address"
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

                    <FormControl as={GridItem} colSpan={[6, 3]}>
                      <FormLabel
                        htmlFor="street_address"
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
                        name="street_address"
                        id="street_address"
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
                        htmlFor="postal_code"
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
                        name="postal_code"
                        id="postal_code"
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
                        htmlFor="postal_code"
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
                        name="postal_code"
                        id="postal_code"
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
                        htmlFor="city"
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
                        name="city"
                        id="city"
                        autoComplete="city"
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

                    <FormControl as={GridItem} colSpan={[6, 3, null, 1]}>
                      <FormLabel
                        htmlFor="state"
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
                        name="state"
                        id="state"
                        autoComplete="state"
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
                  py={5}
                  p={[null, 6]}
                  bg="gray.100"
                  _dark={{
                    bg: '#141517',
                  }}
                  spacing={6}
                  borderTopColor={'gray.100'}
                >
                  <SimpleGrid columns={9} spacing={[1, 4, 9]}>
                    <Heading as={GridItem} colSpan={9} size='sd'>Configurações da Emprsa</Heading>
                  </SimpleGrid>
                  <SimpleGrid columns={9} spacing={[1, 4, 9]}>
                  <Heading as={GridItem} colSpan={9} size='sd'>Configurações de Embalagens</Heading>
                  </SimpleGrid>
                  <SimpleGrid columns={9} spacing={[1, 4, 9]}>
                  <Heading as={GridItem} colSpan={9} size='sd'>Modelos de Caixas</Heading>
                  </SimpleGrid>
                </Stack>
                <Box
                  px={{
                    base: 4,
                    sm: 6,
                  }}
                  py={3}
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
