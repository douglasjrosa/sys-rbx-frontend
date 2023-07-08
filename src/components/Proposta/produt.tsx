import {
  Box,
  FormLabel,
  Icon,
  IconButton,
  Select,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BiPlusCircle } from "react-icons/bi";
import { MdOutlineAddCircleOutline } from "react-icons/md";

export const ProdutiList = (props: {
  onCnpj: any;
  onResp: any;
  ontime: boolean;
  retunLoading: any;
  idProd: number;
}) => {
  const [Load, setLoad] = useState<boolean>(false);
  const [Produtos, setProdutos] = useState<any | null>(null);
  const [itenId, setItenId] = useState("");
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const email = localStorage.getItem("email");
      const url = "/api/query/get/produto/cnpj/" + props.onCnpj;
      if (props.onCnpj !== "" ) {
        await fetch(url, {
          method: "POST",
          body: JSON.stringify(email),
        })
          .then((resp) => resp.json())
          .then((resposta) => {
            const retonoIdeal =
              resposta.length === 0
                ? false
                : resposta.status === false
                  ? false
                  : true;
             if(resposta.error){
              setProdutos([]);
             }
            if (retonoIdeal) {
              setProdutos(resposta);
            } else {
              setProdutos([]);
              toast({
                title: "ops.",
                description: "Esta empresa não possui produtos.",
                status: "warning",
                duration: 9000,
                isClosable: true,
              });
              setTimeout(() => router.push("/produtos"), 5 * 1000);
            }
          })
          .catch((err) => {
            console.log(err.response.dara.message)
            toast({
              title: "ops.",
              description: err.response.dara.message,
              status: "error",
              duration: 9000,
              isClosable: true,
            });
          });
      }
    })();

  }, [Produtos?.length, props.onCnpj, props.ontime, router, toast]);

  useEffect(() => {
    props.retunLoading(Load);
  }, [Load, props, props.retunLoading]);

  const addItens = async () => {
    setLoad(true);
    const email = localStorage.getItem("email");
    const url = `/api/query/get/produto/id/${itenId}`;
    await fetch(url, {
      method: "POST",
      body: JSON.stringify(email),
    })
      .then((resp) => resp.json())
      .then((resposta) => {

        props.onResp(resposta);
        setLoad(false);
      })
      .catch((err) => {
        console.log(err);
        setLoad(false);
      });
  };

  return (
    <>
      <Box hidden={props.ontime}>
        <Box
          display="flex"
          gap={8}
          w={"320px"}
          alignItems="center"
          hidden={props.onCnpj === "" ? true : false}
        >
          <Box>
            <FormLabel
              fontSize="xs"
              fontWeight="md"
            >
              Produtos
            </FormLabel>
            <Select
              shadow="sm"
              size="sm"
              w="15rem"
              fontSize="xs"
              rounded="md"
              onChange={(e) => setItenId(e.target.value)}
              value={itenId}
            >
               <option style={{ backgroundColor: "#1A202C" }}>Selecione um Produto</option>
              {!Produtos? null : Produtos.map((item: any) => {
                return (
                  <>
                    <option style={{ backgroundColor: "#1A202C" }} key={item.prodId} value={item.prodId}>{item.nomeProd}</option>
                  </>
                );
              })}
            </Select>
          </Box>
          <Box>
            <IconButton
              aria-label="Add Negocio"
              rounded={'3xl'}
              mt={6}
              colorScheme="tranparent"
              onClick={addItens}
              isDisabled={Load}
            >
              <MdOutlineAddCircleOutline color="#179848" size={'2rem'} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </>
  );
};
