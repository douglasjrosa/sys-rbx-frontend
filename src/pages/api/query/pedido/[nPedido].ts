/* eslint-disable no-undef */

import { NextApiRequest, NextApiResponse } from 'next';
import { VerifiqItems } from './lib/itens';
import { GetPedido } from './request/db/get';

export default async function PedidoBling(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  if (req.method === 'POST') {
    // const data = JSON.parse(req.body);
    const { nPedido } = req.query;
    const token = process.env.ATORIZZATION_TOKEN_BLING;
    try {
      const infos = await GetPedido(nPedido);
      const [data]: any = infos;
      const verifi = await VerifiqItems(data);
      // console.log(verifi);

      res.status(200).json(verifi);
    } catch (error) {
      res.status(error.status).json(error);
    }
  } else {
    return res.status(405).send({ message: 'Only POST requests are allowed' });
  }
}
