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
  Select,
  SimpleGrid,
  Stack,
  Switch,
  Toast,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import { cnpj } from 'cpf-cnpj-validator';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { confgEnb } from '../../../components/data/confgEnb';
import { modCaix } from '../../../components/data/modCaix';
import { CompFornecedor } from '../../../components/elements/lista/fornecedor';
import { CompPessoa } from '../../../components/elements/lista/pessoas';

export default function Cadastro() {
  const { data: session } = useSession();
  const router = useRouter();
  const [CNPJ, setCNPJ] = useState('');
  const [nome, setNome] = useState('');
  const [fantasia, setFantasia] = useState('');
  const [tipoPessoa, setTipoPessoa] = useState('');
  const [fone, setFone] = useState('');
  const [celular, setCelular] = useState('');
  const [email, setEmail] = useState('');
  const [emailNfe, setEmailNfe] = useState('');
  const [ieStatus, setIeStatus] = useState(false);
  const [CNAE, setCNAE] = useState('');
  const [Ie, setIE] = useState('');
  const [porte, setPorte] = useState('');
  const [simples, setSimples] = useState(false);
  const [site, setSite] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numero, setNumero] = useState('');
  const [bairro, setBairro] = useState('');
  const [complemento, setComplemento] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [cep, setCep] = useState('');
  const [pais, setPais] = useState('');
  const [codpais, setCodpais] = useState('');
  const [contribuinte, setContribuinte] = useState('');
  const [adFrailLat, setAdFragilLat] = useState(false);
  const [adFrailCab, setAdFragilCab] = useState(false);
  const [adEspecialLat, setAdEspecialLat] = useState(false);
  const [adEspecialCab, setAdEspecialCab] = useState(false);
  const [latFCab, setLatFCab] = useState(false);
  const [cabChao, setCabChao] = useState(false);
  const [cabTop, setCabTop] = useState(false);
  const [cxEco, setCxEco] = useState(false);
  const [cxEst, setCxEst] = useState(false);
  const [cxLev, setCxLev] = useState(false);
  const [cxRef, setCxRef] = useState(null);
  const [cxSupRef, setCxSupRef] = useState(false);
  const [platSMed, setPlatSMed] = useState(false);
  const [cxResi, setCxResi] = useState(false);
  const [engEco, setEngEco] = useState(false);
  const [engLev, setEngLev] = useState(false);
  const [engRef, setEngRef] = useState(false);
  const [engResi, setEngResi] = useState(false);
  const [tablecalc, setTablecalc] = useState('');
  const [maxPg, setMaxpg] = useState('');
  const [forpg, setForpg] = useState('');
  const [frete, setFrete] = useState('');
  const [Empresa, setEmpresa] = useState('');
  const [Responsavel, setResponsavel] = useState('');
  const toast = useToast();

  const consulta = () => {
    console.log(CNPJ);
    const validCnpj = cnpj.isValid(CNPJ);
    if (CNPJ.length < 13) {
      Toast({
        title: 'erro no CNPJ',
        description: 'CNPJ incorreto',
        status: 'error',
        duration: 7000,
        position: 'top-right',
        isClosable: true,
      });
    }
    if (validCnpj === false) {
      Toast({
        title: 'erro no CNPJ',
        description: 'CNPJ incorreto',
        status: 'error',
        duration: 7000,
        position: 'top-right',
        isClosable: true,
      });
    } else {
      console.log(CNPJ);
      let url = 'https://publica.cnpj.ws/cnpj/' + CNPJ;

      axios({
        method: 'GET',
        url: url,
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(function (response) {
          setNome(response.data.razao_social);
          setFantasia(response.data.estabelecimento.nome_fantasia);
          setTipoPessoa('cnpj');
          setIE(
            response.data.estabelecimento.inscricoes_estaduais[0]
              .inscricao_estadual,
          );
          setIeStatus(
            response.data.estabelecimento.inscricoes_estaduais[0].ativo,
          );
          setEndereco(
            response.data.estabelecimento.tipo_logradouro +
              ' ' +
              response.data.estabelecimento.logradouro,
          );
          setNumero(response.data.estabelecimento.numero);
          setComplemento(response.data.estabelecimento.complemento);
          setBairro(response.data.estabelecimento.bairro);
          setCep(response.data.estabelecimento.cep);
          setCidade(response.data.estabelecimento.cidade.nome);
          setUf(response.data.estabelecimento.estado.sigla);
          let ddd = response.data.estabelecimento.ddd1;
          let tel1 = response.data.estabelecimento.telefone1;
          setFone(ddd + tel1);
          setEmail(response.data.estabelecimento.email);
          setPais(response.data.estabelecimento.pais.nome);
          setCodpais(response.data.estabelecimento.pais.id);
          setCNAE(response.data.estabelecimento.atividade_principal.id);
          setPorte(response.data.porte.descricao);
          const cheksimples =
            response.data.simples === null
              ? false
              : response.data.simples.simples === 'Sim'
              ? true
              : false;
          setSimples(cheksimples);
          const ICMSisent =
            response.data.simples !== null &&
            response.data.simples.mei === 'sim' &&
            response.data.estabelecimento.inscricoes_estaduais[0].ativo === true
              ? true
              : false;
          const ICMSncomtrib =
            response.data.simples !== null &&
            response.data.simples.mei === 'sim' &&
            response.data.estabelecimento.inscricoes_estaduais[0].ativo ===
              false
              ? true
              : false;
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  };

  const reload = () => {
    setCNPJ('');
    setNome('');
    setFantasia('');
    setTipoPessoa('');
    setFone('');
    setCelular('');
    setEmail('');
    setEmailNfe('');
    setIeStatus(false);
    setCNAE('');
    setIE('');
    setPorte('');
    setSimples(false);
    setSite('');
    setEndereco('');
    setNumero('');
    setBairro('');
    setComplemento('');
    setCidade('');
    setUf('');
    setCep('');
    setPais('');
    setCodpais('');
    setAdFragilLat(false);
    setAdFragilCab(false);
    setAdEspecialLat(false);
    setAdEspecialCab(false);
    setLatFCab(false);
    setCabChao(false);
    setCabTop(false);
    setCxEco(false);
    setCxEst(false);
    setCxLev(false);
    setCxRef(null);
    setCxSupRef(false);
    setPlatSMed(false);
    setCxResi(false);
    setEngEco(false);
    setEngLev(false);
    setEngRef(false);
    setEngResi(false);
    setTablecalc('');
    setMaxpg('');
    setForpg('');
    setFrete('');
    setResponsavel('');
    setEmpresa('');
    setTimeout(() => {
      router.back();
    }, 2000);
  };

  const data = {
    data: {
      nome: nome,
      fantasia: fantasia,
      tipoPessoa: tipoPessoa,
      endereco: endereco,
      numero: numero,
      complemento: complemento,
      bairro: bairro,
      cep: cep,
      cidade: cidade,
      uf: uf,
      fone: fone,
      celular: celular,
      email: email,
      emailNfe: emailNfe,
      site: site,
      CNPJ: CNPJ,
      Ie: Ie,
      pais: pais,
      codpais: codpais,
      CNAE: CNAE,
      porte: porte,
      simples: simples,
      ieStatus: ieStatus,
      status: true,
      adFrailLat: adFrailLat,
      adFrailCab: adFrailCab,
      adEspecialLat: adEspecialLat,
      adEspecialCab: adEspecialCab,
      latFCab: latFCab,
      cabChao: cabChao,
      cabTop: cabTop,
      cxEco: cxEco,
      cxEst: cxEst,
      cxLev: cxLev,
      cxRef: cxRef,
      cxSupRef: cxSupRef,
      platSMed: platSMed,
      cxResi: cxResi,
      engEco: engEco,
      engLev: engLev,
      engRef: engRef,
      engResi: engResi,
      tablecalc: tablecalc,
      maxPg: maxPg,
      forpg: forpg,
      frete: frete,
      contribuinte: contribuinte,
      vendedor: session.user.name,
      vendedorId: session.user.id,
      responsavel: Responsavel,
      fornecedor: Empresa,
    },
  };

  const strapi = async () => {
    const url = '/api/db/empresas/post';

    axios({
      method: 'POST',
      url: url,
      data: data,
    })
      .then((response) => {
        toast({
          title: 'Cliente atualizado',
          status: 'success',
          duration: 9000,
          isClosable: true,
        });
        return response.data;
      })
      .catch((err) => console.log(err));
  };

  const save = async () => {
    await strapi();
    reload();
  };

  function getResponsavel(respons: React.SetStateAction<string>) {
    setResponsavel(respons);
  }
  function getFornecedor(fornecedor: React.SetStateAction<string>) {
    setEmpresa(fornecedor);
  }

  return (
    <>
      <Box
        h={'100%'}
        bg="#edf3f8"
        _dark={{
          bg: '#111',
        }}
        px={5}
        pt={3}
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
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
              border={'1px solid #ccc'}
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
                  bg="gray.50"
                  _dark={{
                    bg: '#141517',
                  }}
                  spacing={6}
                >
                  <SimpleGrid columns={12} spacing={3}>
                    <Heading as={GridItem} colSpan={12} size="md">
                      Cadastro de Empresa
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
                        maxLength={14}
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
                        value={nome}
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
                        value={Ie}
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
                        IE Status
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
                        value={(() => {
                          const val =
                            ieStatus === true && nome.length !== 0
                              ? 'sim'
                              : ieStatus === false && nome.length !== 0
                              ? 'não'
                              : ' ';
                          return val;
                        })()}
                      />
                    </FormControl>
                    <FormControl as={GridItem} colSpan={[6, 6, null, 2]}>
                      <CompFornecedor
                        Resp={Empresa}
                        onAddResp={getFornecedor}
                      />
                    </FormControl>
                    <FormControl as={GridItem} colSpan={[6, 6, null, 2]}>
                      <CompPessoa
                        Resp={Responsavel}
                        onAddResp={getResponsavel}
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
                        value={endereco}
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
                        value={numero}
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
                        value={bairro}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 3, null, 1]}>
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
                        value={uf}
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
                        site
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
                        onChange={(e) => setSite(e.target.value)}
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
                        email para emvio de Nfe
                      </FormLabel>
                      <Input
                        type="text"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setEmailNfe(e.target.value)}
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
                        whatsapp
                      </FormLabel>
                      <Input
                        type="text"
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setCelular(e.target.value)}
                      />
                    </FormControl>
                    <FormControl as={GridItem} colSpan={[6, 6, null, 2]}>
                      <FormLabel
                        htmlFor="tabela de calculo"
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        Contribuinte
                      </FormLabel>
                      <Select
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        fontSize="xs"
                        rounded="md"
                        placeholder="selecine uma opção"
                        onChange={(e) => setContribuinte(e.target.value)}
                        value={contribuinte}
                      >
                        <option value="1">Contribuinte ICMS</option>
                        <option value="2">Contribuinte isento do ICMS</option>
                        <option value="9">Não contribuinte</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>
                </Stack>
                <Stack
                  px={4}
                  py={3}
                  bg="gray.50"
                  _dark={{
                    bg: '#141517',
                  }}
                  spacing={3}
                >
                  <SimpleGrid columns={12} spacing={3}>
                    <Heading as={GridItem} colSpan={12} size="sd">
                      Configurações da Emprsa
                    </Heading>

                    <FormControl as={GridItem} colSpan={[6, 3]}>
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
                        borderColor="gray.600"
                        focusBorderColor="brand.400"
                        shadow="sm"
                        size="xs"
                        w="full"
                        fontSize="xs"
                        rounded="md"
                        placeholder="selecine uma opção"
                        onChange={(e) => setTablecalc(e.target.value)}
                        value={tablecalc}
                      >
                        <option value="0.30">Balcão</option>
                        <option value="0.26" selected>
                          vip
                        </option>
                        <option value="0.23">Bronze</option>
                        <option value="0.20">Prata</option>
                        <option value="0.17">Ouro</option>
                        <option value="0.14">Platinum</option>
                      </Select>
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 3]}>
                      <FormLabel
                        htmlFor="prazo pagamento"
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        Máximo prazo p/ pagamento:
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
                        placeholder="Selecione uma tabela"
                        onChange={(e) => setMaxpg(e.target.value)}
                        value={maxPg}
                      >
                        <option value="0">Á vista (antecipado)</option>
                        <option value="5">5 dias</option>
                        <option value="15">15 dias</option>
                        <option value="28">28 Dias</option>
                        <option value="35">28 e 35 dias</option>
                        <option value="42">28,35 e 42 dias</option>
                        <option value="90">
                          90 dias (Casos muito excepcionais)
                        </option>
                      </Select>
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 3]}>
                      <FormLabel
                        htmlFor="pagamento"
                        fontSize="xs"
                        fontWeight="md"
                        color="gray.700"
                        _dark={{
                          color: 'gray.50',
                        }}
                      >
                        Preferência de pagamento:
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
                        placeholder="Escolha uma opção"
                        onChange={(e) => setForpg(e.target.value)}
                        value={forpg}
                      >
                        <option value="desconto">Desconto À VISTA</option>
                        <option value="prazo">
                          maior prazo para pagamento
                        </option>
                      </Select>
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 3]}>
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
                        placeholder="Escolha uma opção"
                        onChange={(e) => setFrete(e.target.value)}
                        value={frete}
                      >
                        <option value="FOB">FOB - Por conta do cliente</option>
                        <option value="CIF">CIF - Por conta da Ribermax</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={12} spacing={5}>
                    <Heading as={GridItem} colSpan={12} mb={3} size="sd">
                      Configurações de Embalagens
                    </Heading>
                    {confgEnb.map((item) => {
                      const val =
                        item.id === '12'
                          ? adFrailLat
                          : item.id === '13'
                          ? adFrailCab
                          : item.id === '14'
                          ? adEspecialLat
                          : item.id === '15'
                          ? adEspecialCab
                          : item.id === '16'
                          ? latFCab
                          : item.id === '17'
                          ? cabChao
                          : cabTop;

                      return (
                        <Box
                          key={item.id}
                          as={GridItem}
                          colSpan={[6, 3, null, 2]}
                        >
                          <Flex>
                            <Flex alignItems="center" h={5}>
                              <Switch
                                colorScheme="green"
                                borderColor="gray.900"
                                rounded="md"
                                isChecked={val}
                                onChange={(e) => {
                                  const set =
                                    item.id === '12'
                                      ? setAdFragilLat(e.target.checked)
                                      : item.id === '13'
                                      ? setAdFragilCab(e.target.checked)
                                      : item.id === '14'
                                      ? setAdEspecialLat(e.target.checked)
                                      : item.id === '15'
                                      ? setAdEspecialCab(e.target.checked)
                                      : item.id === '16'
                                      ? setLatFCab(e.target.checked)
                                      : item.id === '17'
                                      ? setCabChao(e.target.checked)
                                      : setCabTop(e.target.checked);
                                  return set;
                                }}
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
                                {item.title}
                              </chakra.label>
                            </Box>
                          </Flex>
                        </Box>
                      );
                    })}
                  </SimpleGrid>

                  <SimpleGrid columns={12} spacing={5}>
                    <Heading as={GridItem} colSpan={12} mb={5} size="sd">
                      Modelos de Caixas
                    </Heading>
                    {modCaix.map((item) => {
                      console.log(cxEco);
                      const val =
                        item.id === '1'
                          ? cxEco
                          : item.id === '2'
                          ? cxEst
                          : item.id === '3'
                          ? cxLev
                          : item.id === '4'
                          ? cxRef
                          : item.id === '5'
                          ? cxSupRef
                          : item.id === '6'
                          ? platSMed
                          : item.id === '7'
                          ? cxResi
                          : item.id === '8'
                          ? engEco
                          : item.id === '9'
                          ? engLev
                          : item.id === '10'
                          ? engRef
                          : engResi;
                      return (
                        <Box
                          key={item.id}
                          as={GridItem}
                          colSpan={[6, 3, null, 2]}
                        >
                          <Flex>
                            <Flex alignItems="center" h={5}>
                              <Switch
                                colorScheme="green"
                                borderColor="gray.400"
                                rounded="md"
                                isChecked={val}
                                onChange={(e) => {
                                  const set =
                                    item.id === '1'
                                      ? setCxEco(e.target.checked)
                                      : item.id === '2'
                                      ? setCxEst(e.target.checked)
                                      : item.id === '3'
                                      ? setCxLev(e.target.checked)
                                      : item.id === '4'
                                      ? setCxRef(e.target.checked)
                                      : item.id === '5'
                                      ? setCxSupRef(e.target.checked)
                                      : item.id === '6'
                                      ? setPlatSMed(e.target.checked)
                                      : item.id === '7'
                                      ? setCxResi(e.target.checked)
                                      : item.id === '8'
                                      ? setEngEco(e.target.checked)
                                      : item.id === '9'
                                      ? setEngLev(e.target.checked)
                                      : item.id === '10'
                                      ? setEngRef(e.target.checked)
                                      : setEngResi(e.target.checked);
                                  return set;
                                }}
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
                                {item.title}
                              </chakra.label>
                            </Box>
                          </Flex>
                        </Box>
                      );
                    })}
                  </SimpleGrid>
                </Stack>
                <Box
                  px={{
                    base: 4,
                    sm: 6,
                  }}
                  py={2}
                  pb={[12, null, 5]}
                  bg="gray.50"
                  _dark={{
                    bg: '#121212',
                  }}
                  textAlign="right"
                >
                  <Button
                    colorScheme="red"
                    me={5}
                    _focus={{
                      shadow: '',
                    }}
                    fontWeight="md"
                    onClick={reload}
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
      ;
    </>
  );
}
