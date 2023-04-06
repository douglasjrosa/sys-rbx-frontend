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

export const ProdutiList = (props: {
  onCnpj: any;
  onResp: any;
  ontime: boolean;
  retunLoading: any;
}) => {
  const [Loading, setLoading] = useState(true);
  const [Load, setLoad] = useState<boolean>(false);
  const [Produtos, setProdutos] = useState<any>([]);
  const [itenId, setItenId] = useState('');
  const toast = useToast();

  useEffect(() => {
    (async () => {
      const email = localStorage.getItem('email');
      const url = '/api/query/get/produto/cnpj/' + props.onCnpj;
      if (props.onCnpj !== '' && Produtos.length === 0) {
        await fetch(url, {
          method: 'POST',
          body: JSON.stringify(email),
        })
          .then((resp) => resp.json())
          .then((resposta) => {
            const retonoIdeal = resposta.length === 0 ? false : true;
            if (retonoIdeal) {
              setProdutos(resposta);
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
      }
    })();
    if (props.ontime === false) {
      setLoading(false);
    }
  }, [Produtos.length, props.onCnpj, props.ontime, toast]);

  useEffect(() => {
    props.retunLoading(Load);
  }, [Load, props, props.retunLoading]);

  const addItens = async () => {
    setLoad(true);
    try {
      const url = `/api/query/get/produto/id/${itenId}`;
      const email = localStorage.getItem('email');
      const resp = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(email),
      });
      const resposta = await resp.json();
      props.onResp(resposta);
      setLoad(false);
    } catch (err: any) {
      console.log(err);
      setLoad(false);
      toast({
        title: 'opss.',
        description: err,
        status: 'error',
        duration: 9000,
        isClosable: true,
      });
    }
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
