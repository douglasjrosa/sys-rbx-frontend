import { NextApiRequest, NextApiResponse } from 'next';

export default async function getCNPJ(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const {cnpj} = req.query;
  console.log(cnpj)
  res.end(`Post: ${cnpj}`)
}
