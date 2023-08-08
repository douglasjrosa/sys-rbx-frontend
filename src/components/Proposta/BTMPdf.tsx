import React from "react";
import { Button } from "@chakra-ui/react";


export const BTMPdf = (props: { nPedido: any; empresa: string }) => {

  return (
    <>
      <Button p={3} fontSize={'0.9rem'} colorScheme={"whatsapp"} onClick={() => window.open(
        `/api/db/proposta/pdf/${props.nPedido}`,
        "_blank"
      )}>
        Gerar PDF
      </Button>
    </>
  );
};
