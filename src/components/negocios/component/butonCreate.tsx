/* eslint-disable react/no-children-prop */
import {
  Box,
  Button,
  ButtonGroup,
  ChakraProvider,
  extendTheme,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Select,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { BeatLoader } from 'react-spinners';
import { mask, unMask } from 'remask';

const activeLabelStyles = {
  transform: 'scale(0.85) translateY(-24px)',
};
export const theme = extendTheme({
  components: {
    Form: {
      variants: {
        floating: {
          container: {
            _focusWithin: {
              label: {
                ...activeLabelStyles,
              },
            },
            'input:not(:placeholder-shown) + label, .chakra-select__wrapper + label, textarea:not(:placeholder-shown) ~ label':
              {
                ...activeLabelStyles,
              },
            label: {
              top: 0,
              left: 0,
              zIndex: 2,
              position: 'absolute',
              backgroundColor: 'blue.600',
              rounded: '6px',
              pointerEvents: 'none',
              mx: 3,
              px: 1,
              my: 2,
              transformOrigin: 'left top',
            },
          },
        },
      },
    },
  },
});

export const BtCreate = (props: { onLoading: any }) => {
  const { data: session } = useSession();
  const [work, setWork] = useState([]);
  const [budgets, setBudgets] = useState('');
  const [budgetsMask, setBudgetsMask] = useState('');
  const [Approach, setApproach] = useState('');
  const [Empresa, setEmpresa] = useState('');
  const [Deadline, setDeadline] = useState('');
  const { onOpen, onClose, isOpen } = useDisclosure();

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

  const maskPreco = (e: any) => {
    const originalVelue = unMask(e.target.value);
    const maskedValue = mask(originalVelue, [
      ', 9',
      ',99',
      '9,99',
      '99,99',
      '999,99',
      '9.999,99',
      '99.999,99',
      '999.999,99',
      '9.999.999,99',
      '99.999.999,99',
      '999.999.999,99',
    ]);
    const valor =
      originalVelue > 99
        ? originalVelue
            .replace(/[^\d]/g, '')
            .replace(/^0+/, '')
            .replace(/(\d{1,})(\d{2})$/, '$1.$2')
        : originalVelue;
    setBudgets(valor);
    setBudgetsMask(maskedValue);
  };

  const historico = {
    vendedor: session.user.name,
    date:
      new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
    msg: `Vendedor ${session.user.name}, criou esse Busines`,
  };

  const salve = async () => {
    // props.onLoading(true);
    const data = {
      status: true,
      deadline: Deadline,
      Budget: parseFloat(budgets).toLocaleString('pt-br', {
        style: 'currency',
        currency: 'BRL',
      }),
      Approach: Approach,
      empresa: Empresa,
      history: historico,
      user: session.user.id,
      incidentRecord: [],
    };
    const url = '/api/db/business/post';
    await axios({
      method: 'POST',
      url: url,
      data: data,
    })
      .then((res) => {
        console.log(res);
        props.onLoading(true);
        Reset();
      })
      .catch((err) => console.error(err));
  };

  const Reset = () => {
    setBudgets('');
    setBudgetsMask('');
    setApproach('');
    setEmpresa('');
    setDeadline('');
    setBudgetsMask('');
    onClose();
  };

  return (
    <ChakraProvider theme={theme}>
      <Popover
        placement="bottom"
        closeOnBlur={false}
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
      >
        <PopoverTrigger>
          <Button h={{ md: '40%', sm: '70%' }} colorScheme="whatsapp">
            New
          </Button>
        </PopoverTrigger>
        <PopoverContent color="white" bg="blue.800" borderColor="blue.800">
          <PopoverHeader pt={4} fontWeight="bold" border="0">
            Criar novo Business
          </PopoverHeader>
          <PopoverArrow bg="blue.800" />
          <PopoverBody>
            Preencha comas informaçoes abaixo
            <Select
              mt={2}
              placeholder="Selecione uma empresa"
              onChange={(e) => setEmpresa(e.target.value)}
              value={Empresa}
            >
              {work.map((item) => {
                return (
                  <option
                    style={{ backgroundColor: '#2A4365' }}
                    key={item.id}
                    value={item.id}
                  >
                    {item.attributes.nome}
                  </option>
                );
              })}
            </Select>
            <Tooltip label="tipo de atendimento">
              <Select
                mt={2}
                placeholder="Selecione o tipo de Approach"
                onChange={(e) => setApproach(e.target.value)}
                value={Approach}
              >
                return (
                <option style={{ backgroundColor: '#2A4365' }} value="interno">
                  Cliente entrou em contato
                </option>
                <option style={{ backgroundColor: '#2A4365' }} value="externo">
                  vendedor entrou em contato
                </option>
                );
              </Select>
            </Tooltip>
            <InputGroup mt={2}>
              <InputLeftElement pointerEvents="none" children={'R$'} />
              <Input
                type="text"
                placeholder="Orçamento estimado"
                value={budgetsMask}
                onChange={maskPreco}
              />
            </InputGroup>
            <Tooltip label="Prazo limite de entrega">
              <FormControl variant="floating" mt={5} id="first-name">
                <Input
                  type={'date'}
                  onChange={(e) => setDeadline(e.target.value)}
                  value={Deadline}
                />
                <FormLabel>Deadline</FormLabel>
              </FormControl>
            </Tooltip>
          </PopoverBody>
          <PopoverFooter
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            pb={4}
          >
            <Box fontSize="sm"></Box>
            <ButtonGroup size="sm">
              <Button colorScheme="blue" onClick={Reset}>
                Cancelar
              </Button>
              <Button
                isLoading={Empresa && Deadline ? false : true}
                spinner={<BeatLoader size={8} color="white" />}
                colorScheme="whatsapp"
                onClick={salve}
              >
                Salvar
              </Button>
            </ButtonGroup>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
    </ChakraProvider>
  );
};
