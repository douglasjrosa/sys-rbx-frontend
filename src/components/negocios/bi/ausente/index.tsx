import { Td, Tr } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

export const Ausente = () => {
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(
          `/api/db/empresas/search/powerbi/ausente`
        );
        setData(response.data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  const renderedData = useMemo(() => {
    return data.map((i: any) => {
      const DataAtualizada = new Date(i.attributes.ultima_compra);
      DataAtualizada.setDate(DataAtualizada.getDate() + 1);
      return (
        <Tr key={i.id}>
          <Td p={2} fontSize={"10px"} borderEnd={"2px"} textAlign={"center"} borderBottom={"1px solid #afafaf"}>
            {i.attributes.nome}
          </Td>
          <Td p={2} fontSize={"10px"} borderEnd={"2px"} textAlign={"center"} borderBottom={"1px solid #afafaf"}>
            {DataAtualizada.toLocaleDateString()}
          </Td>
        </Tr>
      );
    });
  }, [data]);

  return <>{renderedData}</>;
};
