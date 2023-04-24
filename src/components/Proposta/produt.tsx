import {
  Box,
  FormLabel,
  Icon,
  Select,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BiPlusCircle } from "react-icons/bi";

export const ProdutiList = (props: {
  onCnpj: any;
  onResp: any;
  ontime: boolean;
  retunLoading: any;
  idProd: number;
}) => {
  const [Loading, setLoading] = useState(true);
  const [Load, setLoad] = useState<boolean>(false);
  const [Produtos, setProdutos] = useState<any>([]);
  const [itenId, setItenId] = useState("");
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const email = localStorage.getItem("email");
      const url = "/api/query/get/produto/cnpj/" + props.onCnpj;
      if (props.onCnpj !== "" && Produtos.length === 0) {
        await fetch(url, {
          method: "POST",
          body: JSON.stringify(email),
        })
          .then((resp) => resp.json())
          .then((resposta) => {
            console.log(resposta)
            const retonoIdeal =
              resposta.length === 0
                ? false
                : resposta.status === false
                ? false
                : true;
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
          .catch((err) => console.log(err));
      }
    })();
    if (props.ontime === false) {
      setLoading(false);
    }
  }, [Produtos.length, props.onCnpj, props.ontime, router, toast]);

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
        console.log("🚀 ~ file: produt.tsx:82 ~ .then ~ resposta:", resposta)
        props.onResp(resposta);
        setLoad(false);
      })
      .catch((err) => {
        console.log(err);
        setLoad(false);
      });
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
        w={"320px"}
        alignItems="center"
        hidden={props.onCnpj === "" ? true : false}
      >
        <Box>
          <FormLabel
            htmlFor="cidade"
            fontSize="xs"
            fontWeight="md"
            color="gray.700"
            _dark={{
              color: "gray.50",
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
