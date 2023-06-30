import { Td, Tr } from "@chakra-ui/react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

export const Ausente = () => {
  const [data, setData] = useState<any>([]);
  const { data: session } = useSession()

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get(
          `/api/db/empresas/search/powerbi/ausente?Vendedor=${session?.user.name}`
        );
        setData(response.data);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [session?.user.name]);

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
