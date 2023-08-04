import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const token = process.env.ATORIZZATION_TOKEN;
    const Vendedor = req.query.Vendedor

    await axios({
      method: "GET",
      url:
        process.env.NEXT_PUBLIC_STRAPI_API_URL +
        `/businesses?populate=*&filters[status][$eq]=true&sort[0]=id%3Adesc&filters[vendedor][username][$eq]=${Vendedor}&populate=*`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((resp: any) => {
        res.status(200).json(resp.data.data);
        
      })
      .catch((err) => {
        res
          .status(err.response.status || 400)
          .send(err.response.data.error.message);
      });
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
