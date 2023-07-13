import { NextApiRequest, NextApiResponse } from "next";
import { PostPedido } from "./request/bling/Postpedido";
import axios from "axios";

export default async function PedidoBling(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method === "POST") {
    const { nPedido } = req.query;
    try {
      const request = await axios({
        url: `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/pedidos?populate=*&filters[nPedido][$eq]=${nPedido}`,
        headers: {
          Authorization: `Bearer ${process.env.ATORIZZATION_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      const infos = request.data.data;
      const [data]: any = infos;
      const negocio = data.attributes.business.data.attributes;
      if (negocio.andamento === 5 && negocio.etapa === 6) {
        const getPedido = await PostPedido(data);
        res.status(200).send(getPedido);
      } else {
        res.status(500).json({ message: "esse negocio nao esta concluido" });
      }
    } catch (error: any) {
      // console.log("🚀 ~ file: [nPedido].ts:25 ~ error:", error);
      res.status(500).json(error);
    }
  } else {
    return res.status(405).send({ message: "Only POST requests are allowed" });
  }
}
