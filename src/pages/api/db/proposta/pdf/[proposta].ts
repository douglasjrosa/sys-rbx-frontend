import { NextApiRequest, NextApiResponse } from "next";
import { getData } from "./lib/getinf";
import PDFPrinter from "pdfmake";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import path from "path";
import fs from "fs";
import { TestDb } from "@/components/data/teste";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const { proposta } = req.query;

    const infos = await getData(proposta);
    // console.log("🚀 ~ file: [proposta].ts:17 ~ infos:", infos)

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
      "Bragheto - Logomarca com nome (Fundo transparente).png"
    );
    const imageContent = fs.readFileSync(imagePath).toString("base64");
    const dataUrl = `data:image/jpeg;base64,${imageContent}`;

    const date = new Date().toLocaleDateString("pt-BR");

    const fonts = {
      Helvetica: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
        italics: "Helvetica-Oblique",
        bolditalics: "Helvetica-BoldOblique",
      },
    };
    const printer = new PDFPrinter(fonts);

    const Product = infos.itens;
    const products = Product.map((i: any, x: number) => {
      const preco = parseFloat(
        i.vFinal.replace(".", "").replace(",", ".")
      ).toLocaleString("pt-br", { style: "currency", currency: "BRL" });

      const ValorOriginal = i.vFinal.replace(".", "").replace(",", ".");
      const acrec =
        i.mont === true && i.expo === true
          ? 1.2
          : i.expo === true && i.mont === false
          ? 1.1
          : i.expo === false && i.mont === true
          ? 1.1
          : 0;
      const descont = infos.condi === "Antecipado" ? ValorOriginal * 0.05 : 0;
      const somaAcrescimo =
        acrec === 0 ? ValorOriginal * i.Qtd : ValorOriginal * acrec * i.Qtd;
      const somaDescont = descont * i.Qtd;
      const somaDescontMin =
        Math.round(parseFloat(somaDescont.toFixed(2)) * 100) / 100;
      const TotalItem = somaAcrescimo - somaDescontMin;
      const result = Math.round(parseFloat(TotalItem.toFixed(2)) * 100) / 100;
      const total = result.toLocaleString("pt-br", {
        style: "currency",
        currency: "BRL",
      });

      return [
        { text: x, margin: [0, 10, 0, 8], fontSize: 7 },
        { text: i.nomeProd, margin: [0, 10, 0, 8], fontSize: 7 },
        { text: i.codg, margin: [0, 10, 0, 8], fontSize: 7 },
        { text: i.Qtd, margin: [0, 10, 0, 8], fontSize: 7 },
        { text: !i.altura ? 0 : i.altura, margin: [0, 10, 0, 8], fontSize: 7 },
        {
          text: !i.largura ? 0 : i.largura,
          margin: [0, 10, 0, 8],
          fontSize: 7,
        },
        {
          text: !i.comprimento ? 0 : i.comprimento,
          margin: [0, 10, 0, 8],
          fontSize: 7,
        },
        { text: !!i.mont ? "SIM" : "NÃO", margin: [0, 10, 0, 8], fontSize: 7 },
        { text: !!i.expo ? "SIM" : "NÃO", margin: [0, 10, 0, 8], fontSize: 7 },
        { text: preco, margin: [0, 10, 0, 8], fontSize: 7 },
        { text: total, margin: [0, 10, 0, 8], fontSize: 7 },
      ];
    });

    const comDesc = [
      {
        margin: [0, 45, 0, 0],
        border: [false, false, false, false],
        text: "Desconto :",
        bold: "true",
      },
      {
        margin: [0, 45, 0, 0],
        border: [false, false, false, false],
        text: infos.Desconto,
      },
    ];

    const semDesc = [
      {
        margin: [0, 49, 0, 0],
        border: [false, false, false, false],
        text: "",
      },
      {
        margin: [0, 49, 0, 0],
        border: [false, false, false, false],
        text: "",
      },
    ];

    const desconto = infos.condi !== "Antecipado" ? semDesc : comDesc;

    const logo =
      infos.fornecedor.data.razao === "BRAGHETO PALETES E EMBALAGENS LTDA"
        ? dataUrl
        : dataUrl2;
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
                  image: logo,
                  fit: [80, 80], // Define o tamanho da imagem
                  margin: [30, 3, 30, 3],
                },
                {
                  border: [false, false, false, false],
                  margin: [0, 5, 0, 5],
                  table: {
                    widths: [55, "*"],
                    body: [
                      ["Data:", date],
                      ["Proposta N°:", infos.nPedido],
                      ["Vendedor:", infos.Vendedor],
                      ["Pedido N°:", infos.cliente_pedido],
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
                            widths: ["24%", "*"],
                            body: [
                              [
                                {
                                  text: "Fornecedor",
                                  bold: "true",
                                  fillColor: "#979797",
                                  color: "#ffff",
                                  fontSize: 10,
                                  border: [false, false, false, false],
                                },
                                {
                                  text: "",
                                  fillColor: "#979797",
                                  border: [false, false, false, false],
                                },
                              ],
                              [
                                {
                                  text: "Nome/Razão :",
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
                                  text:
                                    infos.fornecedor.data.cidade +
                                    ", " +
                                    infos.fornecedor.data.uf.toUpperCase(),
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
                            widths: ["23%", "*"],
                            body: [
                              [
                                {
                                  text: "Cliente",
                                  bold: "true",
                                  fontSize: 9,
                                  fillColor: "#979797",
                                  color: "#ffff",
                                  border: [false, false, false, false],
                                },
                                {
                                  text: "",
                                  fillColor: "#979797",
                                  border: [false, false, false, false],
                                },
                              ],
                              [
                                {
                                  text: "Nome/Razão :",
                                  border: [false, false, false, false],
                                },
                                {
                                  text: infos.cliente.razao,
                                  border: [false, false, false, false],
                                },
                              ],
                              [
                                {
                                  text: "Cnpj :",
                                  border: [false, false, false, false],
                                },
                                {
                                  text: infos.cliente.CNPJ,
                                  border: [false, false, false, false],
                                },
                              ],
                              [
                                {
                                  text: "Endereço :",
                                  border: [false, false, false, false],
                                },
                                {
                                  text: infos.cliente.endereco,
                                  border: [false, false, false, false],
                                },
                              ],
                              [
                                {
                                  text: "Cidade :",
                                  border: [false, false, false, false],
                                },
                                {
                                  text:
                                    infos.cliente.cidade +
                                    ", " +
                                    infos.cliente.uf.toUpperCase(),
                                  border: [false, false, false, false],
                                },
                              ],
                              [
                                {
                                  text: "Telefone :",
                                  border: [false, false, false, false],
                                },
                                {
                                  text: infos.cliente.fone,
                                  border: [false, false, false, false],
                                },
                              ],
                              [
                                {
                                  text: "Email :",
                                  border: [false, false, false, false],
                                },
                                {
                                  text: infos.cliente.email,
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
          table: {
            widths: ["*"],
            body: [
              [
                {
                  border: [false, true, false, false],
                  text: "",
                },
              ],
            ],
          },
        },
        {
          table: {
            widths: ["*", "30%"],
            body: [
              [
                {
                  table: {
                    widths: ["*"],
                    body: [
                      [
                        {
                          border: [false, false, false, false],
                          text: "Avisos",
                        },
                      ],
                      [
                        {
                          margin: [0, 5, 0, 0],
                          border: [false, false, false, false],
                          text: "As embalagens são enviadas desmontadas.",
                          style: "clienteFornecedor",
                        },
                      ],
                      [
                        {
                          border: [false, false, false, false],
                          text: "Para o envio das embalagens montadas, há um acréscimo de 10%.",
                          style: "clienteFornecedor",
                        },
                      ],
                      [
                        {
                          border: [false, false, false, false],
                          text: "A montagem deve ser solicitada no momento da cotação.",
                          style: "clienteFornecedor",
                        },
                      ],
                      [
                        {
                          margin: [0, 8, 0, 0],
                          border: [false, false, false, false],
                          text: "OBS.",
                          // style: 'clienteFornecedor'
                        },
                      ],
                      [
                        {
                          margin: [0, 5, 0, 0],
                          border: [false, false, false, false],
                          text: infos.obs,
                          style: "clienteFornecedor",
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
                          border: [false, false, false, false],
                          table: {
                            widths: ["49%", "*"],
                            body: [
                              [
                                {
                                  border: [false, false, false, false],
                                  text: "Condição de pagamento:",
                                  bold: "true",
                                  fontSize: 8,
                                },
                                {
                                  margin: [0, 5, 0, 0],
                                  border: [false, false, false, false],
                                  text: infos.condi,
                                  style: "clienteFornecedor",
                                },
                              ],
                              [
                                {
                                  margin: [0, 5, 0, 0],
                                  border: [false, false, false, false],
                                  text: "Prazo:",
                                  bold: "true",
                                  style: "clienteFornecedor",
                                },
                                {
                                  margin: [0, 5, 0, 0],
                                  border: [false, false, false, false],
                                  text: infos.prazo,
                                  style: "clienteFornecedor",
                                },
                              ],
                              [
                                {
                                  margin: [0, 5, 0, 0],
                                  border: [false, false, false, false],
                                  text: "Tipo de frete:",
                                  bold: "true",
                                  fontSize: 8,
                                },
                                {
                                  margin: [0, 5, 0, 0],
                                  border: [false, false, false, false],
                                  text: infos.frete,
                                  style: "clienteFornecedor",
                                },
                              ],
                              [
                                {
                                  margin: [0, 5, 0, 0],
                                  border: [false, false, false, false],
                                  text: "Prazo parcial de entrega:",
                                  bold: "true",
                                  fontSize: 8,
                                },
                                {
                                  margin: [0, 5, 0, 0],
                                  border: [false, false, false, false],
                                  text: infos.dataEntrega,
                                  style: "clienteFornecedor",
                                },
                              ],
                              [
                                {
                                  margin: [0, 5, 0, 0],
                                  border: [false, false, false, false],
                                  text: "Valor do frete:",
                                  bold: "true",
                                  fontSize: 8,
                                },
                                {
                                  margin: [0, 5, 0, 0],
                                  border: [false, false, false, false],
                                  text: infos.Valfrete,
                                  style: "clienteFornecedor",
                                },
                              ],
                              desconto,
                              [
                                {
                                  margin: [8, 5, 0, 0],
                                  border: [false, false, false, false],
                                  text: "Total :",
                                  bold: "true",
                                },
                                {
                                  margin: [0, 5, 0, 0],
                                  border: [false, false, false, false],
                                  text: infos.totoalGeral,
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
          table: {
            widths: ["*"],
            body: [
              [
                {
                  border: [false, false, false, true],
                  text: "",
                },
              ],
            ],
          },
        },
        {
          style: "tableConteudo",
          margin: [0, 10, 0, 0],
          table: {
            widths: [
              "2%",
              "25%",
              "7%",
              "5%",
              "7%",
              "8%",
              "8%",
              "6%",
              "6%",
              "12%",
              "18%",
            ],
            headerRows: 1,
            heights: 4,
            body: [
              [
                { text: "x", style: "tableTitle" },
                { text: "Produto", style: "tableTitle" },
                { text: "Cód.", style: "tableTitle" },
                { text: "Qtd", style: "tableTitle" },
                { text: "Alt.", style: "tableTitle" },
                { text: "Larg.", style: "tableTitle" },
                { text: "Comp.", style: "tableTitle" },
                { text: "MONT.", style: "tableTitle" },
                { text: "EXP.", style: "tableTitle" },
                { text: "Valor Un.", style: "tableTitle" },
                { text: "Total", style: "tableTitle" },
              ],
              ...products,
            ],
          },
          layout: "lightHorizontalLines",
        },
      ],
      pageSize: "A4",
      pageMargins: [25, 60, 25, 10],
      styles: {
        header: {
          fontSize: 9,
          alignment: "justify",
        },
        clienteFornecedor: {
          fontSize: 8,
          alignment: "justify",
        },
        tableTitle: {
          fontSize: 8,
          alignment: "center",
        },
        tableConteudo: {
          fontSize: 9,
          alignment: "center",
        },
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinitions);

    const chunks: any[] = [];

    pdfDoc.on("data", (chunk: any) => {
      chunks.push(chunk);
    });

    pdfDoc.end();
    const filename ="Proposta comercial -" +
      infos.nPedido +
      " - " +
      infos.cliente.nome +
      "-" +
      new Date().toLocaleDateString('pt-BR');
    pdfDoc.on("end", () => {
      const pdf = Buffer.concat(chunks);
      res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
      res.setHeader("Content-Type", "application/pdf");
      res.end(pdf);
    });
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
