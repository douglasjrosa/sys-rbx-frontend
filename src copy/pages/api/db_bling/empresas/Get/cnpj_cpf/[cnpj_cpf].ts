/* eslint-disable no-undef */
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function Get(req: NextApiRequest, res: NextApiResponse) {
  const token = process.env.ATORIZZATION_TOKEN_BLING;
  const CNPJ_CPF = req.query.cnpj_cpf;
  if (req.method === 'GET') {
    const url = `https://bling.com.br/Api/v2/contato/${CNPJ_CPF}/json?apikey=${token}`;
    await axios({
      method: 'GET',
      url: url,
    })
      .then((response) => {
        console.log(response);
        res.status(200).json(response.data.retorno.contatos);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    return res.status(405).send({ message: 'Only GET requests are allowed' });
  }
}
