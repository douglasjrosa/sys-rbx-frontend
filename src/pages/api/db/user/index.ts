import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const token = process.env.ATORIZZATION_TOKEN;
    await axios
      .get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/users?filters[confirmed][$eq]=true&sort[0]=username%3Adesc&fields[0]=id&fields[1]=username`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        res.status(200).json(response.data);
      })
      .catch((error) => {
        res.status(500).json(error);
      });
  } else {
    res.status(405).json({ message: "Only GET requests are allowed" });
  }
}
