/* eslint-disable no-undef */
import { NextApiRequest, NextApiResponse } from "next";
import { nLote } from "../nLote";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const token = process.env.ATORIZZATION_TOKEN;

    const resp = await nLote();
    console.log(resp);
    res.status(200).json(resp);

    // await axios({
    //   method: 'GET',
    //   url:
    //     process.env.NEXT_PUBLIC_STRAPI_API_URL +
    //     '/lotes?fields[0]=lote&sort=lote%3Adesc&pagination[limit]=1',
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //     'Content-Type': 'application/json',
    //   },
    // })
    //   .then(async (Response) => {
    //     console.log(Response.data.data)
    //     res.status(200).json(Response.data.data);
    //   })
    //   .catch((err) => {
    //     res.status(400).json({
    //       error: err.response.data,
    //       mensage: err.response.data.error,
    //       detalhe: err.response.data.error.details,
    //     });
    //   });
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
