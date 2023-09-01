import { Td, Tr } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

export const Ausente = (props: { user: string }) => {
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    (async () => {
      if (props.user) {
        try {
          const response = await axios.get(
            `/api/db/empresas/search/powerbi/ausente?Vendedor=${props.user}`
          );
          setData(response.data);
        } catch (error) {
          console.log(error);
        }
      }
    })();
  }, [props.user]);

  const renderedData = useMemo(() => {
    return data.map((i: any) => {
      const DataAtualizada = new Date(i.attributes.ultima_compra);
      DataAtualizada.setDate(DataAtualizada.getDate() + 1);
      return (
        <Tr key={i.id}>
          <Td py='2' color={'white'} fontSize={'12px'} borderBottom={'1px solid #CBD5E0'} textAlign={"center"}>
            {i.attributes.nome}
          </Td>
          <Td py='2' color={'white'} fontSize={'12px'} borderBottom={'1px solid #CBD5E0'} textAlign={'center'}>
            {DataAtualizada.toLocaleDateString('pt-BR')}
          </Td>
        </Tr>
      );
    });
  }, [data]);

  return <>{renderedData}</>;
};
