import {
  Flex,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { SetStateAction, useEffect, useState } from "react";
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
          setTimeout(() => router.push(`/negocios/${PEDIDO}`), 5 * 1000);
        }
        setLoadingGeral(false)
      } catch (error) {
        console.log(error)
        router.back()
      }
    })();
  }, [Email, PEDIDO, router, toast]);

  if (loadingGeral) {
    return <Loading size="200px">Carregando...</Loading>;
  }

  function Save(retorno: SetStateAction<any>) {
    (async () => {
      const dadosPost = retorno;
      const url = `/api/db/proposta/put/${dadosPost.Id}`;
      await axios({
        method: "PUT",
        url: url,
        data: dadosPost,
      })
        .then(async (res: any) => {

          const date = new Date();
          const DateAtua = date.toISOString();

          const msg2 = {
            vendedor: session?.user.name,
            date: new Date().toISOString(),
            msg: `Vendedor ${session?.user.name} atualizou essa proposta `,
          };

          const msg = {
            date: DateAtua,
            msg: `Proposta atualizada, valor total agora é ${dadosPost.totalGeral}, pasando a ter ${parseInt(dadosPost.itens.length) + 1
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

          setTimeout(() => router.push(`/negocios/${PEDIDO}`), 500)

          toast({
            title: "Proposta Atualizada",
            description: res.data.message,
            status: "success",
            duration: 1000,
            isClosable: true,
          });
        })
        .catch((err: any) => {
          setLoadingGeral(false)
          console.log(err.response);
        });
    })()
  };

  return (
    <>
      <Flex h="100vh" w="100%">
        <FormProposta ondata={Data} onResponse={Save} produtos={Produtos} />
      </Flex>
    </>
  );
}
