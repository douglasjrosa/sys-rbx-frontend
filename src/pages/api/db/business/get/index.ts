/* eslint-disable no-undef */
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const token = process.env.ATORIZZATION_TOKEN;

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
        console.log(res.data);
        res.status(200).json(res.data.data);
      })
      .catch((err) => {
        res.status(400).send(err.response.data.console.error.massage);
      });

  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
