import {
  Button,
  ButtonGroup,
  ChakraProvider,
  extendTheme,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Select,
  useDisclosure,
} from "@chakra-ui/react";
import axios from "axios";

import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MdOutlineAddCircleOutline } from "react-icons/md";

const activeLabelStyles = {
  transform: "scale(0.85) translateY(-24px)",
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
            "input:not(:placeholder-shown) + label, .chakra-select__wrapper + label, textarea:not(:placeholder-shown) ~ label":
            {
              ...activeLabelStyles,
            },
            label: {
              top: 0,
              left: 0,
              zIndex: 2,
              position: "absolute",
              backgroundColor: "blue.600",
              rounded: "6px",
              pointerEvents: "none",
              mx: 3,
              px: 1,
              my: 2,
              transformOrigin: "left top",
            },
          },
        },
      },
    },
  },
});


export const BtCreate = (props: { user: any; onLoading: any }) => {
  const { data: session } = useSession();
  const [work, setWork] = useState<any | null>([]);
  const [budgets, setBudgets] = useState<any>();
  const [Approach, setApproach] = useState("");
  const [Empresa, setEmpresa] = useState("");
  const [Deadline, setDeadline] = useState("");
  const [Etapa, setEtapa] = useState("");
  const [USER, setUSER] = useState<string | null>(null);
  const { onOpen, onClose, isOpen } = useDisclosure();
  const dataAtual: Date = new Date();
  const router = useRouter()

  useEffect(() => {
    const usuario = props.user
    if (usuario) {
      (async () => {
        const url = `/api/db/empresas/get?Vendedor=${usuario}`;
        const url1 = `/api/db/empresas/get`;
        try {
          const response = await axios(url);
          const response1 = await axios(url1);
          const GetVendedor = response.data;
          const GetEnpresas = response1.data;
          const resultado = [...GetVendedor, ...GetEnpresas]
          setWork(resultado);
        } catch (error) {
          console.log(error);
        }
      })();
    }
  }, [props.user]);

  const historico = {
    vendedor: session?.user.name,
    date:
      new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
    msg: `Vendedor ${session?.user.name}, criou esse Negócio`,
  };

  const MSG = {
    msg: `Vendedor ${session?.user.name}, criou esse Negócio`,
    date: new Date().toISOString(),
    user: "Sistema",
  };

  const salve = async () => {
    props.onLoading(true);

    const data = {
      status: true,
      deadline: Deadline,
      Budget: budgets,
      Approach: Approach,
      empresa: Empresa,
      history: historico,
      vendedor: session?.user.id,
      vendedor_name: session?.user.name,
      DataRetorno: dataAtual.toISOString(),
      incidentRecord: [MSG],
      etapa: 2,
    };

    const url = "/api/db/business/post";
    await axios({
      method: "POST",
      url: url,
      data: data,
    })
      .then((res) => {
        console.log(res.data.nBusiness);
        router.push(`/negocios/${res.data.nBusiness}`)
      })
      .catch((err) => console.error(err));
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
          <IconButton
            aria-label="Add Negocio"
            rounded={'3xl'}
            colorScheme="whatsapp"
            me={'5rem'}
          >
            <MdOutlineAddCircleOutline color="#ffff" size={'2rem'} />
          </IconButton>
        </PopoverTrigger>
        <PopoverContent color="white" bg="blue.800" borderColor="blue.800">
          <PopoverHeader pt={4} fontWeight="bold" border="0">
            Criar novo Negócio
          </PopoverHeader>
          <PopoverArrow bg="blue.800" />
          <PopoverBody>
            Preencha com as informações abaixo
            <Select
              mt={2}
              onChange={(e) => setEmpresa(e.target.value)}
              value={Empresa}
            >
              <option style={{ backgroundColor: "#2A4365" }} value="">Selecione uma empresa</option>
              {work.map((item: any) => {
                return (
                  <option
                    style={{ backgroundColor: "#2A4365" }}
                    key={item.id}
                    value={item.id}
                  >
                    {item.attributes.nome}
                  </option>
                );
              })}
            </Select>
          </PopoverBody>
          <PopoverFooter
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            pb={4}
          >
            <ButtonGroup size="sm">
              <Button colorScheme="blue" onClick={onClose}>
                Cancelar
              </Button>
              <Button
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
