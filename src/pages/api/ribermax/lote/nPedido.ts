/* eslint-disable no-undef */
import axios, { AxiosRequestConfig } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { GetLoteProposta } from "../../lib/get_lote_nProposta";


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

    await items.map(async (i: any) => {

      // EXEMPLO DE COMO ORGANIZAR OS DADOS PARA ENVIAR.
      const dados = {
        "cliente[CNPJ]": i.attributes.empresa.data.attributes.CNPJ,
        "emitente[CNPJ]": i.attributes.emitente.data.attributes.CNPJ,
        idProduto: i.attributes.produtosId,
        nLote: i.attributes.lote,
        qtde: i.attributes.qtde,
      };

      const formData = new FormData();
      for (const key in dados) {
        formData.append(key, JSON.stringify(dados));
      }

      await PHP
        .post("/lotes", formData)
        .then((response) => console.log(response.data))
        .catch((error) => console.error(error));
        
    });
  } else {
    return res.status(405).send({ message: "Only POST requests are allowed" });
  }
}
