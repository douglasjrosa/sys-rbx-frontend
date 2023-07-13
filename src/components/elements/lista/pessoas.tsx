/* eslint-disable react/no-unknown-property */
import { Box, Button, Flex, FormLabel, GridItem, Select } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export const CompPessoa = (props: { Resp: string; onAddResp: any; ID?: string | null }) => {
  const [dados, setDados] = useState<any>([]);
  const [valor, setValor] = useState('');
  const { push } = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = '/api/query/get/listaRespontavel';
        const get = await fetch(url);
        const response = await get.json();
        setDados(response);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  function atualizarValor(event: any) {
    setValor(event.target.value);
    props.onAddResp(event.target.value);
  }

  useEffect(() => {
    setValor(props.Resp);
  }, [props.Resp, valor, dados]);

  return (
    <Box>
      <Flex gap={5}>
        <Box>
          <FormLabel
            fontSize="xs"
            fontWeight="md"
          >
            Responsável
          </FormLabel>
          <Select
            focusBorderColor="#ffff"
            shadow="sm"
            size="xs"
            w="full"
            fontSize="xs"
            rounded="md"
            onChange={atualizarValor}
            value={valor}
          >
            <option style={{background: '#1A202C'}}>não tem</option>
            {!dados
              ? null
              : dados.map((i: any) => {

                return (
                  <option style={{background: '#1A202C'}} key={i.id} value={i.id}>
                    {i.attributes.nome}
                  </option>
                );
              })}
          </Select>
        </Box>
        {/* <Box>
          <Button
            as={GridItem}
            colSpan={[8, 4, null, 2]}
            h={8}
            mt={5}
            colorScheme="orange"
            isDisabled={!valor}
            onClick={() => {
              if (props.ID) {
                localStorage.setItem('idRetorno', props.ID)
                push(`/pessoas/atualizar/${valor}`)
              } else {
                push(`/pessoas/atualizar/${valor}`)
              }
            }}
          >
            Atualizar pessoa
          </Button>
        </Box> */}
      </Flex>

    </Box>
  );
};
