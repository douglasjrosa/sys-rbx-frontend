import React, { useRef, useState } from "react";
import { Box, Button } from "@chakra-ui/react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const BTMPdf = (props: { nPedido: any; empresa: string }) => {
  const [html, setHtml] = useState('');
  const elementRef = useRef<HTMLDivElement>(document.createElement('div'));

  const generatePDFPdf = async () => {
    try {
      const response = await axios.get(`/api/db/proposta/pdf/${props.nPedido}`);
      setHtml(response.data);
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: "a4"
      });
      const element = elementRef.current;
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");
      doc.addImage(imgData, "PNG", 0.05, 0.05, 8, 12);
      doc.output("dataurlnewwindow", { filename: `${props.empresa.replace(/' '+/g, "_")} - ${new Date().toLocaleDateString()}.pdf` });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Box w={'full'} h={'full'} hidden>
        <div dangerouslySetInnerHTML={{ __html: html }} ref={elementRef} />
      </Box>
      <Button p={5} w={"full"} colorScheme={"whatsapp"} onClick={generatePDFPdf}>
        Gerar PDF
      </Button>
    </>
  );
};
