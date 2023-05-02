/* eslint-disable no-undef */
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const token = process.env.ATORIZZATION_TOKEN;
    const url =
      process.env.NEXT_PUBLIC_STRAPI_API_URL +
      '/empresas?filters[status][$eq]=true&&fields[0]=nome';

    await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((resp) => resp.json())
      .then((json) => {
        res.status(200).json(json.data);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    return res.status(405).send({ message: 'Only GET requests are allowed' });
  }
}
