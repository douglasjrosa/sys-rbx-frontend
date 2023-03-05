/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
  Flex,
  FormLabel,
  Input,
  Select,
  Switch,
} from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Business } from '../../../types/Busines';

export const NegocioHeader = (props: {
  // nBusiness: string;
  onNBusiness: any;
  // Approach: string;
  onApproach: any;
  // Budget: string;
  onBudget: any;
  // Status: string;
  onStatus: any;
  // Deadline: string;
  onDeadline: any;
}) => {
  const router = useRouter();
  const id = router.query.id;
  const [Infos, setInfos] = useState<Business | any>([]);

  useEffect(() => {
    (async () => {
      const url = '/api/db/business/get/id/' + id;
      console.log(url);
      //cunsulta informaçoes geraris do cliente
      await axios({
        method: 'GET',
        url: url,
      })
        .then((res) => {
          console.log(res.data);
          const resposta = res.data;
          setInfos([resposta]);
          // fim do loading
          // setLoadingGeral(false);
        })
        .catch((err) => {
          console.log(err);
          // fim do loading
          // setLoadingGeral(false);
        });
    })();
  }, []);

  function setBusines(e: any) {
    const valor = e.target.value;
    props.onNBusiness(valor);
  }
  function setBudget(e: any) {
    props.onBudget(e.target.value);
  }
  function setApproach(e: any) {
    props.onApproach(e.target.value);
  }
  function setStatus(e: any) {
    props.onStatus(e.target.value);
  }
  function setDeadline(e: any) {
    props.onDeadline(e.target.value);
  }

  console.log(Infos);
  return (
    <>
      <Flex gap={8}>
        <Box>
          <FormLabel
            htmlFor="cidade"
            fontSize="xs"
            fontWeight="md"
            color="gray.700"
            _dark={{
              color: 'gray.50',
            }}
          >
            N° Negocio
          </FormLabel>
          <Input
            shadow="sm"
            size="sm"
            w="full"
            fontSize="xs"
            rounded="md"
            onChange={setBusines}
            // value={Infos.attributes.nBusiness}
          />
        </Box>
        <Box>
          <FormLabel
            htmlFor="cidade"
            fontSize="xs"
            fontWeight="md"
            color="gray.700"
            _dark={{
              color: 'gray.50',
            }}
          >
            atendimento
          </FormLabel>
          <Select
            shadow="sm"
            size="sm"
            w="full"
            fontSize="xs"
            rounded="md"
            placeholder="Selecione um Produto"
            onChange={setApproach}
            // value={Infos.attributes.Approach}
          >
            <option value="interno">Cliente entrou em contato</option>
            <option value="externo">vendedor entrou em contato</option>
          </Select>
        </Box>
        <Box>
          <FormLabel
            htmlFor="cidade"
            fontSize="xs"
            fontWeight="md"
            color="gray.700"
            _dark={{
              color: 'gray.50',
            }}
          >
            Budget
          </FormLabel>
          <Input
            shadow="sm"
            size="sm"
            w="full"
            fontSize="xs"
            rounded="md"
            onChange={setBudget}
            // value={Infos.attributes.Budget}
          />
        </Box>
        <Box>
          <FormLabel
            htmlFor="cidade"
            fontSize="xs"
            fontWeight="md"
            color="gray.700"
            _dark={{
              color: 'gray.50',
            }}
          >
            Deadline
          </FormLabel>
          <Input
            shadow="sm"
            size="sm"
            w="full"
            type={'date'}
            fontSize="xs"
            rounded="md"
            onChange={setDeadline}
            // value={Infos.attributes.deadline}
          />
        </Box>
        <Box>
          <FormLabel
            htmlFor="cidade"
            fontSize="xs"
            fontWeight="md"
            color="gray.700"
            _dark={{
              color: 'gray.50',
            }}
          >
            Status
          </FormLabel>
          <Switch
            size="md"
            colorScheme="whatsapp"
            onChange={setStatus}
            // value={Infos.attributes.status}
          />
        </Box>
        <Box>
          <Button colorScheme={'whatsapp'}>salve</Button>
        </Box>
      </Flex>
    </>
  );
};
