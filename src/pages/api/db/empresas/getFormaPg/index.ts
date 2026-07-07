import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GetFormaPg(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const token = process.env.ATORIZZATION_TOKEN;
      const Empresa = req.query.Empresa;
      console.log("🚀 ~ file: index.ts:12 ~ Empresa:", Empresa)
      const url = process.env.NEXT_PUBLIC_STRAPI_API_URL
      // const url = `http://localhost:1338/api`;

      const Request = await axios({
        method: "GET",
        url: `${url}/formapgs?filters[empresa][id][$null]=true`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const ResquestEmpresa = await axios({
        method: "GET",
        url: `${url}/formapgs?filters[empresa][id][$eq]=${Empresa}&populate=*`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const retornoEmpresa = ResquestEmpresa.data.data
      const retorno = Request.data.data


      const data: any = [...retorno, ...retornoEmpresa];

      res.status(200).json(data);
    } catch (err: any) {
      res.status(400).json(err);
    }
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
