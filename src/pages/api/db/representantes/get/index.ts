/* eslint-disable no-undef */
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = process.env.ATORIZZATION_TOKEN;
  if (req.method === "GET" ) {
    const Vendedor = req.query.Vendedor;
    const Empresa = req.query.Empresa;
  

    if (req.query.Adm == "true") {

      try {
        const requestVendedor = await axios(
          `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/representantes?populate[user][fields][0]=username&filters[empresa][id][$eq]=${Empresa}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const respostaVendedor = requestVendedor.data.data;

        res.status(200).json(respostaVendedor);
      } catch (error) {
        console.log(error);
        res.status(400).json(error);
      }

    } else {

      try {

        const requestVendedor = await axios(
          `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/representantes?filters[user][username][$eq]=${Vendedor}&filters[empresa][id][$eq]=${Empresa}&populate[user][fields][0]=username`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const respostaVendedor = requestVendedor.data.data;

        const requestAdm = await axios(
          `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/representantes?filters[permissao][$eq]=Adm&filters[empresa][id][$eq]=${Empresa}&populate[user][fields][0]=username`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const respostaAdm = requestAdm.data.data;

        const data = [...respostaAdm, ...respostaVendedor];
        // console.log("🚀 ~ file: index.ts:18 ~ respostaVendedor:", data)
        res.status(200).json(data);
      } catch (error) {
        console.log(error);
        res.status(400).json(error);
      }

    }
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
