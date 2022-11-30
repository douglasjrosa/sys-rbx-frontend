import { NextApiRequest, NextApiResponse } from 'next';

export default async function Get(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { cnpj } = req.query;
  const data = req.body
  console.log(cnpj)
  res.end(`Post: ${cnpj}`)
}
