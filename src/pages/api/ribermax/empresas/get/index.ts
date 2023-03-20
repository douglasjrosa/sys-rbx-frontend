/* eslint-disable no-undef */
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const token = process.env.ATORIZZATION_TOKEN_RIBERMAX;
    const data = req.body;
    const Email = 'kingdever88@gmail.com';
    const Url = process.env.RIBERMAX_API_URL + '/empresas';

    await fetch(Url, {
      method: 'GET',
      headers: {
        Email: Email,
        Token: token,
      },
    })
      .then((resp) => resp.json())
      .then((json) => {
        const rep = json;

        const resposta = rep.map((iten: any) => {
          console.log(JSON.stringify(iten.CNPJ));
          return {
            data: {
              id: '',
              attributes: {
                nome: iten.nome,
                fantasia: iten.nome,
                tipoPessoa: 'cnpj',
                CNPJ: iten.CNPJ,
              },
            },
          };
        });
        res.status(200).json(resposta);
      })
      .catch((err) => {
        res.status(400).json({
          error: err,
          mensage: err,
          detalhe: err,
        });
      });
  } else {
    return res.status(405).send({ message: 'Only POST requests are allowed' });
  }
}
