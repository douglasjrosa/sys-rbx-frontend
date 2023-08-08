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
<<<<<<< HEAD
    const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/interacoes?filters[vendedor][username][$eq]=${Vendedor}&populate=*`;
=======
    const Empresa = req.query.Empresa;
    const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/interacoes?filters[vendedor][username][$eq]=${Vendedor}&filters[empresa][nome][$eq]=${Empresa}&populate=*`;
>>>>>>> 97b4a077b485d38a2a7219c0b16394ba608290aa

    await axios(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: 'Get',

    })
      .then((RequestEnpresa) => {
        res.status(200).json(RequestEnpresa.data.data);
      })
      .catch((error) => {
        console.log(error);
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
