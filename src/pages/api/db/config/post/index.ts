import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function PostUser(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/config-vendas`;
      const Token: any = process.env.ATORIZZATION_TOKEN;
      const Response = await axios(url, {
        method: "POST",
        data: req.body,
        headers: {
          Authorization: `Bearer ${Token}`,
          "Content-Type": "application/json",
        },
      });
      res.status(200).json(Response.data);
    } catch (error: any) {
      res.status(400).json(error.response.data?.error);
      console.log(error.response.data?.error);
      console.log(error.response.data?.error.details);
    }
  } else {
    res.status(405).json({ message: "Only POST requests are allowed" });
  }
}
