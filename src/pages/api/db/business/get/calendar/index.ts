import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const token = process.env.ATORIZZATION_TOKEN;
      const { DataIncicio, DataFim } = req.query;
      console.log("🚀 ~ file: index.ts:12 ~ DataFim:", DataFim)
      console.log("🚀 ~ file: index.ts:12 ~ DataIncicio:", DataIncicio)



      const conclucaoResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/businesses?filters[date_conclucao][$between]=${DataIncicio}&filters[date_conclucao][$between]=${DataFim}&sort[0]=id%3Adesc&fields[0]=deadline&fields[1]=createdAt&fields[2]=DataRetorno&fields[3]=date_conclucao&fields[4]=nBusiness&populate[empresa][fields][0]=nome`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const dataRetornoResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/businesses?filters[DataRetorno][$between]=${DataIncicio}&filters[DataRetorno][$between]=${DataFim}&sort[0]=id%3Adesc&fields[0]=deadline&fields[1]=createdAt&fields[2]=DataRetorno&fields[3]=date_conclucao&fields[4]=nBusiness&populate[empresa][fields][0]=nome`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const deadlineResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/businesses?filters[deadline][$between]=${DataIncicio}&filters[deadline][$between]=${DataFim}&sort[0]=id%3Adesc&fields[0]=deadline&fields[1]=createdAt&fields[2]=DataRetorno&fields[3]=date_conclucao&fields[4]=nBusiness&populate[empresa][fields][0]=nome`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const createdAtResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/businesses?filters[deadline][$between]=${DataIncicio}&filters[deadline][$between]=${DataFim}&sort[0]=id%3Adesc&fields[0]=deadline&fields[1]=createdAt&fields[2]=DataRetorno&fields[3]=date_conclucao&fields[4]=nBusiness&populate[empresa][fields][0]=nome`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      await Promise.all([conclucaoResponse, dataRetornoResponse, deadlineResponse, createdAtResponse]);

      const data = {
        conclucao: conclucaoResponse.data.data,
        dataRetorno: dataRetornoResponse.data.data,
        deadline: deadlineResponse.data.data,
        createdAt: createdAtResponse.data.data,
      };

      res.status(200).json(data);
    } catch (error: any) {
      res.status(error.response?.status || 500).json(error.response?.data || { message: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ message: "Only GET requests are allowed" });
  }
}
