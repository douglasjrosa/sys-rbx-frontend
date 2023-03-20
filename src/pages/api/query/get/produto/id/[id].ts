/* eslint-disable no-undef */
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const Email = 'kingdever88@gmail.com';
    const token = process.env.ATORIZZATION_TOKEN_RIBERMAX;
    const id = req.query.id;
    const url = process.env.RIBERMAX_API_URL + '/produtos?prodId=' + id;

    await fetch(url, {
      method: 'GET',
      headers: {
        Email: Email,
        Token: token,
      },
    })
      .then((resp) => resp.json())
      .then((response) => {
        res.status(200).json(response);
      })
      .catch((err) => console.log(err));
  } else {
    return res.status(405).send({ message: 'Only GET requests are allowed' });
  }
}
