import { Flex, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";
import { SetStateAction, useEffect, useState } from "react";
import Loading from "@/components/elements/loading";
import { FormProposta } from "@/components/Proposta/form/formProposta";
import { useSession } from "next-auth/react";

export default function Proposta() {
  const router = useRouter();
  const NNegocio = router.query.negocio
  const { data: session } = useSession()
  const [loadingGeral, setLoadingGeral] = useState<boolean>(false);
  const [Data, setData] = useState<any | null>(null);
  const [Bling, setBling] = useState<string | null>(null);
  const [Produtos, setProdutos] = useState<any | null>(null);

  const toast = useToast();

  useEffect(() => {
    (async () => {
      setLoadingGeral(true)
      try {
        const request = await axios(`/api/db/business/get/id/${NNegocio}`)
        const response = request.data
        const email = localStorage.getItem("email");
        const CNPJ = response.attributes.empresa.data.attributes.CNPJ
        const getProdutos = await axios(`/api/query/get/produto/cnpj/${CNPJ}`, { method: "POST", data: email });
        const RespProduto = getProdutos.data
        setData(response)
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
          setTimeout(() => router.push(`/negocios/${NNegocio}`), 5 * 1000);
        }
        setLoadingGeral(false)
      } catch (error) {
        console.log(error)
        router.back()
      }
    })();
  }, [NNegocio, router, toast]);

  if (Bling) {
    const [pedidos] = Data.attributes.pedidos.data
    const nPedido = pedidos?.attributes.nPedido
    router.push("/propostas/update/" + nPedido)
  }

  if (loadingGeral) {
    return <Loading size="200px">Carregando...</Loading>;
  }

  function Save(retorno: SetStateAction<any>) {
    (async () => {
      const dadosPost = retorno;
      const url = "/api/db/proposta/post";
      await axios({
        method: "POST",
        url: url,
        data: dadosPost,
      })
        .then(async (res: any) => {
          const date = new Date();
          const DateAtua = date.toISOString();

          const msg = {
            vendedor: session?.user.name,
            date: new Date().toISOString(),
            msg: `Vendedor ${session?.user.name} criou essa proposta `,
          };
          const msg2 = {
            date: DateAtua,
            msg: `Proposta criada com o valor total ${dadosPost.totalGeral} contendo ${parseInt(dadosPost.itens.length) + 1
              } items`,
            user: "Sistema",
          };

          const record = [...dadosPost.hirtori, msg];
          const record2 = [...dadosPost.incidentRecord, msg2];

          const data = {
            data: {
              history: record,
              incidentRecord: record2,
              Budget: dadosPost.totalGeral
            },
          };

          await axios({
            method: "PUT",
            url: "/api/db/business/put/id/" + dadosPost.id,
            data: data,
          });

          toast({
            title: "Proposta Criada",
            description: res.data.message,
            status: "success",
            duration: 1000,
            isClosable: true,
          });

          setTimeout(() => router.push(`/negocios/${NNegocio}`), 500)
        })
        .catch((err) => {
          console.error(err.data);
        });
    })()
  }

  return (
    <>
      <Flex h="100vh" w="100%">
        <FormProposta ondata={Data} onResponse={Save} produtos={Produtos} />
      </Flex>
    </>
  );
}
