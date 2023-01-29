import { NextApiRequest, NextApiResponse } from 'next';

export default async function Get(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const d = req.body;
    console.log(d);
  } else {
    return res.status(405).send({ message: 'Only POST requests are allowed' });
  }
}
