import { Search2Icon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { CardList } from '../../components/Proposta/listaItens';

export default function ListaProposta() {
  const router = useRouter();
  const [Cnpj, setCnpj] = useState(false);
  const [Pedido, setPedido] = useState(false);
  const [Data, setData] = useState(false);
  const [DataStart, setDataStart] = useState('');
  const [DataEnd, setDataEnd] = useState('');
  const [Txt, setText] = useState('');
  const [Render, setRender] = useState(false);

  const pesquisaTxt = () => {
    const txt = Pedido ? 'pelo numero do Pedido' : 'pelo numero do Cnpj';
    const PlaceHolder = `Pesquise ${txt}`;
    return (
      <>
        <InputGroup size="md">
          <Input
            pr="6rem"
            w={'full'}
            type={'text'}
            placeholder={PlaceHolder}
            onChange={(e) => setText(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={() => setRender(true)}>
              <Search2Icon />
            </Button>
          </InputRightElement>
        </InputGroup>
      </>
    );
  };
  const pesquisaDate = () => {
    return (
      <>
        <InputGroup size="md" gap={6}>
          <Input
            type={'date'}
            w={{ md: '12rem' }}
            onChange={(e) => setDataStart(e.target.value)}
          />
          <Input
            type={'date'}
            w={{ md: '12rem' }}
            onChange={(e) => setDataEnd(e.target.value)}
          />

          <Flex alignItems={'center'}>
            <Button h="1.75rem" size="sm" onClick={() => setRender(true)}>
              <Search2Icon />
            </Button>
          </Flex>
        </InputGroup>
      </>
    );
  };

  const SetUrl = Data
    ? `/db/proposta/get/date?StartDate=${DataStart}&EndDate=${DataEnd}`
    : Cnpj
    ? `/db/proposta/get/cnpj/${Txt}`
    : `/db/proposta/get/Pedido/${Txt}`;


    useEffect(() => {

    }, []);

  return (
    <>
      <Flex h="100%" w="100%" flexDir={'column'} justifyContent="center">
        <Flex
          h={28}
          w={{ md: '80%', sm: '100%' }}
          borderBottom={'2px'}
          borderColor={'gray.200'}
          m="auto"
          mt={{ md: 5, sm: '1.5rem' }}
          justifyContent={'space-evenly'}
          alignItems={'center'}
          flexDir={{ sm: 'column', md: 'row' }}
        >
          <Box>
            <Box h={'3rem'} w="400px">
              {!Data && !Pedido && !Cnpj
                ? null
                : Data
                ? pesquisaDate()
                : pesquisaTxt()}
            </Box>
            <Flex gap={8} justifyContent={'center'}>
              <Checkbox
                isDisabled={Pedido || Data ? true : false}
                onChange={(e) => setCnpj(e.target.checked)}
              >
                CNPJ
              </Checkbox>
              <Checkbox
                isDisabled={Cnpj || Data ? true : false}
                onChange={(e) => setPedido(e.target.checked)}
              >
                Numero do pedido
              </Checkbox>
              <Checkbox
                isDisabled={Pedido || Cnpj ? true : false}
                onChange={(e) => setData(e.target.checked)}
              >
                Data
              </Checkbox>
            </Flex>
          </Box>
          <Box
            display={'flex'}
            flexDir={{ md: 'column', sm: 'row' }}
            h="100%"
            justifyContent={'space-evenly'}
          >
            <Button
              h={{ md: '40%', sm: '70%' }}
              colorScheme="whatsapp"
              onClick={() => router.push('/Propostas/create')}
            >
              Gerar Proposta
            </Button>
          </Box>
        </Flex>
        <Box h={'85%'} overflow={'auto'}>
          <Flex
            bg="#edf3f8"
            _dark={{
              bg: '#3e3e3e',
            }}
            pt={'3rem'}
            pb={'2rem'}
            px={'2rem'}
            h="100%"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            gap={5}
          >
            {!Render ? (
              <CardList url={'/api/db/proposta/get'} />
            ) : (
              <CardList url={SetUrl} />
            )}
          </Flex>
        </Box>
      </Flex>
    </>
  );
}
