import { Td, Tr, } from "@chakra-ui/react"
import axios from "axios";
import { useEffect, useState } from "react";

export const Ausente = () => {
  const [data, setData] = useState<any>([]);
  console.log("🚀 ~ file: index.tsx:12 ~ PowerBi ~ data:", data)
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/db/empresas/search/powerbi/ausente`);
        setData(response.data);
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
        console.log(i)
        const DataAtualizada = new Date(i.attributes.ultima_compra)
        DataAtualizada.setDate(DataAtualizada.getDate() + 1)
        return (
          <>
            <Tr>
              <Td borderEnd={'2px'} textAlign={'center'} borderBottom={'1px solid #afafaf'}>{i.attributes.nome}</Td>
              <Td borderEnd={'2px'} textAlign={'center'} borderBottom={'1px solid #afafaf'}>{DataAtualizada.toLocaleDateString()}</Td>
            </Tr>
          </>
        )
      })}
    </>
  )
}
