/* eslint-disable no-undef */
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'PUT') {
    const token = process.env.ATORIZZATION_TOKEN_RIBERMAX;
    const data = req.body;
    const cnpj = req.query;
    const Email = data.EmailAdm;

    await axios({
      method: 'PUT',
      url: process.env.RIBERMAX_API_URL + '/empresas/?CNPJ=' + cnpj,
      headers: {
        Email: Email,
        Token: token,
      },
    })
      .then(async (Response) => {
        console.log(Response.data.data);
        res.status(200).json(Response.data);
      })
      .catch((err) => {
        res.status(400).json({
          error: err.response.data,
          mensage: err.response.data.error,
          detalhe: err.response.data.error.details,
        });
      });
  } else {
    return res.status(405).send({ message: 'Only PUT requests are allowed' });
  }
}
