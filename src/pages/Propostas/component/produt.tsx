import {
  Box,
  FormLabel,
  Icon,
  Select,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { BiPlusCircle } from 'react-icons/bi';

export const ProdutiList = (props: { onCnpj: any; onResp: any }) => {
  const [Loading, setLoading] = useState(true);
  const [Produtos, setProdutos] = useState<any>([]);
  const [itenId, setItenId] = useState('');
  const toast = useToast();

  useEffect(() => {
    (async () => {
      const email = localStorage.getItem('email');
      const url = '/api/query/get/produto/cnpj/' + props.onCnpj;
      await fetch(url, {
        method: 'POST',
        body: JSON.stringify(email),
      })
        .then((resp) => resp.json())
        .then((resposta) => {
          const retonoIdeal = resposta.length === 0 ? false : true;
          if (retonoIdeal) {
            setProdutos(resposta);
            setLoading(false);
          } else {
            toast({
              title: 'opss.',
              description: 'Esta empresa não possui produtos.',
              status: 'warning',
              duration: 9000,
              isClosable: true,
            });
          }
        })
        .catch((err) => console.log(err));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.onCnpj]);

  const addItens = () => {
    props.onResp(itenId);
  };

  if (Loading) {
    return (
      <Spinner
        thickness="6px"
        speed="0.45s"
        emptyColor="gray.200"
        color="whatsapp.600"
        size="xl"
      />
    );
  }

  return (
    <>
      <Box
        display="flex"
        gap={8}
        w={'320px'}
        alignItems="center"
        hidden={props.onCnpj === '' ? true : false}
      >
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
            produtos
          </FormLabel>
          <Select
            shadow="sm"
            size="sm"
            w="full"
            fontSize="xs"
            rounded="md"
            placeholder="Selecione um Produto"
            onChange={(e) => setItenId(e.target.value)}
            value={itenId}
          >
            {Produtos.map((item: any) => {
              return (
                <>
                  <option value={item.prodId}>{item.nomeProd}</option>
                </>
              );
            })}
          </Select>
        </Box>
        <Box>
          <Icon
            as={BiPlusCircle}
            boxSize={8}
            mt={8}
            color="whatsapp.600"
            cursor="pointer"
            onClick={addItens}
          />
        </Box>
      </Box>
    </>
  );
};
