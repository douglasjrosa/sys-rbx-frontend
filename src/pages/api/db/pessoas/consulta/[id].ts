import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function getId(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  if (req.method === 'GET') {
    const token = process.env.ATORIZZATION_TOKEN

    await axios({
      method: 'GET',
      url: process.env.NEXT_PUBLIC_STRAPI_API_URL + '/pessoas/' + id + '?&populate=%2A',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(Response => {
        console.log(Response.data);
      res.status(200).json(Response.data)
    })
    .catch(err => {
      res.status(400).json({
        "error": err.response.data,
        "mensage": err.response.data.error,
        "detalhe": err.response.data.error.details
      })
  })

  } else {
    return res.status(405).send({ message: 'Only GET requests are allowed' });
  }
}
