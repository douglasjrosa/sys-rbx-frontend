/* eslint-disable no-undef */
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const token = process.env.ATORIZZATION_TOKEN;
    const Vendedor = req.query.Vendedor;
    const EMPRESAS = req.query.EMPRESAS

    const url =  EMPRESAS == "true"
    ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/empresas?filters[status][$eq]=true&sort[0]=nome%3Aasc&fields[0]=nome&fields[1]=CNPJ&fields[2]=valor_ultima_compra&fields[3]=ultima_compra&populate=*&pagination[limit]=8000`
    : !Vendedor
    ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/empresas?filters[user][username][$null]=true&filters[status][$eq]=true&sort[0]=nome%3Aasc&fields[0]=nome&fields[1]=CNPJ&fields[2]=valor_ultima_compra&fields[3]=ultima_compra&populate=*&pagination[limit]=8000`
    :`${process.env.NEXT_PUBLIC_STRAPI_API_URL}/empresas?filters[user][username][$eq]=${Vendedor}&filters[status][$eq]=true&sort[0]=nome%3Aasc&fields[0]=nome&fields[1]=CNPJ&fields[2]=valor_ultima_compra&fields[3]=ultima_compra&populate=*&pagination[limit]=8000`;

    // const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/empresas?filters[status][$eq]=true&sort[0]=nome%3Aasc&fields[0]=nome&fields[1]=CNPJ&fields[2]=valor_ultima_compra&fields[3]=ultima_compra&populate=*&pagination[limit]=8000`

    await axios(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((RequestEnpresa: any) => {
        res.status(200).json(RequestEnpresa.data.data);
        // console.log("🚀 ~ file: index.ts:28 ~ .then ~ RequestEnpresa.data.data:", RequestEnpresa.data.data)
      })
      .catch((error: any) => {
        console.log(error.response.data.error);
        res.status(400).json(error);
      });
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
