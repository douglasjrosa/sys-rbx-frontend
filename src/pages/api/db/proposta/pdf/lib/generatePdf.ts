import puppeteer from "puppeteer";

// Defina uma função que gera um PDF a partir de um HTML usando o Puppeteer
export const generatePdf = async (html: string) => {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  // Gera o PDF
  const pdf = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "0.2in",
      bottom: "0.2in",
      left: "0.2in",
      right: "0.2in",
    },
  });
  // await browser.close();
  return pdf;
};
