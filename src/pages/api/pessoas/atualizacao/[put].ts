import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'PUT') {
    const id = req.query
    const token = process.env.ATORIZZATION_TOKEN

    await axios({
      method: 'PUT',
      url: process.env.NEXT_PUBLIC_STRAPI_API_URL + '/api/pessoas/'+id,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    .then(Response => {
      res.status(200).json(Response.data)
    })
    .catch(err => {
      res.status(400).json({
        "error": err.response.data,
        "mensage": err.response.data.error,
        "detalhe": err.response.data.error.details
      })
  })

  } else {
    return res.status(405).send({ message: 'Only GET requests are allowed' });
  }
}
