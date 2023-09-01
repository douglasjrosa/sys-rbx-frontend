import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const token = process.env.ATORIZZATION_TOKEN;
      const { DataIncicio, DataFim, Vendedor } = req.query;

      const conclucaoResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/businesses?filters[vendedor][username][$eq]=${Vendedor}&filters[status][$eq]=true&filters[date_conclucao][$between]=${DataIncicio}&filters[date_conclucao][$between]=${DataFim}&sort[0]=id%3Adesc&fields[0]=deadline&fields[1]=createdAt&fields[2]=DataRetorno&fields[3]=date_conclucao&fields[4]=nBusiness&fields[5]=andamento&fields[6]=Budget&fields[7]=etapa&populate[empresa][fields][0]=nome&populate[vendedor][fields][0]=username&populate[pedidos][fields][0]=totalGeral`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const dataRetornoResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/businesses?filters[vendedor][username][$eq]=${Vendedor}&filters[status][$eq]=true&filters[DataRetorno][$between]=${DataIncicio}&filters[DataRetorno][$between]=${DataFim}&sort[0]=id%3Adesc&fields[0]=deadline&fields[1]=createdAt&fields[2]=DataRetorno&fields[3]=date_conclucao&fields[4]=nBusiness&fields[5]=andamento&fields[6]=Budget&fields[7]=etapa&populate[empresa][fields][0]=nome&populate[vendedor][fields][0]=username&populate[pedidos][fields][0]=totalGeral`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const deadlineResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/businesses?filters[vendedor][username][$eq]=${Vendedor}&filters[status][$eq]=true&filters[deadline][$between]=${DataIncicio}&filters[deadline][$between]=${DataFim}&sort[0]=id%3Adesc&fields[0]=deadline&fields[1]=createdAt&fields[2]=DataRetorno&fields[3]=date_conclucao&fields[4]=nBusiness&fields[5]=andamento&fields[6]=Budget&fields[7]=etapa&populate[empresa][fields][0]=nome&populate[vendedor][fields][0]=username&populate[pedidos][fields][0]=totalGeral`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const createdAtResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/businesses?filters[vendedor][username][$eq]=${Vendedor}&filters[status][$eq]=true&filters[createdAt][$between]=${DataIncicio}&filters[createdAt][$between]=${DataFim}&sort[0]=id%3Adesc&fields[0]=deadline&fields[1]=createdAt&fields[2]=DataRetorno&fields[3]=date_conclucao&fields[4]=nBusiness&fields[5]=andamento&fields[6]=Budget&fields[7]=etapa&populate[empresa][fields][0]=nome&populate[vendedor][fields][0]=username&populate[pedidos][fields][0]=totalGeral`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = [
        ...conclucaoResponse.data.data,
        ...dataRetornoResponse.data.data,
        ...deadlineResponse.data.data,
        ...createdAtResponse.data.data,
      ];

      // Remover IDs duplicados
      const uniqueData = data.reduce((acc, obj) => {
        if (!acc[obj.id]) {
          acc[obj.id] = obj;
        }
        return acc;
      }, {});

      const sortedData = Object.values(uniqueData);

      sortedData.sort((objetoA: any, objetoB: any) => {
        if (objetoA.id < objetoB.id) {
          return 1;
        } else if (objetoA.id > objetoB.id) {
          return -1;
        } else {
          return 0;
        }
      });

      res.status(200).json(sortedData);
     
    } catch (error: any) {
      console.log("🚀 ~ file: index.ts:85 ~ error.response?:", error.response)
      res
        .status(error.response?.status || 500)
        .json(error.response?.data || { message: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ message: "Only GET requests are allowed" });
  }
}
