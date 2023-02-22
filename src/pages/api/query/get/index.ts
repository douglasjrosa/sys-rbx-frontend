/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const Email = JSON.parse(req.body);
    const token = process.env.ATORIZZATION_TOKEN;
    const url =
      process.env.NEXT_PUBLIC_STRAPI_API_URL +
      '/empresas?fields[0]=nome&fields[1]=CNPJ';

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
    const DbData = !Db
      ? null
      : Db.map((item: { attributes: { nome: any; CNPJ: any } }) => {
          return {
            nome: item.attributes.nome,
            CNPJ: item.attributes.CNPJ,
          };
        });

    if (DbData === null) {
      const retorno = RibermaxData;
      return res.status(200).json(retorno);
    }
    if (RibermaxData.length === 0) {
      const retorno = DbData;
      return res.status(200).json(retorno);
    } else {
      const retorno = [...DbData, ...RibermaxData];
      return res.status(200).json(retorno);
    }
  } else {
    return res.status(405).send({ message: 'Only GET requests are allowed' });
  }
}
