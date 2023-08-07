/* eslint-disable no-undef */
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'PUT') {
    const token = process.env.ATORIZZATION_TOKEN;
    const { id } = req.query;
    const data = req.body;


    await axios({
      method: 'PUT',
      url: process.env.NEXT_PUBLIC_STRAPI_API_URL + '/businesses/' + id,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      data: data,
    })
      .then(async (Response) => {
        res.status(200).json(Response.data.data);
        
      })
      .catch((err) => {
        console.error(err);
        // console.error(err.response.data);
        console.error(err.response.data.error);
        // console.error(err.response.data.error.details);
        res.status(400).json({
          error: err.response.data,
          mensage: err.response.data.error,
          detalhe: err.response.data.error?.details,
        });
      });
  } else {
    return res.status(405).send({ message: 'Only PUT requests are allowed' });
  }
}
