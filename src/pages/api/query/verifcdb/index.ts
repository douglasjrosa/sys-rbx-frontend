/* eslint-disable no-undef */
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const Email = 'kingdever88@gmail.com';
    const token = process.env.ATORIZZATION_TOKEN;
    const url =
      process.env.NEXT_PUBLIC_STRAPI_API_URL +
      '/empresas?fields[0]=fantasia&fields[1]=CNPJ';

    const ribermaxDb = await fetch(process.env.RIBERMAX_API_URL + '/empresas', {
      method: 'GET',
      headers: {
        Email: Email,
        Token: process.env.ATORIZZATION_TOKEN_RIBERMAX,
      },
    });
    const respRibermax = await ribermaxDb.json();
    const RibermaxData = respRibermax;

    const db = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const respostaDb = await db.json();
    const Db = respostaDb.data;
    const DbData = Db.map(
      (item: { attributes: { fantasia: any; CNPJ: any } }) => {
        return {
          nome: item.attributes.fantasia,
          CNPJ: item.attributes.CNPJ,
        };
      },
    );

    const retorno = [...DbData, ...RibermaxData];

    console.log(retorno);
    return res.status(200).json(retorno);
  } else {
    return res.status(405).send({ message: 'Only GET requests are allowed' });
  }
}
