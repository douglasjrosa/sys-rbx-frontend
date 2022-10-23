import {
  chakra,
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  GridItem,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Switch,
  ListItem,
  ListIcon,
  List,
  Textarea,
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import ListaEmpresa from '../../../../components/pessoas/listaEmpresa';
import { mask, unMask } from 'remask';
import { PaisesList } from '../../../../components/data/paisesList';

export default function Cadastro() {
  //cru
  const [nome, setNome] = useState('');
  const [CEP, setCep] = useState('');
  const [end, setEnd] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setuf] = useState('');
  const [CPF, setCpf] = useState('');
  const [RG, setRg] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [complementos, setComplementos] = useState('');
  const [pais, setPais] = useState('');
  const [obs, setObs] = useState('');
  const [empresa, setEmpresa] = useState('');

  const [work, setWork] = useState([]);

  //mask
  const [maskCep, setMaskCep] = useState('');
  const [cpfmasck, setCpfmasck] = useState('');
  const [rgmasck, setRgmasck] = useState('');
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
    let url = '/api/empresas/getEmpresas/get';
    axios({
      method: 'GET',
      url: url,
    })
      .then(function (response) {
        console.log(response);
        setWork(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  useEffect(() => {
    consultaEmpresa();
  }, []);

  const MaskCep = (e) => {
    // e.prevendDefault();
    const originalVelue = unMask(e.target.value);
    const maskedValue = mask(originalVelue, ['99.999-999']);
    setMaskCep(maskedValue);
  };

  const MaskCpf = (e) => {
    e.prevendDefault();
    const originalVelue = unMask(e.target.value);
    const maskedValue = mask(originalVelue, ['999.999.999-99']);
    setCpf(originalVelue);
    setCpfmasck(maskedValue);
  };

  const MaskRg = (e) => {
    e.prevendDefault();
    const originalVelue = unMask(e.target.value);
    const maskedValue = mask(originalVelue, ['99.999.999-9']);
    setRg(originalVelue);
    setRgmasck(maskedValue);
  };

  const MaskWhatsapp = (e) => {
    e.prevendDefault();
    const originalVelue = unMask(e.target.value);
    const maskedValue = mask(originalVelue, ['(99) 9 9999-9999']);
    setWhatsapp(originalVelue);
    setWhatsappMask(maskedValue);
  };

  const MaskTel = (e) => {
    e.prevendDefault();
    const originalVelue = unMask(e.target.value);
    const maskedValue = mask(originalVelue, ['(99) 9999-9999']);
    setTelefone(originalVelue);
    setTelefoneMask(maskedValue);
  };

  const consultaEmpresaId = async (e) => {
    e.prevendDefault;
    const id = e.target.value;
    console.log(id);
    let url = '/api/empresas/consulta/' + id;
    await axios({
      method: 'GET',
      url: url,
    })
      .then(function (response) {
        console.log(response.data.data.id);
        setEmpresa(response.data.data.attributes.nome);
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
    const data = {
      data: {
        nome: nome,
      },
    };

    const url = '/api/empresas/post';

    axios({
      method: 'POST',
      url: url,
      data: data,
    })
      .then((response) => {
        console.log(response.data);
        return response.data;
      })
      .catch((err) => console.log(err));
  };

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

                    <FormControl as={GridItem} colSpan={[12, 6, 1]}>
                      <FormLabel
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        Cpf
                      </FormLabel>
                      <Input
                        type="text"
                        placeholder="000.000.000-00"
                        _placeholder={{ color: 'inherit' }}
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={MaskCpf}
                        value={cpfmasck}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[12, 6, 1]}>
                      <FormLabel
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        RG
                      </FormLabel>
                      <Input
                        type="text"
                        placeholder="00.000.000-00"
                        _placeholder={{ color: 'inherit' }}
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={MaskRg}
                        value={rgmasck}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[12, 6, 1]}>
                      <FormLabel
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
                        placeholder="00.000-000"
                        _placeholder={{ color: 'inherit' }}
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onBlur={(e) => {
                          const cep = e.target.value.replace(/\D/g, '');
                          let url = `http://viacep.com.br/ws/${cep}/json/`;
                          axios({
                            method: 'GET',
                            url: url,
                          })
                            .then(function (response) {
                              // console.log(response);
                              setCep(cep);
                              setEnd(response.data.logradouro);
                              setBairro(response.data.bairro);
                              setCidade(response.data.localidade);
                              setuf(response.data.uf);
                            })
                            .catch(function (error) {
                              console.log(error);
                            });
                        }}
                        onChange={MaskCep}
                        value={maskCep}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[12, 6, 3]}>
                      <FormLabel
                        htmlFor="pais"
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        End
                      </FormLabel>
                      <Input
                        type="text"
                        placeholder="endereço"
                        _placeholder={{ color: 'inherit' }}
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setEnd(e.target.value)}
                        value={end}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[12, 6, 2, 1]}>
                      <FormLabel
                        htmlFor="cod.pais"
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
                        placeholder="0000"
                        _placeholder={{ color: 'inherit' }}
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setNumero(e.target.value)}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[12, 6, 3]}>
                      <FormLabel
                        htmlFor="endereço"
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
                        placeholder="Bairro"
                        _placeholder={{ color: 'inherit' }}
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setBairro(e.target.value)}
                        value={bairro}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[12, 6, 2]}>
                      <FormLabel
                        htmlFor="numero"
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
                        placeholder="cidade"
                        _placeholder={{ color: 'inherit' }}
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[12, 6, 1]}>
                      <FormLabel
                        htmlFor="complemento"
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
                        placeholder="uf"
                        _placeholder={{ color: 'inherit' }}
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        value={uf}
                        onChange={(e) => setuf(e.target.value)}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[12, 6, 3]}>
                      <FormLabel
                        htmlFor="endereço"
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
                        placeholder="ex: ap, casa, bloco, etc"
                        _placeholder={{ color: 'inherit' }}
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setComplementos(e.target.value)}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[12, 3, null, 2]}>
                      <FormLabel
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        Pais
                      </FormLabel>
                      <Select
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        fontSize="xs"
                        rounded="md"
                        placeholder="Selecione um Pais"
                        _placeholder={{ color: 'inherit' }}
                        onChange={(e) => setPais(e.target.value)}
                      >
                        {PaisesList.map((item) => {
                          return (
                            <option value={item.nome_pais}>
                              {item.nome_pais}
                            </option>
                          );
                        })}
                      </Select>
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
                  bg="gray.100"
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
    </>
  );
}
