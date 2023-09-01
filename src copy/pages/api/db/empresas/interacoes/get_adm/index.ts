import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = process.env.ATORIZZATION_TOKEN;
  if (req.method === "GET" && req.query.Empresa !== "") {
    const Empresa = req.query.Empresa;
    console.log("🚀 ~ file: index.ts:11 ~ Empresa:", Empresa)
    const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/interacoes?filters[empresa][nome][$containsi]=${Empresa}&populate=*`;

    await axios(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((RequestEnpresa) => {
        res.status(200).json(RequestEnpresa.data.data);
        console.log("🚀 ~ file: index.ts:21 ~ .then ~ RequestEnpresa.data.data:", RequestEnpresa.data.data)
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
      return res.status(500).send({ message: "falta Empresa" });
    }
  }
}
