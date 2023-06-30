import { StatusAndamento } from "@/components/data/status";
import { Box, FormLabel, Select } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export const BtnStatus = (props: { Resp: any; onAddResp: any }) => {
  const [valor, setValor] = useState('');

  useEffect(() => {
    setValor(props.Resp);
  }, [props.Resp]);

  function atualizarValor(event: any) {
    setValor(event.target.value);
    props.onAddResp(event.target.value);
  }

  return (
    <Box>
      <FormLabel
        fontSize="xs"
        fontWeight="md"
      >
        Status
      </FormLabel>
      <Select
        shadow="sm"
        size="sm"
        w="full"
        fontSize="xs"
        rounded="md"
        onChange={atualizarValor}
        value={valor}
      >
        <option style={{ backgroundColor: "#1A202C" }}></option>
        {StatusAndamento.map((i: any) => {
          return (
            <option style={{ backgroundColor: "#1A202C" }} key={i.id} value={i.id}>
              {i.title}
            </option>
          );
        })}
      </Select>
    </Box>
  );
};
