/* eslint-disable no-undef */
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { GetPedido } from "../../query/pedido/request/db/get";
import { nLote } from "../../db/nLote";


const token = process.env.ATORIZZATION_TOKEN;
const STRAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

export default async function postLotePHP(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { nPedido } = req.query;

    const lote = await STRAPI.get('/lote?filters[nPedido][$eq]=' + nPedido);
    const items = lote.data.data.attributes;

    await items.map(async (i: any) => {
      const NLote = '';
      const postLote = {
        data: {
          lote: i.lote,
          empresa: i.empresa,
          empresaId: i.empresaId,
          business: i.business,
          produtosId: i.produtosId,
          emitente: i.emitente,
          emitenteId: i.emitenteId,
          qtde: i.qtde,
          info: "",
          status: "",
          checklist: "",
          logs: "",
          vendedor: vendedor,
        },
      };
      await STRAPI.post("/lotes", postLote)
        .then((res: any) => {
          res.status(res.status || 200).json(res.data)
        })
        .catch((err: any) => {
          res.status(err.status || 400).json(err.response.data)
        });
    });
  } else {
    return res.status(405).send({ message: "Only POST requests are allowed" });
  }
}
