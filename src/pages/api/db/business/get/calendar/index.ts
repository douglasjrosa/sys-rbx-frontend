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
      const vendedorFilter = Vendedor ? `filters[vendedor][username][$eq]=${Vendedor}&` : '';

      const conclucaoResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/businesses?filters[date_conclucao][$between]=${DataIncicio}&filters[date_conclucao][$between]=${DataFim}&${vendedorFilter}filters[status][$eq]=true&filters[andamento][$eq]=5&sort[0]=id%3Adesc&fields[0]=deadline&fields[1]=createdAt&fields[2]=DataRetorno&fields[3]=date_conclucao&fields[4]=nBusiness&fields[5]=andamento&fields[6]=Budget&fields[7]=etapa&populate[empresa][fields][0]=nome&populate[vendedor][fields][0]=username&populate[pedidos][fields][0]=totalGeral`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const dataRetornoResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/businesses?filters[DataRetorno][$between]=${DataIncicio}&filters[DataRetorno][$between]=${DataFim}&${vendedorFilter}filters[status][$eq]=true&filters[andamento][$eq]=3&sort[0]=id%3Adesc&fields[0]=etapa&fields[1]=andamento&fields[2]=Budget&fields[3]=DataRetorno&populate[vendedor][fields][0]=username`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const deadlineResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/businesses?filters[date_conclucao][$between]=${DataIncicio}&filters[date_conclucao][$between]=${DataFim}&filters[status][$eq]=true&${vendedorFilter}filters[andamento][$eq]=1&sort[0]=id%3Adesc&fields[0]=etapa&fields[1]=andamento&fields[2]=Budget&fields[3]=DataRetorno&populate[vendedor][fields][0]=username`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const em_aberto_bruto = dataRetornoResponse.data.data;
      const perdido_bruto = deadlineResponse.data.data;
      const conclusao_bruto = conclucaoResponse.data.data;
      const data = conclucaoResponse.data.data;

      const em_aberto_reduce = em_aberto_bruto.reduce(
        (acc: number, item: any) => {
          const budgetString = item.attributes.Budget;
          const budget =
            budgetString !== null
              ? parseFloat(
                  budgetString
                    .replace(/[^0-9,]/g, "")
                    .replace(".", "")
                    .replace(",", ".")
                )
              : 0;
          return acc + budget;
        },
        0
      );

      const em_aberto = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(em_aberto_reduce);

      const conclusao_reduce = conclusao_bruto.reduce((acc: number, d: any) => {
        const budgetString = d.attributes.Budget;
        const budget =
          budgetString !== null
            ? parseFloat(
                budgetString
                  .replace(/[^0-9,]/g, "")
                  .replace(".", "")
                  .replace(",", ".")
              )
            : 0;
        return acc + budget;
      }, 0);

      const conclusao = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(conclusao_reduce);

      const perdido_reduce = perdido_bruto.reduce((acc: number, d: any) => {
        const budgetString = d.attributes.Budget;
        const budget =
          budgetString !== null
            ? parseFloat(
                budgetString
                  .replace(/[^0-9,]/g, "")
                  .replace(".", "")
                  .replace(",", ".")
              )
            : 0;
        return acc + budget;
      }, 0);

      const perdido = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(perdido_reduce);

      const DataRetono = {
        em_aberto,
        perdido,
        conclusao,
        data,
      };

      res.status(200).json(DataRetono);
    } catch (error: any) {
      res
        .status(error.response?.status || 500)
        .json(error.response?.data || { message: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ message: "Only GET requests are allowed" });
  }
}
