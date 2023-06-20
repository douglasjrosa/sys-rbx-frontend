import { Td, Tr } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

export const NovoCliente = () => {
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    (async () => {
      try {
        const response2 = await axios.get(
          `/api/db/empresas/search/powerbi/novo_cliente`
        );
        setData(response2.data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const renderedData = useMemo(() => {
    return data.map((i: any) => {

      return (
      <Tr key={i.id}>
        <Td p={2} fontSize={"12px"} borderEnd={"2px"} textAlign={"center"} borderBottom={"1px solid #afafaf"}>
          {i.attributes.nome}
        </Td>
        <Td p={2} fontSize={"12px"} borderEnd={"2px"} textAlign={"center"} borderBottom={"1px solid #979797"}>
          {new Date(i.attributes.createdAt).toLocaleDateString('pt-BR')}
        </Td>
      </Tr>
    )});
  }, [data]);

  return <>{renderedData}</>;
};
