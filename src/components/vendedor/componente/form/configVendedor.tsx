import { Box, Button, Flex, FormControl, FormLabel, Heading, Input, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";


export const ConfigVendedor = (props: { id: any, update: any }) => {
  const IDVendedor = props.id
  const toast = useToast();
  const [ID, setID] = useState('');
  const [Ano, setAno] = useState('');
  const [Mes, setMes] = useState('');
  const [Meta, setMeta] = useState('');
  const [Salario, setSalario] = useState('');
  const [Custo, setCusto] = useState('');
  const [Premio1, setPremio1] = useState('');
  const [Premio2, setPremio2] = useState('');
  const [Premio3, setPremio3] = useState('');
  const [PremioMeta, setPremioMeta] = useState('');
  const [PremioRecord, setPremioRecord] = useState('');
  const [EntradaAt, setEntradaAt] = useState('');
  const [ComicaoAt, setComicaoAt] = useState('');
  const [EntradaVe, setEntradaVe] = useState('');
  const [ComicaoVe, setComicaoVe] = useState('');
  const [EntradaCont, setEntradaCont] = useState('');
  const [ComicaoCont, setComicaoCont] = useState('');
const {data: session} = useSession()
  const [Bloq, setBloq] = useState(false);
  const [Vendedor, setVendedor] = useState<any|null>([]);


  useEffect(() => {
    (async () => {
      try {
        const GetVendedor = await axios(`/api/db/user/getId/${IDVendedor}`);
        const vendedor = GetVendedor.data;
        setVendedor(vendedor)
      } catch (error) {
        console.log(error);
      }
    })();
  }, [IDVendedor]);

  function stringParaNumero(string: string) {
    // Substitui vírgulas por pontos
    const stringComPonto = string.replace(",", ".");
    // Tenta analisar como número de ponto flutuante
    const numeroFloat = parseFloat(stringComPonto);
    // Se o resultado for um número válido, retorna o número de ponto flutuante
    if (!isNaN(numeroFloat)) {
      return numeroFloat;
    }
    // Se não for um número de ponto flutuante, tenta analisar como número inteiro
    const numeroInt = parseInt(stringComPonto, 10);
    // Se o resultado for um número inteiro válido, retorna o número inteiro
    if (!isNaN(numeroInt)) {
      return numeroInt;
    }
    return NaN;
  }

  function numeroParaString(numero: any) {
    return `${numero}`;
  }

  console.log("🚀 ~ file: configVendedor.tsx:78 ~ sal ~ Ano:", Ano)
  const salvar = async () => {
    setBloq(true);
    try {
      const Data = {
        "data": {
          "ano": Ano,
          "mes": Mes,
          "meta_decendio": Meta,
          "salario_fixo": Salario,
          "ajuda_de_custo": Custo,
          "premio_decendio_1": Premio1,
          "premio_decendio_2": Premio2,
          "premio_decendio_3": Premio3,
          "premio_meta_do_mes": PremioMeta,
          "premio_recorde_de_vendas": PremioRecord,
          "entradas_atendimento": EntradaAt,
          "comisao_atendimento": ComicaoAt,
          "entradas_venda": EntradaVe,
          "comissao_venda": ComicaoVe,
          "entradas_contas": EntradaCont,
          "comissao_conta": ComicaoCont,
          "vendedor": Vendedor.name,
          "user": Vendedor.id,
        }
      };

      const request = await axios(`/api/db/config/post`, {
        method: 'POST',
        data: Data
      });

      const resposta = request.data;
      console.log(resposta);
      props.update(true)
      toast({
        title: 'Salvo com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
      setBloq(false);
      reset();
      setTimeout(() => {
        props.update(false)
      }, 3000);

    } catch (error) {
      console.log(error);
      toast({
        title: 'Erro',
        description: 'Erro ao cadastrar usuario,' + JSON.stringify(error),
        status: 'error',
        duration: 9000,
        isClosable: true
      })
      setBloq(false);
    }
  }

  const reset = () => {
    setAno('');
    setMes('');
    setMeta('');
    setSalario('');
    setCusto('');
    setPremio1('');
    setPremio2('');
    setPremio3('');
    setPremioMeta('');
    setPremioRecord('');
    setEntradaAt('');
    setComicaoAt('');
    setEntradaVe('');
    setComicaoVe('');
    setEntradaCont('');
    setComicaoCont('');
  }


  return (
    <>
      <Flex w={'100%'} flexDir={'column'} justifyContent={'space-between'} p={3}>
        <Box w={'100%'}>
          <Heading size={'md'} mb={3}>
            Pagamentos
          </Heading>
        </Box>
        <Flex gap={4} w={'100%'} px={3} flexWrap={'wrap'} >

          <Box w={'5%'}>
            <FormControl>
              <FormLabel fontSize={'xs'}>Ano</FormLabel>
              <Input
                focusBorderColor="#ffff"
                bg='#ffffff12'
                shadow="sm"
                size="xs"
                w="full"
                fontSize="xs"
                rounded="md"
                type="number"
                value={stringParaNumero(Ano)}
                onChange={(e) => setAno(numeroParaString(e.target.value))}
              />
            </FormControl>
          </Box>

          <Box w={'5%'}>
            <FormControl>
              <FormLabel fontSize={'xs'}>Mês</FormLabel>
              <Input
                focusBorderColor="#ffff"
                bg='#ffffff12'
                shadow="sm"
                size="xs"
                w="full"
                fontSize="xs"
                rounded="md"
                type="number"
                value={stringParaNumero(Mes)}
                onChange={(e) => setMes(numeroParaString(e.target.value))}
              />
            </FormControl>
          </Box>

          <Box w={'12%'}>
            <FormControl>
              <FormLabel fontSize={'xs'}>Meta decêndio</FormLabel>
              <Input
                focusBorderColor="#ffff"
                bg='#ffffff12'
                shadow="sm"
                size="xs"
                w="full"
                fontSize="xs"
                rounded="md"
                type="number"
                value={stringParaNumero(Meta)}
                onChange={(e) => setMeta(numeroParaString(e.target.value))}
              />
            </FormControl>
          </Box>

          <Box w={'12%'}>
            <FormControl>
              <FormLabel fontSize={'xs'}>Salário fixo</FormLabel>
              <Input
                focusBorderColor="#ffff"
                bg='#ffffff12'
                shadow="sm"
                size="xs"
                w="full"
                fontSize="xs"
                rounded="md"
                type="number"
                value={stringParaNumero(Salario)}
                onChange={(e) => setSalario(numeroParaString(e.target.value))}
              />
            </FormControl>
          </Box>

          <Box w={'12%'}>
            <FormControl>
              <FormLabel fontSize={'xs'}>Ajuda de custo</FormLabel>
              <Input
                focusBorderColor="#ffff"
                bg='#ffffff12'
                shadow="sm"
                size="xs"
                w="full"
                fontSize="xs"
                rounded="md"
                type="number"
                value={stringParaNumero(Custo)}
                onChange={(e) => setCusto(numeroParaString(e.target.value))}
              />
            </FormControl>
          </Box>

          <Box w={'12%'}>
            <FormControl>
              <FormLabel fontSize={'xs'}>Prêmio decêndio 1</FormLabel>
              <Input
                focusBorderColor="#ffff"
                bg='#ffffff12'
                shadow="sm"
                size="xs"
                w="full"
                fontSize="xs"
                rounded="md"
                type="number"
                value={stringParaNumero(Premio1)}
                onChange={(e) => setPremio1(numeroParaString(e.target.value))}
              />
            </FormControl>
          </Box>

          <Box w={'12%'}>
            <FormControl>
              <FormLabel fontSize={'xs'}>Prêmio decêndio 2</FormLabel>
              <Input
                focusBorderColor="#ffff"
                bg='#ffffff12'
                shadow="sm"
                size="xs"
                w="full"
                fontSize="xs"
                rounded="md"
                type="number"
                value={stringParaNumero(Premio2)}
                onChange={(e) => setPremio2(numeroParaString(e.target.value))}
              />
            </FormControl>
          </Box>

          <Box w={'12%'}>
            <FormControl>
              <FormLabel fontSize={'xs'}>Prêmio decêndio 3</FormLabel>
              <Input
                focusBorderColor="#ffff"
                bg='#ffffff12'
                shadow="sm"
                size="xs"
                w="full"
                fontSize="xs"
                rounded="md"
                type="number"
                value={stringParaNumero(Premio3)}
                onChange={(e) => setPremio3(numeroParaString(e.target.value))}
              />
            </FormControl>
          </Box>

          <Box w={'12%'}>
            <FormControl>
              <FormLabel fontSize={'xs'}>Prêmio meta do mês</FormLabel>
              <Input
                focusBorderColor="#ffff"
                bg='#ffffff12'
                shadow="sm"
                size="xs"
                w="full"
                fontSize="xs"
                rounded="md"
                type="number"
                value={stringParaNumero(PremioMeta)}
                onChange={(e) => setPremioMeta(numeroParaString(e.target.value))}
              />
            </FormControl>
          </Box>

          <Box w={'12%'}>
            <FormControl>
              <FormLabel fontSize={'xs'}>Prêmio recorde de vendas</FormLabel>
              <Input
                focusBorderColor="#ffff"
                bg='#ffffff12'
                shadow="sm"
                size="xs"
                w="full"
                fontSize="xs"
                rounded="md"
                type="number"
                value={stringParaNumero(PremioRecord)}
                onChange={(e) => setPremioRecord(numeroParaString(e.target.value))}
              />
            </FormControl>
          </Box>

          <Box w={'12%'}>
            <FormControl>
              <FormLabel fontSize={'xs'}>Entradas Atendimento</FormLabel>
              <Input
                focusBorderColor="#ffff"
                bg='#ffffff12'
                shadow="sm"
                size="xs"
                w="full"
                fontSize="xs"
                rounded="md"
                type="number"
                value={stringParaNumero(EntradaAt)}
                onChange={(e) => setEntradaAt(numeroParaString(e.target.value))}
              />
            </FormControl>
          </Box>

          <Box w={'12%'}>
            <FormControl>
              <FormLabel fontSize={'xs'}>Comissão Atendimento</FormLabel>
              <Input
                focusBorderColor="#ffff"
                bg='#ffffff12'
                shadow="sm"
                size="xs"
                w="full"
                fontSize="xs"
                rounded="md"
                type="number"
                value={stringParaNumero(ComicaoAt)}
                onChange={(e) => setComicaoAt(numeroParaString(e.target.value))}
              />
            </FormControl>
          </Box>

          <Box w={'12%'}>
            <FormControl>
              <FormLabel fontSize={'xs'}>Entradas Venda</FormLabel>
              <Input
                focusBorderColor="#ffff"
                bg='#ffffff12'
                shadow="sm"
                size="xs"
                w="full"
                fontSize="xs"
                rounded="md"
                type="number"
                value={stringParaNumero(EntradaVe)}
                onChange={(e) => setEntradaVe(numeroParaString(e.target.value))}
              />
            </FormControl>
          </Box>

          <Box w={'12%'}>
            <FormControl>
              <FormLabel fontSize={'xs'}>Comissão Venda</FormLabel>
              <Input
                focusBorderColor="#ffff"
                bg='#ffffff12'
                shadow="sm"
                size="xs"
                w="full"
                fontSize="xs"
                rounded="md"
                type="number"
                value={stringParaNumero(ComicaoVe)}
                onChange={(e) => setComicaoVe(numeroParaString(e.target.value))}
              />
            </FormControl>
          </Box>

          <Box w={'12%'}>
            <FormControl>
              <FormLabel fontSize={'xs'}>Entradas Conta</FormLabel>
              <Input
                focusBorderColor="#ffff"
                bg='#ffffff12'
                shadow="sm"
                size="xs"
                w="full"
                fontSize="xs"
                rounded="md"
                type="number"
                value={stringParaNumero(EntradaCont)}
                onChange={(e) => setEntradaCont(numeroParaString(e.target.value))}
              />
            </FormControl>
          </Box>

          <Box w={'12%'}>
            <FormControl>
              <FormLabel fontSize={'xs'}>Comissão Conta</FormLabel>
              <Input
                focusBorderColor="#ffff"
                bg='#ffffff12'
                shadow="sm"
                size="xs"
                w="full"
                fontSize="xs"
                rounded="md"
                type="number"
                value={stringParaNumero(ComicaoCont)}
                onChange={(e) => setComicaoCont(numeroParaString(e.target.value))}
              />
            </FormControl>
          </Box>

        </Flex>

        <Flex gap={4} justifyContent={'end'}>
          <Button colorScheme="green" isDisabled={Bloq} onClick={salvar}>Salvar</Button>
        </Flex>
      </Flex>
    </>
  )
}
