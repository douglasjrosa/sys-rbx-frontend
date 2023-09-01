/* eslint-disable no-undef */
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = process.env.ATORIZZATION_TOKEN;
  if (req.method === "GET" && req.query.Vendedor !== "") {
    const Vendedor = req.query.Vendedor;
    const url = !Vendedor
      ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/empresas?filters[user][username][$null]=true&filters[status][$eq]=true&sort[0]=nome%3Aasc&fields[0]=nome&fields[1]=CNPJ&pagination[start]=0&pagination[limit]=5000`
      : `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/empresas?filters[user][username][$eq]=${Vendedor}&filters[status][$eq]=true&sort[0]=nome%3Aasc&fields[0]=nome&fields[1]=CNPJ&populate[user][fields][0]=username&populate[businesses][fields][0]=nBusiness`;
    await axios(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((RequestEnpresa) => {
        res.status(200).json(RequestEnpresa.data.data);
      })
      .catch((error) => {
        console.log(error);
        res.status(400).json(error);
      });
  } else if (req.method === "POST") {
    const url =
      process.env.NEXT_PUBLIC_STRAPI_API_URL +
      "/empresas?filters[status][$eq]=true&pagination[limit]=8000";

    await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((resp) => resp.json())
      .then((json) => {
        res.status(200).json(json.data);
        console.log("🚀 ~ file: get.ts:43 ~ .then ~ json.data:", json.data.length)
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    return res.status(405).send({ message: "Only POST requests are allowed" });
  }
}
