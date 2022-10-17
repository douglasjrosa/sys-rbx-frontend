import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function getCNPJ(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const cnpj = req.query;
  if (req.method === 'GET') {
    let url = 'https://www.receitaws.com.br/v1/cnpj/' + cnpj;
    axios({
      method: 'GET',
      url: url,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((Response) => {
        return res.status(200).json(Response);
      })
      .catch((err) => {
        return res.status(400).send({erro: err, message: 'Requests falli' });
      });
  } else {
    return res.status(405).send({ message: 'Only GET requests are allowed' });
  }
}
