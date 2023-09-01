import {
  Flex,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FormProposta } from "@/components/Proposta/form/formProposta";
import Loading from "@/components/elements/loading";

export default function Proposta() {
  const { data: session } = useSession();
  const router = useRouter();
  const Email = session?.user.email;
  const PEDIDO = router.query.pedido;
  const [loadingGeral, setLoadingGeral] = useState<boolean>(false);
  const [Data, setData] = useState<any | null>(null);
  const [Bling, setBling] = useState<string | null>(null);
  const [Produtos, setProdutos] = useState<any | null>(null);
  const [Itens, setItens] = useState<any | null>(null);


  const toast = useToast();


  useEffect(() => {
    (async () => {
      setLoadingGeral(true)
      try {
        const request = await axios(`/api/db/business/get/id/${PEDIDO}`)
        const response = request.data
        const CNPJ = response.attributes.empresa.data.attributes.CNPJ
        const getProdutos = await axios(`/api/query/get/produto/cnpj/${CNPJ}`, { method: "POST", data: Email });
        const RespProduto = getProdutos.data
        setData(response)
        const [pedido] = response.attributes.pedidos.data
        const ItensList = pedido.attributes.itens
        setItens(ItensList)
        setBling(response.attributes.Bpedido)
        if (RespProduto.length > 0) {
          setProdutos(RespProduto);
        } else {
          toast({
            title: "ops.",
            description: "Esta empresa não possui produtos.",
            status: "warning",
            duration: 9000,
            isClosable: true,
          });
         router.push(`/negocios/${PEDIDO}`);
        }
        setLoadingGeral(false)
      } catch (error: any) {
        console.log(error.response.data)
        toast({
          title: "Erro.",
          description: error.response.data,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        router.push(`/negocios/${PEDIDO}`);
      }
    })();
  }, [Email, PEDIDO, router, toast]);

  if (Bling) {
    router.push(`/negocios/${PEDIDO}`);
  }

  if (loadingGeral) {
    return <Loading size="200px">Carregando...</Loading>;
  }

  return (
    <>
      <Flex h="100vh" w="100%">
        <FormProposta ondata={Data} produtos={Produtos} ITENS={Itens} envio={"UPDATE"}/>
      </Flex>
    </>
  );
}
