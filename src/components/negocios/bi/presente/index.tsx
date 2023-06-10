import { Td, Tr, } from "@chakra-ui/react"
import axios from "axios";
import { useEffect, useState } from "react";

export const Presente = () => {
  const [data, setData] = useState<any>([]);
  console.log("🚀 ~ file: index.tsx:12 ~ PowerBi ~ data:", data)
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/db/empresas/search/powerbi/recuperado`);
        const response2 = await axios.get(`/api/db/empresas/search/powerbi/novo_cliente`);
        setData([...response.data, ...response2.data]);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <>
      {data.map((i: any) => {
        return (
          <>
            <Tr>
              <Td borderEnd={'2px'} textAlign={'center'} borderBottom={'1px solid #afafaf'}>{i.attributes.nome}</Td>
              <Td borderEnd={'2px'} textAlign={'center'} borderBottom={'1px solid #afafaf'}>{i.attributes.valor_ultima_compra}</Td>
            </Tr>
          </>
        )
      })}
    </>
  )
}
