import React from "react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { Button, Image, Center } from "@chakra-ui/react";

const GeneratePdf = ( {html, isAutoPrint, ...props} ) => {
  const generateImage = async () => {
    const image = await toPng(html.current, { quality: 0.95 });
    const doc = new jsPDF();

    doc.addImage(image, "WEBP", 5, 12);
    if( isAutoPrint ) doc.autoPrint();

    const blob = doc.output("blob");
    window.open(URL.createObjectURL(blob));
  };

  console.log(props)
  return (
    <Button  p="0px" bg="white" onClick={generateImage} {...props} >
      <Center>
        <Image
          h="100%"
          w="100%"
          src="../pdf-button.png"
          alt="Imprimir"
        />
      </Center>
    </Button>
  );
};

export default GeneratePdf;
