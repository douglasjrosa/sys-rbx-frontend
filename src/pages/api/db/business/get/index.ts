/* eslint-disable no-undef */
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const token = process.env.ATORIZZATION_TOKEN;

    const ativo = await axios({
      method: "GET",
      url:
        process.env.NEXT_PUBLIC_STRAPI_API_URL +
        "/businesses?populate=*&filters[status][$eq]=true&filters[statusAnd][$eq]=Ativo",
      //? inicio de setup /filters[status][$eq]=true fazendo um filtro que traz todo com status = treu  /&populate=%2A  é para popular os relacionamentos
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const respAtivo = !ativo.data.data ? [] : ativo.data.data;

    const pause = await axios({
      method: "GET",
      url:
        process.env.NEXT_PUBLIC_STRAPI_API_URL +
        "/businesses?populate=*&filters[status][$eq]=true&filters[statusAnd][$eq]=Pause&sort[0]=id%3Adesc",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    const respPause = !pause.data.data ? [] : pause.data.data;

    const response = [...respAtivo, ...respPause];
    // console.log(response);
    res.status(200).json(response);
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
