// /* eslint-disable react/prop-types */
// import { Button, Center, Image } from '@chakra-ui/react';
// import { toPng } from 'html-to-image';
// import { jsPDF } from 'jspdf';

// const GeneratePdf = ({ html, isAutoPrint, ...props }) => {
//   const generateImage = async () => {
//     const image = await toPng(html.current, { quality: 0.95 });
//     const doc = new jsPDF();

//     doc.addImage(image, 'WEBP', 5, 12, 0, 0);
//     if (isAutoPrint) doc.autoPrint();

//     const blob = doc.output('blob');
//     window.open(URL.createObjectURL(blob));
//   };

//   return (
//     <Button p="0px" bg="white" onClick={generateImage} {...props}>
//       <Center>
//         <Image h="100%" w="100%" src="../pdf-button.png" alt="Imprimir" />
//       </Center>
//     </Button>
//   );
// };

// export default GeneratePdf;
