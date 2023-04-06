/* eslint-disable no-undef */
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const token = process.env.ATORIZZATION_TOKEN;
    const url = process.env.NEXT_PUBLIC_STRAPI_API_URL + "/atendimentos";

    await axios(url, {
      method: "GET",
      headers: { Authorization: "Bearer " + token },
    })
      .then((Response) => res.status(200).send(Response.data.data))
      .catch((err) => res.status(500).send(err));
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
