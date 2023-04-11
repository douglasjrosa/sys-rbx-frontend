import { ApiErrorResponse } from "@/types/axiosErrosPedido";
import axios from "axios";
import { nLote } from ".";
import { GetPedido } from "../../query/pedido/request/db/get";
import { NextApiRequest, NextApiResponse } from "next";

const token = process.env.ATORIZZATION_TOKEN;
const STRAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const numero = req.query.psotLote;

    const pedido = await GetPedido(numero);

    const items = pedido.itens;
    const empresa = pedido.attributes.empresa.data.id;
    const negocio = pedido.attributes.business.data.id;
    const fornecedor = pedido.attributes.fornecedorId;
    const vendedor = pedido.attributes.vendedorId;

    await items.map(async (i: any) => {
      const NLote = await nLote();
      const postLote = {
        data: {
          lote: NLote,
          empresa: empresa,
          empresaId: empresa,
          business: negocio,
          produtosId: i.prodId,
          emitente: fornecedor,
          emitenteId: fornecedor,
          qtde: i.Qtd,
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
