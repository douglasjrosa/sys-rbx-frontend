import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function blingGetCNPJ(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { cnpj } = req.query;
  const key: string = process.env.BLING_KEY_API;
  const UrlBase: string = process.env.BLING_API_URL;
  console.log(cnpj);
  if (req.method === 'GET') {
    const UrlCheck = UrlBase + `/contato/${cnpj}/json&apikey={${key}}`;
    await axios({
      method: 'GET',
      url: UrlCheck,
      params: {
        apikey: key,
      },
    })
      .then(async (Response) => {
        console.log(Response.data.data);
        res.status(200).json(Response.data);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    return res.status(405).send({ message: 'Only GET requests are allowed' });
  }
}
