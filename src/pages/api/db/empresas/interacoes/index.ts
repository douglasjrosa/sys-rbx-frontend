/* eslint-disable no-undef */
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = process.env.ATORIZZATION_TOKEN;
<<<<<<< HEAD
  if (req.method === "GET" && req.query.Vendedor !== "") {
    const Vendedor = req.query.Vendedor;
    const CNPJ = req.query.CNPJ;
    const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}`
=======
  if (req.method === "GET") {
    const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/interacoes?populate=*`;
>>>>>>> 97b4a077b485d38a2a7219c0b16394ba608290aa
    await axios(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((RequestEnpresa) => {
        res.status(200).json(RequestEnpresa.data.data);
<<<<<<< HEAD
=======
        // console.log("🚀 ~ file: index.ts:20 ~ .then ~ RequestEnpresa.data.data:", RequestEnpresa.data.data)
>>>>>>> 97b4a077b485d38a2a7219c0b16394ba608290aa
      })
      .catch((error) => {
        console.log(error);
        res.status(400).json(error);
      });
  } else {
<<<<<<< HEAD
    if (req.method !== "GET") {
      return res
        .status(405)
        .send({ message: "Only POST requests are allowed" });
    } else {
      return res.status(500).send({ message: "falta vendedor" });
    }
=======
    return res.status(405).send({ message: "Only GET requests are allowed" });
>>>>>>> 97b4a077b485d38a2a7219c0b16394ba608290aa
  }
}
