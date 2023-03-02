/* eslint-disable react/no-unknown-property */
import { Box, Button, FormLabel, Select } from '@chakra-ui/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { AiOutlineUsergroupAdd } from 'react-icons/ai';

export const RelaciomentoEmpr = (props: { onGetValue: any }) => {
  const [work, setWork] = useState([]);
  const [id, setId] = useState('');

  useEffect(() => {
    (async () => {
      let url = '/api/db/empresas/getEmpresas/get';
      await axios({
        method: 'GET',
        url: url,
      })
        .then(function (response) {
          setWork(response.data.data);
        })
        .catch(function (error) {
          console.log(error);
        });
    })();
  }, []);

  const consultaEmp = async () => {
    let url = '/api/db/empresas/consulta/' + id;
    await axios({
      method: 'GET',
      url: url,
    })
      .then(function (response) {
        console.log(response.data.data);
        props.onGetValue(response.data.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const handleId = (e: any) => {
    const valor = e.target.value;
    setId(valor);
  };

  return (
    <>
      <FormLabel
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
        onChange={handleId}
      >
        {work.map((item) => {
          return (
            <option key={item.id} value={item.id}>
              {item.attributes.nome}
            </option>
          );
        })}
      </Select>
      <Box mt={5}>
        <Button w={'100%'} colorScheme={'telegram'} onClick={consultaEmp}>
          Adicionar <AiOutlineUsergroupAdd fontSize={26} />
        </Button>
      </Box>
    </>
  );
};
