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
    const Empresa = req.query.Empresa;

    // const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/interacoes?filters[vendedor][username][$eq]=${Vendedor}&filters[empresa][nome][$eq]=${Empresa}`;
    const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/interacoes?filters[vendedor][username][$containsi]=${Vendedor}&filters[empresa][nome][$containsi]=${Empresa}&populate=*`;

    await axios(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((RequestEnpresa) => {
        res.status(200).json(RequestEnpresa.data.data);
        console.log("🚀 ~ file: index.ts:25 ~ .then ~ RequestEnpresa.data.data:", RequestEnpresa.data.data)
      })
      .catch((error) => {
        console.log(error);
        console.log("🚀 ~ file: index.ts:29 ~ error:", error)
        res.status(400).json(error);
      });
  } else {
    if (req.method !== "GET") {
      return res
        .status(405)
        .send({ message: "Only GET requests are allowed" });
    } else {
      return res.status(500).send({ message: "falta vendedor" });
    }
  }
}
