import { NextApiRequest, NextApiResponse } from "next";
import { getData } from "./lib/getinf";
import { generateHtml } from "./lib/html";
import { chunkArray } from "./lib/chunkarray";
import { generatePdf } from "./lib/generatePdf";
import { mergePdfs } from "./lib/margePdf";
import { any, number } from "joi";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { proposta } = req.query;

    try {
      const infos = await getData(proposta);
      // console.log("🚀 ~ file: [proposta].ts:17 ~ infos:", infos)
      const items = infos.itens
      const chunks = await chunkArray(items, 6);
      const htmls = chunks.map((chunk: any, x:number) => generateHtml(chunk,infos, x));
      const html: any = await Promise.all(htmls)
      const pdfs = await generatePdf(html);
    

      const today = new Date();
      const formattedDate =
        today.getDate() +
        "_" +
        (today.getMonth() + 1) +
        "_" +
        today.getFullYear();
      const docname =
        proposta + "-" + infos.cliente.fantasia + "-" + formattedDate + ".pdf";

      res.setHeader("Content-disposition", `inline; filename=${docname}`);
      res.setHeader("Content-Type", "application/pdf");
      res.send(pdfs);
    } catch (error) {
      console.log(error);
      res.status(500).send('Ocorreu um erro ao gerar o PDF');
    }
<<<<<<< Updated upstream
=======
    let htmls = "";
    const resphtml = linkis.map(async (l) => {
      await axios(l, {
        method: "post",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: data,
      })
        .then(function (html) {
          htmls += html.data;
        })
        .catch(function (error) {
          console.log(error.response.data.error);
        });
    });

    await Promise.all(resphtml);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(htmls);

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

    await browser.close();

    const today = new Date();
    const formattedDate =
      today.getDate() +
      "_" +
      (today.getMonth() + 1) +
      "_" +
      today.getFullYear();
    const docname =
      proposta + "-" + cliente.nome + "-" + formattedDate + ".pdf";

    const retorno = pdf
    
    setTimeout(()=>{
      res.setHeader("Content-disposition", `inline; filename=${docname}`);
      res.setHeader("Content-Type", "application/pdf");
      res.send(retorno);
    }, 7300)
>>>>>>> Stashed changes
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
