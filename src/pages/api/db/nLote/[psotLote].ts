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

    const [pedido] = await GetPedido(numero);

    const items = pedido.attributes.itens;
    const empresa = pedido.attributes.empresaId;
    const empresaCNPJ = pedido.attributes.empresa.data.attributes.CNPJ;
    const negocio = pedido.attributes.business.data.id;
    const fornecedor = pedido.attributes.fornecedorId;
    const fornecedorCNPJ = pedido.attributes.fornecedorId.data.attributes.CNPJ;
    const vendedor = pedido.attributes.user.data.id;


    try {
      const result = [];

      for (const i of items) {
        const NLote = await nLote();
        const postLote = {
          data: {
            lote: NLote,
            empresa: empresa,
            empresaId: empresa,
            business: negocio,
            produtosId: i.prodId,
            emitente: fornecedor.data.attributes.titulo,
            emitenteId: fornecedor.data.id,
            qtde: i.Qtd,
            info: "",
            status: "",
            checklist: "",
            logs: "",
            vendedor: vendedor,
            nProposta: numero,
            CNPJClinet: empresaCNPJ,
            CNPJEmitente: fornecedorCNPJ
          },
        };

        const res = await STRAPI.post("/lotes", postLote);
        result.push(res.data.data);
      }

      console.log(result);
      res.status(201).json(result);

    } catch (error) {
      console.log(error);
      res.status(400).json(error);
    }
  } else {
    return res.status(405).send({ message: "Only POST requests are allowed" });
  }
}
