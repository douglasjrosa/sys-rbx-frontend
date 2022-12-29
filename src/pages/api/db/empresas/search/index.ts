import { NextApiRequest, NextApiResponse } from 'next';

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const token = process.env.ATORIZZATION_TOKEN;
    const search = JSON.parse(req.body);
    const url =
      process.env.NEXT_PUBLIC_STRAPI_API_URL +
      `/empresas/?filters[$or][0][nome][$containsi]=${search}&filters[$or][1][fantasia][$containsi]=${search}&populate=%2A`;
      
    await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.data === '' || json.data === undefined || json.data === null) {
          return res
            .status(400)
            .send({ message: 'this search returned empty' });
        } else {
          return res.status(400).json(json.data);
        }
      })
      .catch((err) => {
        return res
          .status(500)
          .json({ message: 'Only POST requests are allowed', error: err });
      });
  } else {
    return res.status(405).send({ message: 'Only POST requests are allowed' });
  }
}
