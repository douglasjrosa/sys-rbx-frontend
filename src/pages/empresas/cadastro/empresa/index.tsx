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
} from '@chakra-ui/react';
import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { confgEnb } from '../../../../components/data/confgEnb';
import { modCaix } from '../../../../components/data/modCaix';

export default function Cadastro(): JSX.Element {
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

  const consulta = () => {
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
      })
      .catch(function (error) {
        console.log(error);
      });
  };


  const resprazao = nome.length !== 0 ? true : false;
  const respemail = !email ? false : email.length !== 0 ? true : false;
  const respStatus =
    ieStatus === true && nome.length !== 0
      ? true
      : ieStatus === false && nome.length !== 0
      ? true
      : false;
  const respCNAE = CNAE.length !== 0 ? true : false;
  const respend = endereco.length !== 0 ? true : false;
  const respnuber = numero.length !== 0 ? true : false;
  const respbairro = bairro.length !== 0 ? true : false;
  const respcomplemento = !complemento
    ? false
    : complemento.length !== 0
    ? true
    : false;
  const respcidade = cidade.length !== 0 ? true : false;
  const respuf = uf.length !== 0 ? true : false;
  const respcep = cep.length !== 0 ? true : false;
  const resppais = pais.length !== 0 ? true : false;
  const respcodpais = codpais.length !== 0 ? true : false;

  const reload = () => {
    window.location.reload;
  };

  const save = async () => {
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
        fone: parseInt(fone),
        celular: parseInt(celular),
        email: email,
        emailNfe: emailNfe,
        site: site,
        CNPJ: CNPJ,
        Ie: parseInt(Ie),
        pais: pais,
        codpais: parseInt(codpais),
        CNAE: parseInt(CNAE),
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
        setTimeout(async () => {
          window.location.reload();
      }, 300);
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
                        disabled={resprazao}
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
                        disabled={respStatus}
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
                        disabled={respStatus}
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
                        disabled={respnuber}
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
                      >
                        <option value="Vip">Vip</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
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
                                onChange={() => {
                                  const FragilLat =
                                    adFrailLat === false
                                      ? setAdFragilLat(true)
                                      : setAdFragilLat(false);
                                  const FragilCab =
                                    adFrailCab === false
                                      ? setAdFragilCab(true)
                                      : setAdFragilCab(false);
                                  const EspecialLat =
                                    adEspecialLat === false
                                      ? setAdEspecialLat(true)
                                      : setAdEspecialLat(true);
                                  const EspecialCab =
                                    adEspecialCab === false
                                      ? setAdEspecialCab(true)
                                      : setAdEspecialCab(true);
                                  const LatFCab =
                                    latFCab === false
                                      ? setLatFCab(true)
                                      : setLatFCab(true);
                                  const CabChao =
                                    cabChao === false
                                      ? setCabChao(true)
                                      : setCabChao(true);
                                  const CabTop =
                                    cabTop === false
                                      ? setCabTop(true)
                                      : setCabTop(true);
                                  const set =
                                    item.id === '12'
                                      ? FragilLat
                                      : item.id === '13'
                                      ? FragilCab
                                      : item.id === '14'
                                      ? EspecialLat
                                      : item.id === '15'
                                      ? EspecialCab
                                      : item.id === '16'
                                      ? LatFCab
                                      : item.id === '17'
                                      ? CabChao
                                      : CabTop;
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
                                onChange={(e) => {
                                  const CxEco =
                                    cxEco === false
                                      ? setCxEco(true)
                                      : setCxEco(false);
                                  const CxEst =
                                    cxEst === false
                                      ? setCxEst(true)
                                      : setCxEst(false);
                                  const CxLev =
                                    cxLev === false
                                      ? setCxLev(true)
                                      : setCxLev(false);
                                  const CxRef =
                                    cxRef === false
                                      ? setCxRef(true)
                                      : setCxRef(false);
                                  const CxSupRef =
                                    cxSupRef === false
                                      ? setCxSupRef(true)
                                      : setCxSupRef(false);
                                  const PlatSMed =
                                    platSMed === false
                                      ? setPlatSMed(true)
                                      : setPlatSMed(false);
                                  const CxResi =
                                    cxResi === false
                                      ? setCxResi(true)
                                      : setCxResi(false);
                                  const EngEco =
                                    engEco === false
                                      ? setEngEco(true)
                                      : setEngEco(false);
                                  const EngLev =
                                    engLev === false
                                      ? setEngLev(true)
                                      : setEngLev(false);
                                  const EngRef =
                                    engRef === false
                                      ? setEngRef(true)
                                      : setEngRef(false);
                                  const EngResi =
                                    engResi === false
                                      ? setEngResi(true)
                                      : setEngResi(false);
                                  const set =
                                    item.id === '1'
                                      ? CxEco
                                      : item.id === '2'
                                      ? CxEst
                                      : item.id === '3'
                                      ? CxLev
                                      : item.id === '4'
                                      ? CxRef
                                      : item.id === '5'
                                      ? CxSupRef
                                      : item.id === '6'
                                      ? PlatSMed
                                      : item.id === '7'
                                      ? CxResi
                                      : item.id === '8'
                                      ? EngEco
                                      : item.id === '9'
                                      ? EngLev
                                      : item.id === '10'
                                      ? EngRef
                                      : EngResi;
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
                  pb={[12, null, 0]}
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
      ;
    </>
  );
}
