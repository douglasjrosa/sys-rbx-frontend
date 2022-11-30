import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function Contato(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const key: string = process.env.BLING_KEY_API;
    const url = 'https://bling.com.br/Api/v2/contatos/json';
    await axios({
      method: 'GET',
      url: url,
      params: {
        apikey: key,
      },
    })
      .then(response => {
        console.log(response)
        res.status(200).json(response)
      })
      .catch(err => {
        res.status(400).json(err.response.data.retorno.erros.erro.msg)
      });
  } catch (error) {
    console.warn(error);
  }
}
