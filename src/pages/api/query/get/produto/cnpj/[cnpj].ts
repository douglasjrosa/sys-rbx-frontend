import { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosRequestConfig } from "axios";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const Email = "kingdever88@gmail.com";
    const token: any = process.env.ATORIZZATION_TOKEN_RIBERMAX;
    const cnpj = req.query.cnpj;
    const url =
      process.env.RIBERMAX_API_URL + "/produtos?CNPJ=" + cnpj + "&limit=30";

    const config: AxiosRequestConfig = {
      headers: {
        // Adicione quaisquer cabeçalhos necessários aqui
        Email: Email,
        Token: token,
      },
      timeout: 60000, // tempo limite de 60 segundos
    };

    try {
      const response = await axios.get(url, config);
      console.log("🚀 ~ file: [cnpj].ts:27 ~ response.data:", response.data)
      res.status(200).json(response.data);
    } catch (error) {
      console.error("Ocorreu um erro durante a solicitação:", error);
      res.status(500).json({ error: "Ocorreu um erro durante a solicitação" });
    }
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
