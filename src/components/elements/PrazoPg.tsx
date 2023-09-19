/* eslint-disable react/display-name */
import { Box, Button, ButtonGroup, Flex, FormControl, FormLabel, Input, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverTrigger, Select, useDisclosure } from "@chakra-ui/react";
import axios from "axios";
import { useState, useEffect, useRef } from "react";


export const PrazoPg = (props: { id: any; retorno: any; envio: any }) => {
  const [maxPg, setMaxpg] = useState("0");
  const [Titulo, setTitulo] = useState("");
  const [Valor, setValor] = useState("");
  const [Id, setId] = useState("");
  const [Data, setData] = useState<any>([]);
  const { onOpen, onClose, isOpen } = useDisclosure()
  const [Block, setBlock] = useState(false)
  const firstFieldRef = useRef(null)

  useEffect(() => {
    if (props.retorno) {
      setMaxpg(props.retorno)
    }
    if (props.id) {
      setId(props.id);
      (async () => {
        await axios({
          method: "GET",
          url: `/api/db/empresas/getMaxPrazoPg?Empresa=${props.id}`,
        })
          .then((res) => setData(res.data))
          .catch((err) => console.error(err));
      })()
    }
  }, [props.id, props.retorno])

  const salvar = async () => {
    setBlock(true)
    const Dados = {
      data: {
        title: Titulo,
        value: Valor,
        empresa: Id
      }
    }

    await axios({

      method: "POST",
      url: `/api/db/empresas/setMaxPrazoPg`,
      data: Dados
    })
      .then(async () => {
        try {
          const resposta = await axios({
            method: "GET",
            url: `/api/db/empresas/getMaxPrazoPg?Empresa=${Id}`,
          });
          setData(resposta.data)
          setValor('')
          setTitulo('')
          onClose()
          setBlock(false)
        } catch (error) {
          console.log(error)
          setBlock(false)
        }

      })
      .catch((err) => {
        console.error(err)
        setBlock(false)});
  }


  return (
    <>
      <Flex gap={3} alignItems={'self-end'}>
        <Box>
          {/* Label for the maximum payment deadline selection */}
          <FormLabel
            htmlFor="prazo pagamento"
            fontSize="xs"
            fontWeight="md"
          >
            Máximo prazo p/ pagamento:
          </FormLabel>
          {/* Select element for choosing the maximum payment deadline */}
          <Select
            focusBorderColor="#ffff"
            bg='#ffffff12'
            shadow="sm"
            size="xs"
            w="full"
            fontSize="xs"
            rounded="md"
            onChange={(e) => props.envio(e.target.value)}
            value={maxPg}
          >
            {/* Default option */}
            <option style={{ backgroundColor: "#1A202C" }}>
              Selecione uma tabela
            </option>
            {Data.map((i: any) => {

              return (
                <option style={{ backgroundColor: "#1A202C" }} key={i.id} value={i.attributes.value}>
                  {i.attributes.title}
                </option>
              )
            })}
          </Select>
        </Box>
        <Popover
          isOpen={isOpen}
          initialFocusRef={firstFieldRef}
          onOpen={onOpen}
          onClose={onClose}
          placement='right'
          closeOnBlur={false}
        >
          <PopoverTrigger>
            <Button colorScheme="whatsapp">Adicionar prazo</Button>
          </PopoverTrigger>
          <PopoverContent p={5}>
            <PopoverArrow />
            <PopoverCloseButton color={'black'} />
            <PopoverBody>

              <FormControl>
                <FormLabel
                  color={"black"}
                >
                  Titulo
                </FormLabel>
                <Input
                  type="text"
                  color={"black"}
                  onChange={(e) => setTitulo(e.target.value)}
                  value={Titulo}
                />
              </FormControl>

              <FormControl>
                <FormLabel
                  color={"black"}
                >
                  Valor
                </FormLabel>
                <Input
                  type="text"
                  color={"black"}
                  onChange={(e) => {
                    const valor = e.target.value;
                    const numeros = valor.replace(/\D/g, '');
                    setValor(numeros)
                  }}
                  value={Valor}
                />
              </FormControl>

              <ButtonGroup display='flex' justifyContent='flex-end' mt={3}>
                <Button variant='outline' onClick={onClose}>
                  Cancel
                </Button>
                <Button isDisabled={Block} colorScheme='teal' onClick={salvar}>
                  Salvar
                </Button>
              </ButtonGroup>

            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Flex>

    </>
  );
};
