/* eslint-disable react-hooks/exhaustive-deps */
import { Box, chakra, Flex, Link, Toast } from '@chakra-ui/react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function CardBusiness(props: {
  id?: string | null;
  nBusiness?: string | null;
  deadline?: Date | any;
  Budget?: string | null;
  empresa?: any | [];
  criateed?: any | [];
  pedidos?: string | null;
  pedidosQtd?: any | [];
  onloading?: any | [];
  andamento?: string | null;
}) {
  const router = useRouter();
  const empresa = !props.empresa
    ? ''
    : props.empresa.data === null
    ? ''
    : props.empresa.data.attributes.nome;

  const soma = () => {
    const valores = props.pedidosQtd?.map((i: any) =>
      parseFloat(
        i.attributes.totalGeral
          .replace('R$', '')
          .replace('.', '')
          .replace(',', '.'),
      ),
    );
    const soma = valores?.reduce((acc: any, curr: any) => acc + curr, 0);
    return soma?.toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <>
      <Box
        mx="auto"
        px={8}
        py={5}
        mb={5}
        rounded="lg"
        shadow="lg"
        boxShadow="dark-lg"
        bg="white"
        w={'33rem'}
        key={props.id}
        fontSize="0.5rem"
        cursor={'pointer'}
        onClick={() => router.push('/negocios/' + props.id)}
      >
        <Flex justifyContent="space-between" alignItems="center">
          <chakra.span
            fontSize="lg"
            fontWeight={'bold'}
          >
          {empresa}
          </chakra.span>

        </Flex>

        <Box mt={2}>
          <Box
            display={'flex'}
            flexDirection={['column', 'column', 'row', 'row']}
          >
          </Box>
          <Box
            display={'flex'}
            alignItems={'center'}
            gap={5}
            flexWrap={'wrap'}
            lineHeight={'0.5rem'}
          >
            <Flex>
              <chakra.p
                color="gray.600"
                fontSize="0.8rem"
              >
                Estimativa:
              </chakra.p>
              <chakra.p
                color="gray.600"
                ms={2}
                fontSize="0.8rem"
              >
                {props.Budget}
              </chakra.p>
            </Flex>
            <Flex>
              <chakra.p
                color="gray.600"
                fontSize="0.8rem"
              >
                Data de Emtrega:
              </chakra.p>
              <chakra.p
                color="gray.600"
                ms={2}
                fontSize="0.8rem"
              >
                {new Date(props.deadline).toLocaleDateString()}
              </chakra.p>
            </Flex>
            <Flex alignItems="center">
              <chakra.p
                color="gray.600"
                fontSize="0.8rem"
              >
                pedidi:
              </chakra.p>
              <chakra.p
                color="gray.600"
                ms={2}
                fontWeight={'semibold'}
              >
                {props.nBusiness}
              </chakra.p>
            </Flex>
            <Flex alignItems="center">
              <chakra.p
                color="gray.600"
                fontSize="0.8rem"
              >
                Andamento:
              </chakra.p>
              <chakra.p
                color="gray.600"
                ms={2}
                fontWeight={'semibold'}
              >
                {props.nBusiness}
              </chakra.p>
            </Flex>
            <Flex alignItems="center">
              <chakra.p
                color="gray.600"
                fontSize="0.8rem"
              >
                Qtd proposta:
              </chakra.p>
              <chakra.p
                color="gray.600"
                ms={2}
                fontSize="0.8rem"
              >
                {props.pedidos}
              </chakra.p>
            </Flex>
          </Box>
        </Box>
      </Box>
    </>
  );
}
