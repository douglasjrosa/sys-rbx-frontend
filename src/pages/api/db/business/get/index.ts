/* eslint-disable no-undef */
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const token = process.env.ATORIZZATION_TOKEN;

    const Response: any = [];

    await axios({
      method: "GET",
      url:
        process.env.NEXT_PUBLIC_STRAPI_API_URL +
        "/businesses?populate=*&filters[status][$eq]=true",
      //? inicio de setup /filters[status][$eq]=true fazendo um filtro que traz todo com status = treu  /&populate=%2A  é para popular os relacionamentos
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res: any) => {
        // console.log(res.data);
        Response.push(!res.data.data ? [] : res.data.data[0]);
      })
      .catch((err) => {
        // console.log(err.response.data);
        Response.push(err.response.data);
      });

    await axios({
      method: "GET",
      url:
        process.env.NEXT_PUBLIC_STRAPI_API_URL +
        "/businesses?populate=*&filters[status][$eq]=true&sort[0]=id%3Adesc",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res: any) => {
        // console.log(res.data);
        Response.push(!res.data.data ? [] : res.data.data[0]);
      })
      .catch((err) => {
        // console.log(err.response.data);
        Response.push(err.response.data);
      });

    // console.log(Response);
    res.status(200).json(Response);
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
