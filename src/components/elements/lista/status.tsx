import { StatusAndamento } from "@/components/data/status";
import { Box, FormLabel, Select } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export const BtnStatus = (props: { Resp: number; onAddResp: any }) => {
  const [valor, setValor] = useState<number>();

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
        color="gray.700"
        _dark={{
          color: "gray.50",
        }}
      >
        Status
      </FormLabel>
      <Select
        shadow="sm"
        size="xs"
        w="full"
        fontSize="xs"
        rounded="md"
        placeholder=" "
        onChange={atualizarValor}
        value={valor}
      >
        {StatusAndamento.map((i: any) => {
          return (
            <option key={i.id} value={i.id}>
              {i.title}
            </option>
          );
        })}
      </Select>
    </Box>
  );
};
