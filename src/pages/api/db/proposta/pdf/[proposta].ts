import { NextApiRequest, NextApiResponse } from "next";
import { getData } from "./lib/getinf";
import PDFPrinter from "pdfmake";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import path from "path";
import fs from "fs";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { proposta } = req.query;

    const infos = await getData(proposta);
    console.log("🚀 ~ file: [proposta].ts:16 ~ infos:", infos);

    const imagePath2 = path.join(
      process.cwd(),
      "public",
      "img",
      "logomarca-efect.jpg"
    );
    const imageContent2 = fs.readFileSync(imagePath2).toString("base64");
    const dataUrl2 = `data:image/jpeg;base64,${imageContent2}`;

    const imagePath = path.join(
      process.cwd(),
      "public",
      "img",
      "logomarca-bragheto-escuro.png"
    );
    const imageContent = fs.readFileSync(imagePath).toString("base64");
    const dataUrl = `data:image/jpeg;base64,${imageContent}`;

    const date = new Date().toLocaleDateString();

    const fonts = {
      Helvetica: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
        italics: "Helvetica-Oblique",
        bolditalics: "Helvetica-BoldOblique",
      },
    };
    const printer = new PDFPrinter(fonts);

    const docDefinitions: TDocumentDefinitions = {
      defaultStyle: { font: "Helvetica" },
      content: [
        {
          table: {
            widths: ["*"],
            body: [
              [
                {
                  border: [false, false, false, false],
                  fillColor: "#1a562e",
                  text: " ",
                  margin: [0, 20, 0, 0],
                },
              ],
            ],
          },
        },
        {
          style: "header",
          table: {
            widths: [310, "*"],
            body: [
              [
                {
                  border: [false, false, false, false],
                  image: dataUrl,
                  fit: [80, 80], // Define o tamanho da imagem
                  margin: [30, 3, 30, 3],
                },
                {
                  border: [false, false, false, false],
                  margin: [0, 5, 0, 5],
                  table: {
                    widths: [55, "*"],
                    body: [
                      ["Data", date],
                      ["Proposta N°", infos.nPedido],
                      ["Vendedor", infos.Vendedor],
                    ],
                  },
                },
              ],
            ],
          },
        },
        {
          table: {
            widths: ["*"],
            body: [
              [
                {
                  border: [false, true, false, false],
                  table: {
                    widths: ["*", "*"],
                    body: [
                      [
                        {
                          margin: [0, 10, 0, 0],
                          border: [false, false, false, false],
                          style: "clienteFornecedor",
                          table: {
                            widths: ["32%", "*"],
                            body: [
                              [
                                {
                                  text: "Cliente",
                                  fillColor: '#979797',
                                  color: '#ffff',
                                  border: [false, false, false, false],
                                },
                                {
                                  text: "",
                                  fillColor: '#979797',
                                  border: [false, false, false, false],
                                },
                              ],
                              [
                                {
                                  text: "Fornecedor :",
                                  border: [false, false, false, false],
                                },
                                {
                                  text: infos.fornecedor.data.razao,
                                  border: [false, false, false, false],
                                },
                              ],
                              [
                                {
                                  text: "Cnpj :",
                                  border: [false, false, false, false],
                                },
                                {
                                  text: infos.fornecedor.data.cnpj,
                                  border: [false, false, false, false],
                                },
                              ],
                              [
                                {
                                  text: "Endereço :",
                                  border: [false, false, false, false],
                                },
                                {
                                  text: infos.fornecedor.data.endereco,
                                  border: [false, false, false, false],
                                },
                              ],
                              [
                                {
                                  text: "Cidade :",
                                  border: [false, false, false, false],
                                },
                                {
                                  text: infos.fornecedor.data.cidade + ", " + infos.fornecedor.data.uf,
                                  border: [false, false, false, false],
                                },
                              ],
                              [
                                {
                                  text: "Telefone :",
                                  border: [false, false, false, false],
                                },
                                {
                                  text: infos.fornecedor.data.tel,
                                  border: [false, false, false, false],
                                },
                              ],
                              [
                                {
                                  text: "Email :",
                                  border: [false, false, false, false],
                                },
                                {
                                  text: infos.fornecedor.data.email,
                                  border: [false, false, false, false],
                                },
                              ],
                            ],
                          },
                        },
                        {
                          margin: [0, 10, 0, 0],
                          border: [false, false, false, false],
                          style: "clienteFornecedor",
                          table: {
                            widths: ["21%", "*"],
                            body: [
                              [
                                {
                                  text: "Cliente",
                                  fillColor: '#979797',
                                  color: '#ffff',
                                  border: [false, false, false, false],
                                },
                                {
                                  text: "",
                                  fillColor: '#979797',
                                  border: [false, false, false, false],
                                },
                              ],
                              [
                                {
                                  text: "nome/razão :",
                                  border: [false, false, false, false],
                                },
                                {
                                  text: infos.cliente.nome,
                                  border: [false, false, false, false],
                                },
                              ],
                              [
                                {
                                  text: "Cnpj :",
                                  border: [false, false, false, false],
                                },
                                {
                                  text: infos.fornecedor.data.cnpj,
                                  border: [false, false, false, false],
                                },
                              ],
                              [
                                {
                                  text: "Endereço :",
                                  border: [false, false, false, false],
                                },
                                {
                                  text: infos.fornecedor.data.endereco,
                                  border: [false, false, false, false],
                                },
                              ],
                              [
                                {
                                  text: "Cidade :",
                                  border: [false, false, false, false],
                                },
                                {
                                  text: infos.fornecedor.data.cidade + ", " + infos.fornecedor.data.uf,
                                  border: [false, false, false, false],
                                },
                              ],
                              [
                                {
                                  text: "Telefone :",
                                  border: [false, false, false, false],
                                },
                                {
                                  text: infos.fornecedor.data.tel,
                                  border: [false, false, false, false],
                                },
                              ],
                              [
                                {
                                  text: "Email :",
                                  border: [false, false, false, false],
                                },
                                {
                                  text: infos.fornecedor.data.email,
                                  border: [false, false, false, false],
                                },
                              ],
                            ],
                          },
                        },
                      ],
                    ],
                  },
                },
              ],
            ],
          },
        },
        {
          text: "Empresa: " + infos.fornecedor.data.razao,
          margin: [0, 30, 0, 0],
        },
      ],
      styles: {
        header: {
          fontSize: 9,
          alignment: "justify",
        },
        clienteFornecedor: {
          fontSize: 8,
          alignment: "justify",
        },
      },
    };
    const pdfDoc = printer.createPdfKitDocument(docDefinitions);

    const chunks: any[] = [];

    pdfDoc.on("data", (chunk: any) => {
      chunks.push(chunk);
    });

    pdfDoc.end();

    pdfDoc.on("end", () => {
      const pdf = Buffer.concat(chunks);
      res.end(pdf);
    });
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
