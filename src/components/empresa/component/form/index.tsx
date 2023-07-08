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
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { mask, unMask } from "remask";
import { capitalizeWords } from "@/function/captalize";
import { confgEnb } from "@/components/data/confgEnb";
import { CompPessoa } from "@/components/elements/lista/pessoas";
import { modCaix } from "@/components/data/modCaix";

export const FormEmpresa = (props: { data?: any, retornoData: any }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [CNPJ, setCNPJ] = useState('');
  const [MaskCNPJ, setMaskCNPJ] = useState("");
  const [nome, setNome] = useState("");
  const [fantasia, setFantasia] = useState("");
  const [tipoPessoa, setTipoPessoa] = useState("");
  const [fone, setFone] = useState("");
  const [celular, setCelular] = useState("");
  const [WhatsMask, setWhatsMask] = useState("");
  const [email, setEmail] = useState("");
  const [emailNfe, setEmailNfe] = useState("");
  const [ieStatus, setIeStatus] = useState(false);
  const [CNAE, setCNAE] = useState("");
  const [Ie, setIE] = useState("");
  const [porte, setPorte] = useState("");
  const [simples, setSimples] = useState(false);
  const [site, setSite] = useState("");
  const [endereco, setEndereco] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [complemento, setComplemento] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [cep, setCep] = useState("");
  const [pais, setPais] = useState("");
  const [codpais, setCodpais] = useState("");
  const [contribuinte, setContribuinte] = useState("");
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
  const [status, setStatus] = useState(true);
  const [tablecalc, setTablecalc] = useState("0.30");
  const [maxPg, setMaxpg] = useState("0");
  const [forpg, setForpg] = useState("desconto");
  const [frete, setFrete] = useState("FOB");
  const [Razao, setRazao] = useState("");
  const [Responsavel, setResponsavel] = useState("");
  const [Inatividade, setInatividade] = useState<number>(60);
  const [Data, setData] = useState<any | null>(null);
  const [ID, setID] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    localStorage.removeItem('idRetorno')
    if (props.data) {
      const empresa = props.data
      setResponsavel(empresa.attributes?.responsavel.data?.id);
      setID(empresa.id);
      setCNPJ(empresa.attributes?.CNPJ);
      const cnpj = empresa.attributes?.CNPJ
      setMaskCNPJ(mask(cnpj, ["99.999.999/9999-99"]))
      setNome(empresa.attributes?.nome);
      setFantasia(empresa.attributes?.fantasia);
      setTipoPessoa(empresa.attributes?.tipoPessoa);
      setFone(empresa.attributes?.fone === null ? '' : empresa.attributes?.fone);
      setCelular(empresa.attributes?.celular === null ? "" : empresa.attributes?.celular);
      setEmail(empresa.attributes?.email);
      setEmailNfe(empresa.attributes?.emailNfe);
      setIeStatus(empresa.attributes?.ieStatus);
      setCNAE(empresa.attributes?.CNAE);
      setIE(empresa.attributes?.Ie);
      setPorte(empresa.attributes?.porte);
      setSimples(empresa.attributes?.simples);
      setSite(empresa.attributes?.site);
      setEndereco(capitalizeWords(empresa.attributes?.endereco));
      setNumero(empresa.attributes?.numero);
      setBairro(capitalizeWords(empresa.attributes?.bairro));
      setComplemento(capitalizeWords(empresa.attributes?.complemento));
      setCidade(capitalizeWords(empresa.attributes?.cidade));
      setUf(empresa.attributes?.uf);
      setCep(empresa.attributes?.cep);
      setPais(empresa.attributes?.pais);
      setCodpais(empresa.attributes?.codpais);
      setAdFragilLat(empresa.attributes?.adFrailLat);
      setAdFragilCab(empresa.attributes?.adFrailCab);
      setAdEspecialLat(empresa.attributes?.adEspecialLat);
      setAdEspecialCab(empresa.attributes?.adEspecialCab);
      setLatFCab(empresa.attributes?.latFCab);
      setCabChao(empresa.attributes?.cabChao);
      setCabTop(empresa.attributes?.cabTop);
      setCxEco(empresa.attributes?.cxEco);
      setCxEst(empresa.attributes?.cxEst);
      setCxLev(empresa.attributes?.cxLev);
      setCxRef(empresa.attributes?.cxRef);
      setCxSupRef(empresa.attributes?.cxSupRef);
      setPlatSMed(empresa.attributes?.platSMed);
      setCxResi(empresa.attributes?.cxResi);
      setEngEco(empresa.attributes?.engEco);
      setEngLev(empresa.attributes?.engLev);
      setEngRef(empresa.attributes?.engRef);
      setEngResi(empresa.attributes?.engResi);
      setTablecalc(empresa.attributes?.tablecalc);
      setMaxpg(empresa.attributes?.maxPg);
      setForpg(empresa.attributes?.forpg);
      setFrete(empresa.attributes?.frete);
      setStatus(empresa.attributes?.status);
    }
  }, [props.data])

  const consulta = async () => {
    let url = 'https://publica.cnpj.ws/cnpj/' + CNPJ;
    try {
      const request = await axios(url);
      const response = request.data;
      setData(response)
    } catch (error: any) {
      toast({
        title: 'Opss',
        description: error.response?.data.detalhes,
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const data = {
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
    status: status,
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
    responsavel: Responsavel,
    inativOk: Inatividade,
    razao: Razao,
  };


  const save = async () => {
    props.retornoData(data)
  };

  function getResponsavel(respons: React.SetStateAction<string>) {
    setResponsavel(respons);
  }

  const maskCnpj = (e: any) => {
    const valor = e.target.value;
    const valorLinpo = unMask(valor);
    const masked = mask(valorLinpo, ["99.999.999/9999-99"]);
    setCNPJ(valorLinpo);
    setMaskCNPJ(masked);
  };

  const WhatsAppMask = (e: any) => {
    const valor = e.target.value;
    const valorLinpo = unMask(valor);
    const masked = mask(valorLinpo, ["(99) 9 9999-9999"]);
    setCelular(valorLinpo);
    setWhatsMask(masked);
  };

  useEffect(() => {
    if (Data) {
      setRazao(Data.razao_social)
      setFantasia(Data.estabelecimento.nome_fantasia);
      setTipoPessoa('cnpj');
      setIE(Data.estabelecimento?.inscricoes_estaduais[0]?.inscricao_estadual);
      setIeStatus(Data.estabelecimento?.inscricoes_estaduais[0]?.ativo);
      const end = capitalizeWords(Data.estabelecimento?.tipo_logradouro + " " + Data.estabelecimento?.logradouro)
      setEndereco(end === 'Undefined Undefined' ? "" : end);
      setNumero(Data.estabelecimento?.numero);
      setComplemento(capitalizeWords(Data.estabelecimento?.complemento));
      setBairro(capitalizeWords(Data.estabelecimento?.bairro));
      setCep(Data.estabelecimento?.cep);
      setCidade(capitalizeWords(Data.estabelecimento?.cidade.nome));
      setUf(Data.estabelecimento?.estado.sigla);
      let ddd = Data.estabelecimento?.ddd1;
      let tel1 = Data.estabelecimento?.telefone1;
      setFone(ddd + tel1);
      setEmail(Data.estabelecimento?.email);
      setPais(Data.estabelecimento?.pais.nome);
      setCodpais(Data.estabelecimento?.pais.id);
      setCNAE(Data.estabelecimento?.atividade_principal.id);
      setPorte(Data.porte?.descricao);
      const cheksimples = Data.simples?.simples === 'Sim' ? true : false;
      setSimples(cheksimples);
    }
  }, [Data])

  return (
    <>
      <Box
        // h='100%'
        bg="gray.800"
        p={5}
        pt={{ base: '5rem', sm: '5rem', md: '2rem', '2xl': '2rem' }}
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
        overflowY={'auto'}
      >
        <Box>
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
            bg="gray.800"
            h='100%'
          >
            <GridItem
              // mt={[5, null, 0]}
              colSpan={{
                md: 2,
              }}
              h='100%'
            >
              <chakra.form
                h={'100%'}
                method="POST"
                color='white'
                bg='#ffffff12'
                p={5}
                mt={{ md: '10rem', lg: 0, xl: '1rem', '2xl': '0' }}
                rounded={5}
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
                      >
                        Cnpj
                      </FormLabel>
                      <Input
                        type="text"
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={maskCnpj}
                        value={MaskCNPJ}
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
                    <Box ms={5} mt={'auto'} hidden={!props.data}>
                      <Switch
                        colorScheme="green"
                        borderColor="gray.900"
                        rounded="md"
                        isChecked={status}
                        onChange={(e) => setStatus(e.target.checked)}
                      />
                    </Box>
                  </SimpleGrid>

                  <SimpleGrid columns={9} spacing={3}>
                    <FormControl as={GridItem} colSpan={[5, 2]}>
                      <FormLabel
                        htmlFor="rozao"
                        fontSize="xs"
                        fontWeight="md"
                      >
                        Nome de exibição
                      </FormLabel>
                      <Input
                        type="text"
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setNome(capitalizeWords(e.target.value))}
                        value={nome}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 2]}>
                      <FormLabel
                        fontSize="xs"
                        fontWeight="md"
                      >
                        E-mail
                      </FormLabel>
                      <Input
                        type="text"
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                      />
                    </FormControl>
                    <FormControl as={GridItem} colSpan={[6, 2]}>
                      <FormLabel
                        fontSize="xs"
                        fontWeight="md"
                      >
                        CNAE
                      </FormLabel>
                      <Input
                        type="text"
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setCNAE(e.target.value)}
                        value={CNAE}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 1]}>
                      <FormLabel
                        htmlFor="ie"
                        fontSize="xs"
                        fontWeight="md"
                      >
                        IE
                      </FormLabel>
                      <Input
                        type="text"
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setIE(e.target.value)}
                        value={Ie}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 1]}>
                      <FormLabel
                        fontSize="xs"
                        fontWeight="md"
                      >
                        IE Status
                      </FormLabel>
                      <Input
                        type="text"
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
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
                    <FormControl as={GridItem} colSpan={[6, 3]}>
                      <CompPessoa
                        Resp={Responsavel}
                        onAddResp={getResponsavel}
                        ID={ID}
                      />
                    </FormControl>
                    <FormControl as={GridItem} colSpan={[2,2]}>
                      <Button
                        mt={5}
                        h={8}
                        colorScheme="teal"
                        onClick={() => {
                          localStorage.setItem('idRetorno', `${ID}`)
                          router.push(`/pessoas/cadastro`)
                        }}
                      >
                        + Nova Pessoa
                      </Button>
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 1]}>
                      <FormLabel
                        fontSize="xs"
                        fontWeight="md"
                      >
                        inatividade
                      </FormLabel>
                      <Input
                        type="number"
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        isDisabled={session?.user.pemission === 'Adm' ? false : true}
                        shadow="sm"
                        size="xs"
                        w="full"
                        maxLength={3}
                        rounded="md"
                        value={Inatividade}
                        onChange={(e) => setInatividade(parseInt(e.target.value))}
                      />
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={12} spacing={3}>
                    <FormControl as={GridItem} colSpan={[6, 2, 1]}>
                      <FormLabel
                        htmlFor="pais"
                        fontSize="xs"
                        fontWeight="md"
                      >
                        País
                      </FormLabel>
                      <Input
                        type="text"
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setPais(capitalizeWords(e.target.value))}
                        value={pais}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 2]}>
                      <FormLabel
                        fontSize="xs"
                        fontWeight="md"
                      >
                        Cod.País
                      </FormLabel>
                      <Input
                        type="text"
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setCodpais(e.target.value)}
                        value={codpais}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 4, null, 3]}>
                      <FormLabel
                        fontSize="xs"
                        fontWeight="md"
                      >
                        Endereço
                      </FormLabel>
                      <Input
                        type="text"
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setEndereco(capitalizeWords(e.target.value))}
                        value={endereco}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 1]}>
                      <FormLabel
                        htmlFor="numero"
                        fontSize="xs"
                        fontWeight="md"
                      >
                        N°
                      </FormLabel>
                      <Input
                        type="text"
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setNumero(e.target.value)}
                        value={numero}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 2]}>
                      <FormLabel
                        fontSize="xs"
                        fontWeight="md"
                      >
                        Complemento
                      </FormLabel>
                      <Input
                        type="text"
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setComplemento(e.target.value)}
                        value={complemento}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 3, null, 3]}>
                      <FormLabel
                        fontSize="xs"
                        fontWeight="md"
                      >
                        Bairro
                      </FormLabel>
                      <Input
                        type="text"
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setBairro(capitalizeWords(e.target.value))}
                        value={bairro}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 3, null, 1]}>
                      <FormLabel
                        fontSize="xs"
                        fontWeight="md"
                      >
                        Cep
                      </FormLabel>
                      <Input
                        type="text"

                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setCep(e.target.value)}
                        value={cep}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 3, null, 2]}>
                      <FormLabel
                        fontSize="xs"
                        fontWeight="md"
                      >
                        Cidade
                      </FormLabel>
                      <Input
                        type="text"
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setCidade(capitalizeWords(e.target.value))}
                        value={cidade}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[3, null, 1]}>
                      <FormLabel
                        fontSize="xs"
                        fontWeight="md"
                      >
                        UF.
                      </FormLabel>
                      <Input
                        type="text"
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setUf(e.target.value)}
                        value={uf}
                      />
                    </FormControl>
                    <FormControl as={GridItem} colSpan={[6, 4, null, 3]}>
                      <FormLabel
                        fontSize="xs"
                        fontWeight="md"
                      >
                        Site
                      </FormLabel>
                      <Input
                        type="text"
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setSite(e.target.value)}
                        value={site}
                      />
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 4, null, 3]}>
                      <FormLabel
                        fontSize="xs"
                        fontWeight="md"
                      >
                        E-mail NF-e
                      </FormLabel>
                      <Input
                        type="text"
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={(e) => setEmailNfe(e.target.value)}
                        value={emailNfe}
                      />
                    </FormControl>
                    <FormControl as={GridItem} colSpan={[6, 4, null, 3]}>
                      <FormLabel
                        htmlFor="cidade"
                        fontSize="xs"
                        fontWeight="md"
                      >
                        Whatsapp
                      </FormLabel>
                      <Input
                        type="text"
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        rounded="md"
                        onChange={WhatsAppMask}
                        value={WhatsMask}
                      />
                    </FormControl>
                    <FormControl as={GridItem} colSpan={[6, 4, null, 3]}>
                      <FormLabel
                        fontSize="xs"
                        fontWeight="md"
                      >
                        Contribuinte
                      </FormLabel>
                      <Select
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        fontSize="xs"
                        rounded="md"
                        placeholder="Selecione uma opção"
                        onChange={(e) => setContribuinte(e.target.value)}
                        value={contribuinte}
                      >
                        <option style={{ backgroundColor: "#1A202C" }} value="1">Contribuinte ICMS</option>
                        <option style={{ backgroundColor: "#1A202C" }} value="2">Contribuinte isento do ICMS</option>
                        <option style={{ backgroundColor: "#1A202C" }} value="9">Não contribuinte</option>
                      </Select>
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
                      Configurações da Empresa
                    </Heading>

                    <FormControl as={GridItem} colSpan={[6, 3]}>
                      <FormLabel
                        fontSize="xs"
                        fontWeight="md"
                      >
                        Tabela de cálculo
                      </FormLabel>
                      <Select
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        fontSize="xs"
                        rounded="md"
                        onChange={(e) => setTablecalc(e.target.value)}
                        value={tablecalc}
                      >
                        <option style={{ backgroundColor: "#1A202C" }} value="">Selecione uma opção</option>
                        <option style={{ backgroundColor: "#1A202C" }} selected value="0.30">Balcão</option>
                        <option style={{ backgroundColor: "#1A202C" }} value="0.26" selected>
                          Vip
                        </option>
                        <option style={{ backgroundColor: "#1A202C" }} value="0.23">Bronze</option>
                        <option style={{ backgroundColor: "#1A202C" }} value="0.20">Prata</option>
                        <option style={{ backgroundColor: "#1A202C" }} value="0.17">Ouro</option>
                        <option style={{ backgroundColor: "#1A202C" }} value="0.14">Platinum</option>
                      </Select>
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 3]}>
                      <FormLabel
                        htmlFor="prazo pagamento"
                        fontSize="xs"
                        fontWeight="md"
                      >
                        Máximo prazo p/ pagamento:
                      </FormLabel>
                      <Select
                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        fontSize="xs"
                        rounded="md"
                        onChange={(e) => setMaxpg(e.target.value)}
                        value={maxPg}
                      >
                        <option style={{ backgroundColor: "#1A202C" }}>Selecione uma tabela</option>
                        <option style={{ backgroundColor: "#1A202C" }} selected value="0">À vista (antecipado)</option>
                        <option style={{ backgroundColor: "#1A202C" }} value="5">5 dias</option>
                        <option style={{ backgroundColor: "#1A202C" }} value="15">15 dias</option>
                        <option style={{ backgroundColor: "#1A202C" }} value="28">28 Dias</option>
                        <option style={{ backgroundColor: "#1A202C" }} value="35">28 e 35 dias</option>
                        <option style={{ backgroundColor: "#1A202C" }} value="42">28, 35 e 42 dias</option>
                        <option style={{ backgroundColor: "#1A202C" }} value="90">
                          90 dias (Casos muito excepcionais)
                        </option>
                      </Select>
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 3]}>
                      <FormLabel
                        htmlFor="pagamento"
                        fontSize="xs"
                        fontWeight="md"
                      >
                        Preferência de pagamento:
                      </FormLabel>
                      <Select

                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        fontSize="xs"
                        rounded="md"
                        onChange={(e) => setForpg(e.target.value)}
                        value={forpg}
                      >
                        <option style={{ backgroundColor: "#1A202C" }} >Escolha uma opção</option>
                        <option style={{ backgroundColor: "#1A202C" }} selected value="desconto">Desconto À VISTA</option>
                        <option style={{ backgroundColor: "#1A202C" }} value="prazo">
                          Maior prazo para pagamento
                        </option>
                      </Select>
                    </FormControl>

                    <FormControl as={GridItem} colSpan={[6, 3]}>
                      <FormLabel
                        htmlFor="frete"
                        fontSize="xs"
                        fontWeight="md"

                      >
                        Frete
                      </FormLabel>
                      <Select

                        focusBorderColor="#ffff"
                        bg='#ffffff12'
                        shadow="sm"
                        size="xs"
                        w="full"
                        fontSize="xs"
                        rounded="md"
                        onChange={(e) => setFrete(e.target.value)}
                        value={frete}
                      >
                        <option style={{ backgroundColor: "#1A202C" }}>Escolha uma opção</option>
                        <option style={{ backgroundColor: "#1A202C" }} selected value="FOB">FOB - Por conta do cliente</option>
                        <option style={{ backgroundColor: "#1A202C" }} value="CIF">CIF - Por conta da Ribermax</option>
                      </Select>
                    </FormControl>
                  </SimpleGrid>

                  <SimpleGrid columns={12} spacing={5}>
                    <Heading as={GridItem} colSpan={12} mb={3} size="sd">
                      Configurações de Embalagens
                    </Heading>
                    {confgEnb.map((item) => {
                      const val =
                        item.id === "12"
                          ? adFrailLat
                          : item.id === "13"
                            ? adFrailCab
                            : item.id === "14"
                              ? adEspecialLat
                              : item.id === "15"
                                ? adEspecialCab
                                : item.id === "16"
                                  ? latFCab
                                  : item.id === "17"
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
                                borderColor="white"
                                bg='#ffffff12'
                                rounded="md"
                                isChecked={val}
                                onChange={(e) => {
                                  const set =
                                    item.id === "12"
                                      ? setAdFragilLat(e.target.checked)
                                      : item.id === "13"
                                        ? setAdFragilCab(e.target.checked)
                                        : item.id === "14"
                                          ? setAdEspecialLat(e.target.checked)
                                          : item.id === "15"
                                            ? setAdEspecialCab(e.target.checked)
                                            : item.id === "16"
                                              ? setLatFCab(e.target.checked)
                                              : item.id === "17"
                                                ? setCabChao(e.target.checked)
                                                : setCabTop(e.target.checked);
                                  return set;
                                }}
                              />
                            </Flex>
                            <Box ml={3} fontSize="xs">
                              <chakra.label
                                fontWeight="md"

                                _dark={{
                                  color: "gray.50",
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

                      const val =
                        item.id === "1"
                          ? cxEco
                          : item.id === "2"
                            ? cxEst
                            : item.id === "3"
                              ? cxLev
                              : item.id === "4"
                                ? cxRef
                                : item.id === "5"
                                  ? cxSupRef
                                  : item.id === "6"
                                    ? platSMed
                                    : item.id === "7"
                                      ? cxResi
                                      : item.id === "8"
                                        ? engEco
                                        : item.id === "9"
                                          ? engLev
                                          : item.id === "10"
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
                                borderColor="white"
                                bg='#ffffff12'
                                _invalid={{
                                  bg: '#ffffff12'
                                }}
                                rounded="md"
                                isChecked={val || false}
                                onChange={(e) => {
                                  const set: any =
                                    item.id === "1"
                                      ? setCxEco
                                      : item.id === "2"
                                        ? setCxEst
                                        : item.id === "3"
                                          ? setCxLev
                                          : item.id === "4"
                                            ? setCxRef
                                            : item.id === "5"
                                              ? setCxSupRef
                                              : item.id === "6"
                                                ? setPlatSMed
                                                : item.id === "7"
                                                  ? setCxResi
                                                  : item.id === "8"
                                                    ? setEngEco
                                                    : item.id === "9"
                                                      ? setEngLev
                                                      : item.id === "10"
                                                        ? setEngRef
                                                        : setEngResi;
                                  if (set) {
                                    set(e.target.checked);
                                  }
                                }}
                              />
                            </Flex>

                            <Box ml={3} fontSize="xs">
                              <chakra.label
                                fontWeight="md"
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
                  textAlign="right"
                >
                  <Button
                    colorScheme="red"
                    me={5}
                    fontWeight="md"
                    onClick={() => router.push("/empresas/")}
                  >
                    Cancelar
                  </Button>
                  <Button
                    colorScheme="whatsapp"
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
