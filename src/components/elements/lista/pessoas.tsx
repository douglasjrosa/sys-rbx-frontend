import { capitalizeWords } from '@/function/captalize';
import { Box, Button, Flex, FormControl, FormLabel, GridItem, Heading, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, SimpleGrid, Textarea, useDisclosure } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { PessoasData } from './pessoasdata';
import { useSession } from 'next-auth/react';

interface pessoalResp {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  whatsapp: string;
  departamento: string;
  Cargo: string;
  obs: string;
}

export const CompPessoa = (props: { Resp: string; onAddResp: any; }) => {
  const [dados, setDados] = useState<any>([]);
  const [Nome, setNome] = useState('');
  const [Email, setEmail] = useState('');
  const [Telefone, setTelefone] = useState('');
  const [WhatApp, setWhatApp] = useState('');
  const [Departamento, setDepartamento] = useState('');
  const [Cargo, setCargo] = useState('');
  const [Obs, setObs] = useState('');
  const [Id, setId] = useState<number>();
  const [UPdate, setUPdate] = useState(false);
  const { data: session } = useSession();

  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    if (props.Resp) {
      const dadosEntrada: any = props.Resp
      const SemVendedor = dadosEntrada.filter((i: any) => i.Vendedor === '' || !i.Vendedor);
      const setVendedor = dadosEntrada.filter((i: any) => i.Vendedor === session?.user?.name);
      const setAdm = dadosEntrada.filter((i: any) => i.Vendedor === 'Adm');
      const DataArray = [...SemVendedor, ...setVendedor, ...setAdm]

      setDados(DataArray)
    }
  }, [props.Resp, session?.user?.name])


  const reset = () => {
    setNome('');
    setEmail('');
    setTelefone('');
    setWhatApp('');
    setDepartamento('');
    setCargo('');
    setObs('');

  }

  const SaveAdd = () => {
    if (dados.length === 0) {
      const Data = {
        id: 1,
        nome: Nome,
        email: Email,
        telefone: Telefone,
        whatsapp: WhatApp,
        departamento: Departamento,
        Cargo: Cargo,
        obs: Obs,
        Vendedor: session?.user?.pemission === "Adm" ? 'Adm' : session?.user?.name
      }
      const valor = [Data];
      setDados(valor);
      props.onAddResp(valor)
      onClose()
      reset()
    } else {
      const Data = {
        id: dados.length + 1,
        nome: Nome,
        email: Email,
        telefone: Telefone,
        whatsapp: WhatApp,
        departamento: Departamento,
        Cargo: Cargo,
        obs: Obs,
        Vendedor: session?.user?.pemission === "Adm" ? 'Adm' : session?.user?.name
      }
      const valor = [...dados, Data];
      setDados(valor);
      props.onAddResp(valor)
      onClose()
      reset()
    }
  }

  function Remover(id: any) {
    const filter = dados.filter((i: any) => i.id !== id)
    setDados(filter)
    props.onAddResp(filter)

  }

  function Atualizar(id: any) {
    const [filter] = dados.filter((i: any) => i.id === id)
    const result: pessoalResp = filter
    setId(id)
    setNome(result.nome);
    setEmail(result.email);
    setTelefone(result.telefone);
    setWhatApp(result.whatsapp);
    setDepartamento(result.departamento);
    setCargo(result.Cargo);
    setObs(result.obs);
    setUPdate(true);
    onOpen()
  }


  function Update(id: any) {
    const objetoAtualizado = {
      id: Id,
      nome: Nome,
      email: Email,
      telefone: Telefone,
      whatsapp: WhatApp,
      departamento: Departamento,
      Cargo: Cargo,
      obs: Obs
    }
    // Encontra o objeto no array com o "id" correspondente
    const objetoIndex = dados.findIndex((obj: any) => obj.id === Id);

    if (objetoIndex !== -1) {
      const newArrayDeObjetos = [...dados]; // Cria uma cópia do array
      newArrayDeObjetos[objetoIndex] = { ...objetoAtualizado, Id }; // Atualiza o objeto na cópia do array
      setDados(newArrayDeObjetos); // Atualiza o estado com o novo array
      props.onAddResp(newArrayDeObjetos)
      onClose()
      reset()
    }
  }


  return (
    <Box>
      <Flex gap={5} flexDir={'row'} alignItems={'self-end'}>
        <Button
          h={8}
          px={5}
          colorScheme="teal"
          onClick={onOpen}
        >
          + Nova Pessoa
        </Button>

        {dados.map((i: any) => <PessoasData key={i.id} data={i} respData={Remover} respAtualizar={Atualizar} />)}

      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={'gray.600'}>
          <ModalHeader>Add Pessoal</ModalHeader>
          <ModalCloseButton />
          <ModalBody >
            <SimpleGrid
              w={'100%'}
              columns={1}
              spacing={6}
            >

              <SimpleGrid columns={12} spacing={3}>
                <FormControl as={GridItem} colSpan={[12]}>
                  <FormLabel fontSize="xs" fontWeight="md">
                    Nome
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
                    value={Nome}
                  />
                </FormControl>

                <FormControl as={GridItem} colSpan={6}>
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
                    value={Email}
                  />
                </FormControl>

                <FormControl as={GridItem} colSpan={6}>
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
                    onChange={(e) => setTelefone(e.target.value)}
                    value={Telefone}
                  />
                </FormControl>

                <FormControl as={GridItem} colSpan={6}>
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
                    onChange={(e) => setWhatApp(e.target.value)}
                    value={WhatApp}
                  />
                </FormControl>

                <FormControl as={GridItem} colSpan={6}>
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

                <FormControl as={GridItem} colSpan={9}>
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

              <SimpleGrid columns={12} spacing={3}>

                <Heading as={GridItem} colSpan={12} size="sd">
                  Observações
                </Heading>
                <Box as={GridItem} colSpan={12} >
                  <Textarea
                    borderColor="white"
                    bg={'#ffffff12'}
                    placeholder="Especifique aqui, todos os detalhes do cliente"
                    size="sm"
                    resize={"none"}
                    onChange={(e: any) => setObs(capitalizeWords(e.target.value))}
                    value={Obs}
                  />
                </Box>
              </SimpleGrid>

            </SimpleGrid>

          </ModalBody>
          <ModalFooter>
            {!UPdate && <Button colorScheme='blue' mr={3} onClick={SaveAdd}>Adicionar</Button>}
            {!!UPdate && <Button colorScheme='blue' mr={3} onClick={Update}>Atualizar</Button>}

          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  );
};
