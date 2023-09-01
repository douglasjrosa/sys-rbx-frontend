/* eslint-disable no-undef */
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = process.env.ATORIZZATION_TOKEN;
  if (req.method === "POST") {
    const data = req.body;

    const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/representantes`;

    await axios(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: data,
    })
      .then((RequestEnpresa) => {
        res.status(200).json(RequestEnpresa.data.data);
      })
      .catch((error) => {
        console.log(error.response.data.error.details);
        res.status(400).json(error);
      });

  } else {
    return res.status(405).send({ message: "Only POST requests are allowed" });
  }
}
