import {
  Box,
  FormLabel,
  IconButton,
  Select,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { MdOutlineAddCircleOutline } from "react-icons/md";

export const ProdutiList = (props: {
 Lista?: any;
 Retorno?: any
 Reload: any
}) => {
  const [Load, setLoad] = useState<boolean>(false);
  const [Produtos, setProdutos] = useState<any | null>(null);
  const [itenId, setItenId] = useState("");


  useEffect(() => {
    setProdutos(props.Lista);
  }, [props, props.Lista]);

  const addItens = async () => {
    props.Reload(true);
    const email = localStorage.getItem("email");
    const url = `/api/query/get/produto/id/${itenId}`;
    await fetch(url, {
      method: "POST",
      body: JSON.stringify(email),
    })
      .then((resp) => resp.json())
      .then((resposta) => {
        props.Retorno(resposta);
        props.Reload(false);
      })
      .catch((err) => {
        console.log(err);
        props.Reload(false);
      });
  };

  return (
    <>
      <Box>
        <Box
          display="flex"
          gap={5}
          w={"320px"}
          alignItems="center"
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
              size="xs"
              w="14rem"
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
