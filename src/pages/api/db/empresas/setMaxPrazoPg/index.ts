import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function PostPrazo(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
      const token = process.env.ATORIZZATION_TOKEN;
      const Empresa = req.query.Empresa;
      const url = process.env.NEXT_PUBLIC_STRAPI_API_URL
      // const url = `http://localhost:1338/api`;
      const Body = req.body

      await axios({
        method: "POST",
        url: `${url}/prazo-pgs`,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data:Body
      })
      .then((Response) => {
        res.status(200).json(Response.data);
      })
      .catch((err) => {
        res.status(400).json(err);
      })
  } else {
    return res.status(405).send({ message: "Only POST requests are allowed" });
  }
}
