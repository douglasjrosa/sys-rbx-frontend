import { Td, Tr } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

export const Presente = () => {
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(
          `/api/db/empresas/search/powerbi/recuperado`
        );
        const response2 = await axios.get(
          `/api/db/empresas/search/powerbi/novo_cliente`
        );
        const resp2 = !response2.data ? [] : response2.data;
        const resp = !response.data ? [] : response.data;
        setData([...resp, ...resp2]);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const renderedData = useMemo(() => {
    return data.map((i: any) => (
      <Tr key={i.id}>
        <Td p={2} fontSize={"10px"} borderEnd={"2px"} textAlign={"center"} borderBottom={"1px solid #afafaf"}>
          {i.attributes.nome}
        </Td>
        <Td p={2} fontSize={"10px"} borderEnd={"2px"} textAlign={"center"} borderBottom={"1px solid #afafaf"}>
          {i.attributes.valor_ultima_compra}
        </Td>
      </Tr>
    ));
  }, [data]);

  return <>{renderedData}</>;
};
