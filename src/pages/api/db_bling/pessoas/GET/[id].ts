import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function ContatoId(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  if (req.method === 'GET') {
    console.log(id);
    const key: string = process.env.BLING_KEY_API;
    const url = process.env.BLING_API_URL+`/contato/${id}/json`;
    await axios({
      method: 'GET',
      url: url,
      params: {
        apikey: key
      }
    })
    .then(response => {
      console.log(response)
      res.status(200).json(response)
    })
    .catch(err => {
      res.status(400).json(err.response.data.retorno.erros.erro.msg)
    });
  } else {
    return res.status(405).send({ message: 'Only GET requests are allowed' });
  }
}
