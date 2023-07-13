
import { SetValue } from "@/function/currenteValor";
import { Td, Tr } from "@chakra-ui/react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

export const Presente = (props: { user: string }) => {
  const [data, setData] = useState<any>([]);
  const [User, setUser] = useState<string>()


  useEffect(() => {
    (async () => {
        try {
          const response = await axios.get(
            `/api/db/empresas/search/powerbi/recuperado?Vendedor=${props.user}`
          );
          setData(response.data);
          console.log("🚀 ~ file: index.tsx:19 ~ response.data:", props.user)
        } catch (error) {
          console.log(error);
        }
      })();
  }, [props.user]);

  const renderedData = useMemo(() => {
    return data.map((i: any) => (
      <Tr key={i.id}>
        <Td py='2' color={'white'} fontSize={'12px'} borderBottom={'1px solid #CBD5E0'} textAlign={"center"}>
          {i.attributes.nome}
        </Td>
        <Td py='2' color={'white'} fontSize={'12px'} borderBottom={'1px solid #CBD5E0'} textAlign={"center"}>
          {SetValue(i.attributes.valor_ultima_compra)}
        </Td>
      </Tr>
    ));
  }, [data]);

  return <>{renderedData}</>;
};
