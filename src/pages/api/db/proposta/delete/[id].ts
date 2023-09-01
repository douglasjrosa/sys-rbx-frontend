/* eslint-disable no-undef */
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'DELETE') {
    const token = process.env.ATORIZZATION_TOKEN;
    const {id} = req.query

    await axios({
      method: 'DELETE',
      url:`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/pedidos/${id}`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(async () => {
        res.status(200).send(`Propsta id ${id} foi deletada`);
      })
      .catch((err) => {
        res.status(400).json({
          error: err.response.data,
          mensage: err.response.data.error,
          detalhe: err.response.data.error.details,
        });
      });
  } else {
    return res.status(405).send({ message: 'Only DELETE requests are allowed' });
  }
}
