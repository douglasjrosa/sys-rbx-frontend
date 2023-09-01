/* eslint-disable no-undef */
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const token = process.env.ATORIZZATION_TOKEN_RIBERMAX;
    const data = req.body;
    const Email = 'kingdever88@gmail.com';

    await axios({
      method: 'GET',
      url: process.env.RIBERMAX_API_URL + '/produtos',
      headers: {
        Email: Email,
        Token: token,
      },
    })
      .then(async (Response) => {
        res.status(200).json(Response.data);
      })
      .catch((err) => {
        console.log("🚀 ~ file: index.ts:27 ~ err:", err)
        res.status(400).json({
          error: err.response.data,
          mensage: err.response.data.error,
          detalhe: err.response.data.error.details,
        });
      });
  } else {
    return res.status(405).send({ message: 'Only GET requests are allowed' });
  }
}
