import type { NextApiRequest, NextApiResponse } from 'next';
import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';

export default async function ContatoId(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  if (req.method === 'GET') {
    console.log(id);

    const key: string =
      '17c44bbb5be5327ec478211689446ccbe853f0701ea80e2f7a9289e8d8c3d8aa5604290a';
    const url = `https://bling.com.br/Api/v2/contatos/`;
    const response = await axios({
      method: 'GET',
      url: url,
      params: {
        ID:id,
        apikey: key,
        identificador: 2,
      },

      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'sys-rbx-backend',
      },
    });
    const xmlresp = response.data;
    const parser = new XMLParser();
    const jObj = parser.parse(xmlresp);
    const json = jObj.retorno.contatos.contato;



    console.log(json);
    // console.log(response);
     return res.status(200).json(json)
  } else {
    return res.status(405).send({ message: 'Only GET requests are allowed' });
  }
}
