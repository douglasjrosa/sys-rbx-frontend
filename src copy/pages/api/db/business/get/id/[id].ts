/* eslint-disable no-undef */
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const token = process.env.ATORIZZATION_TOKEN;
    const { id } = req.query;
    // console.log(id);

    await axios({
      method: 'GET',
      url:
        process.env.NEXT_PUBLIC_STRAPI_API_URL +
        '/businesses/' +
        id +
        '?populate=%2A',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(async (Response) => {
        // console.log(Response.data.data);
        res.status(200).json(Response.data.data);
      })
      .catch((err) => {
        console.log(err.response.data.error.details);
        res.status(400).json({err});
      });
  } else {
    return res.status(405).send({ message: 'Only GET requests are allowed' });
  }
}
