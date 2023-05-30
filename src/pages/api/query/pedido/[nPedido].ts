/* eslint-disable no-undef */

import { NextApiRequest, NextApiResponse } from 'next';
import { GetPedido } from './request/db/get';
import { PostPedido } from './request/bling/Postpedido';
import axios from 'axios';

export default async function PedidoBling(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method === 'POST') {
    // const data = JSON.parse(req.body);
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
      const getPedido = await PostPedido(data);
      console.log("🚀 ~ file: [nPedido].ts:18 ~ getPedido:", getPedido)

      res.status(200).send(getPedido)
    } catch (error: any) {
      res.status(error.status || 500).json(error);
    }
  } else {
    return res.status(405).send({ message: 'Only POST requests are allowed' });
  }
}
