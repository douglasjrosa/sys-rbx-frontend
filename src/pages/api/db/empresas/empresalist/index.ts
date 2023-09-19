/* eslint-disable no-undef */
import { GET_Strapi } from "@/pages/api/lib/request_strapi/get";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * GetEmpresa function to fetch empresa data from the API.
 *
 * @param req - The NextApiRequest object.
 * @param res - The NextApiResponse object.
 * @returns Promise<void>
 */
export default async function GetEmpresaAllMin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method === "GET") {
    try {
      const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/empresas?sort[0]=nome%3Aasc&fields[0]=nome&populate[user][fields][0]=username&populate[businesses]=*&populate[interacaos][fields][0]=proxima&populate[interacaos][fields][1]=vendedor_name&populate[interacaos][fields][2]=status_atendimento&pagination[limit]=8000`;

      const response = await GET_Strapi(url);
      res.status(200).json(response.data);
    } catch (error) {
      res.status(400).json(error);
    }
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
