import { LogEmpresa } from '@/pages/api/lib/logEmpresa';
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const id = req.query.id;

  if (req.method === 'PUT') {
    const token = process.env.ATORIZZATION_TOKEN;
    const cnpj: any = req.query.cnpj;
    const USER: any = req.query.USER;


    await axios({
      method: 'PUT',
      url: process.env.NEXT_PUBLIC_STRAPI_API_URL + '/representantes/' + id,
      data: {
        data:{
          user: null,
        }
      },
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((Response) => {
        console.log(Response.data);
        res.status(200).json(Response.data);
      })
      .catch((err) => {
        console.log(err.response.data);
        console.log(err.response.data.error.details);
        res.status(400).json({
          error: err.response.data,
          mensage: err.response.data.error,
          detalhe: err.response.data.error.details,
        });
      });

      await axios({
        method: 'GET',
        url:
          process.env.NEXT_PUBLIC_STRAPI_API_URL +
          `/empresas?&populate=*&filters[CNPJ][$eq]=${cnpj}`,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then(async (Response) => {
          // res.status(200).json(Response.data);
          console.log(Response.data);
          await LogEmpresa(Response.data.data, "PUT", USER);
        })
        .catch((err) => {
          console.log("🚀 ~ file: [id].ts:27 ~ err:", err)
          console.log({
            error: err.response?.data,
            mensage: err.response?.data.error,
            detalhe: err.response?.data.error?.details,
          });
        });
  } else {
    return res.status(405).send({ message: 'Only PUT requests are allowed' });
  }
}
