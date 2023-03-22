/* eslint-disable no-undef */
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function getId(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (req.method === 'PUT') {
    const token = process.env.ATORIZZATION_TOKEN;
    const update = {
      data: {
        status: false,
      },
    };

    await axios({
      method: 'PUT',
      url: process.env.NEXT_PUBLIC_STRAPI_API_URL + '/pessoas/' + id,
      data: update,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((Response) => {
        res.status(200).json(Response.data);
      })
      .catch((err) => {
        console.log(err);
        console.log(err.response.data);
        console.log(err.response.data.error);
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
