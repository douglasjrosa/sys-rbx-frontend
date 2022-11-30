import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function putCNPJ(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { cnpj } = req.query;
  const dataAt = req.body

  console.log(cnpj)
  if (req.method === 'PUT') {
    const UrlCheck = `/api/db_bling/Bling/contato/GET/CNPJ/${cnpj}`;
    const checkDb = await axios({
      method: 'GET',
      url: UrlCheck,
    });

    if (checkDb.status === 200) {
      const IdBling = checkDb.data.retorno.contatos.contato.id;
      const UrlUpdate = `/api/db_bling/Bling/contato/PUT/${IdBling}`;
      const updateDb = await axios({
        method: 'PUT',
        url: UrlUpdate,
        data:dataAt
      });
      if (updateDb.status === 200) {
        res.status(201).send('Dados alterado com sucesso')
      } else {
        res.status(400).send('Alguma informação enviada está incorreta')
      }
    } else {
      res.status(404).send('Cliente não encontrado na base de dados')
    }
  }else {
    return res.status(405).send({ message: 'Only PUT requests are allowed' });
  }

}
