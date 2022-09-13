import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function Contato(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const key: string =
      '17c44bbb5be5327ec478211689446ccbe853f0701ea80e2f7a9289e8d8c3d8aa5604290a';
    const url = 'https://bling.com.br/Api/v2/contatos/json';
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'json',
      params: {
        apikey: key,
      },
      headers: {
        'Content-Type': 'application/json'
      },
    });
    const resp = response.data.retorno.contatos;

   return res.status(200).json(resp)
  } catch (error) {
    console.warn(error);
  }
}
