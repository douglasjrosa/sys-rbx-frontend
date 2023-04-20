import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

export const mergePdfs = async (pdfs: Buffer[]) => {
  const pdfDoc = await PDFDocument.create();
  for (const pdf of pdfs) {
    const externalPdf = await PDFDocument.load(pdf);
    const externalPages = await pdfDoc.copyPages(externalPdf, externalPdf.getPageIndices());
    for (const page of externalPages) {
      pdfDoc.addPage(page);
    }
  }
  const mergedPdf = await pdfDoc.save();
  fs.writeFileSync('merged.pdf', mergedPdf);
  return mergedPdf;
}
