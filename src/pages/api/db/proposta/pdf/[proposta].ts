/* eslint-disable no-undef */
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const token = process.env.ATORIZZATION_TOKEN;
    const { proposta } = req.query;

    const url =
      process.env.NEXT_PUBLIC_STRAPI_API_URL +
      "/pedidos?populate=*&filters[nPedido][$eq]=" +
      proposta;
    const config: any = {
      method: "GET",
      url: url,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios(config);
    const [result] = response.data.data;
    const itenResponse = result.attributes.itens;
    const quanti = itenResponse.length;

    const Qtpages = Math.ceil(quanti / 5);

    const [resp] = response.data.data;
    const inf = resp.attributes;
    const dadosFornecedor = {
      data: {
        attributes: {
          razao: "MAX BRASIL DERIVADOS DE MADEIRA LTDA",
          fantasia: "RIBERMAX EMBALAGENS",
          cnpj: "17.757.153/0001-80",
          endereco: "Rua Australia, 585",
          cidade: "Riberão Preto",
          uf: "Sp",
          tel: "(16) 9 9765-5543",
          email: "contato@ribermax.com.br",
        },
      },
    };

    const nPedido = inf.nPedido;
    const frete = inf.frete;
    const datePop = inf.dataPedido;
    const fornecedor = dadosFornecedor;
    const cliente = inf.empresa.data.attributes;
    const condi = inf.condi;
    const itens = inf.itens;
    const prazo = inf.prazo === null ? "" : inf.prazo;
    const venc = inf.vencPrint;
    const totoalGeral = inf.totalGeral;
    const obs = inf.obs === null ? "" : inf.obs;
    const business = !inf.business.data
      ? ""
      : inf.business.data.id === null
      ? ""
      : inf.business.data.id;

    const data = {
      nPedido,
      frete,
      datePop,
      fornecedor,
      cliente,
      condi,
      itens,
      prazo,
      venc,
      totoalGeral,
      obs,
      business,
    };

    const linkis = [];

    for (let i = 1; i <= Qtpages; i++) {
      const link = process.env.NEXT_PUBLIC_STRAPI_API_URL + `/proposta/${i}`;
      linkis.push(link);
    }
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

    res.setHeader("Content-disposition", `inline; filename=${docname}`);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
