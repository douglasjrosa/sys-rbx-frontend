/* eslint-disable no-undef */
import axios, { AxiosRequestConfig } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { GetLoteProposta } from "../../lib/get_lote_nProposta";
import { ErroPHP } from "../../lib/erroPHP";

const PHP = axios.create({
  baseURL: process.env.RIBERMAX_API_URL,
  headers: {
    Token: process.env.ATORIZZATION_TOKEN_RIBERMAX,
    Email: process.env.ATORIZZATION_EMAIL,
  },
});

export default async function postLotePHP(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { nPedido } = req.query;

    const lote = await GetLoteProposta(nPedido);
    const items = lote;

    const mapItens = await items.map(async (i: any) => {
      // EXEMPLO DE COMO ORGANIZAR OS DADOS PARA ENVIAR.
      const dados = {
        "cliente[CNPJ]": i.attributes.CNPJClinet,
        "emitente[CNPJ]": i.attributes.CNPJEmitente,
        idProduto: i.attributes.produtosId,
        nLote: i.attributes.lote,
        qtde: i.attributes.qtde,
      };

      const formData = new FormData();
      for (const key in dados) {
        formData.append(key, JSON.stringify(dados));
      }

      await PHP.post("/lotes", formData)
        .then((response) => console.log(response.data))
        .catch((error) => {
          const data = {
            log: {
              "cliente[CNPJ]": i.attributes.CNPJClinet,
              "emitente[CNPJ]": i.attributes.CNPJEmitente,
              idProduto: i.attributes.produtosId,
              nLote: i.attributes.lote,
              qtde: i.attributes.qtde,
              pedido: nPedido,
            },
          };
          return ErroPHP(data);
        });
    });
    const resposra = await Promise.all(mapItens)
    res.json(resposra)
  } else {
    return res.status(405).send({ message: "Only POST requests are allowed" });
  }
}
