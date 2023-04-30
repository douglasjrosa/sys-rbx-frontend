import React, { useRef, useState } from "react";
import { Box, Button } from "@chakra-ui/react";
import axios from "axios";


export const BTMPdf = (props: { nPedido: any; empresa: string }) => {

  return (
    <>
      <Button p={5} w={"full"} colorScheme={"whatsapp"} onClick={() => window.open(
        `/api/db/proposta/pdf/${props.nPedido}`,
        "_blank"
      )}>
        Gerar PDF
      </Button>
    </>
  );
};
