import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const token = process.env.ATORIZZATION_TOKEN;
      const { DataIncicio, DataFim, Vendedor} = req.query;

      const conclucaoResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/businesses?filters[date_conclucao][$between]=${DataIncicio}&filters[date_conclucao][$between]=${DataFim}&filters[vendedor][username][$eq]=${Vendedor}&filters[status][$eq]=true&filters[andamento][$eq]=5&sort[0]=id%3Adesc&fields[0]=deadline&fields[1]=createdAt&fields[2]=DataRetorno&fields[3]=date_conclucao&fields[4]=nBusiness&fields[5]=andamento&fields[6]=Budget&fields[7]=etapa&populate[empresa][fields][0]=nome&populate[vendedor][fields][0]=username&populate[pedidos][fields][0]=totalGeral`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );


      const dataRetornoResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/businesses?filters[DataRetorno][$between]=${DataIncicio}&filters[DataRetorno][$between]=${DataFim}&filters[vendedor][username][$eq]=${Vendedor}&filters[status][$eq]=true&filters[andamento][$eq]=3&sort[0]=id%3Adesc&fields[0]=etapa&fields[1]=andamento&fields[2]=Budget&fields[3]=DataRetorno&populate[vendedor][fields][0]=username`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const deadlineResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/businesses?filters[date_conclucao][$between]=${DataIncicio}&filters[date_conclucao][$between]=${DataFim}&filters[status][$eq]=true&filters[vendedor][username][$eq]=${Vendedor}&filters[andamento][$eq]=1&sort[0]=id%3Adesc&fields[0]=etapa&fields[1]=andamento&fields[2]=Budget&fields[3]=DataRetorno&populate[vendedor][fields][0]=username`,
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

      const em_aberto_reduce = em_aberto_bruto.reduce((acc: number, item: any) => {
        const budgetString = item.attributes.Budget;
        const budget = budgetString !== null ? parseFloat(budgetString.replace(/[^0-9,]/g, '').replace('.', '').replace(',', '.')) : 0;
        return acc + budget;
    }, 0);

    const em_aberto = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(em_aberto_reduce);
    console.log("🚀 ~ file: index.ts:56 ~ em_aberto:", em_aberto)


      const conclusao_reduce = conclusao_bruto.reduce((cc: number, d: any) =>{
        const budget = parseFloat(d.attributes.Budget.replace(/[^0-9,]/g, '').replace('.', '').replace(',', '.'));
        const soma = cc + (isNaN(budget) ? 0 : budget);
        const valor = Math.round(parseFloat(soma.toFixed(2)) * 100) / 100;
        return valor
      }, 0);
      const conclusao = conclusao_reduce.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

      const perdido_reduce = perdido_bruto.reduce((cc: number, d: any) =>{
        const budget = parseFloat(d.attributes.Budget.replace(/[^0-9,]/g, '').replace('.', '').replace(',', '.'));
        const soma = cc + (isNaN(budget) ? 0 : budget);
        const valor = Math.round(parseFloat(soma.toFixed(2)) * 100) / 100;
        return valor
      }, 0);
      const perdido = perdido_reduce.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

      const DataRetono = {
        em_aberto,
        perdido,
        conclusao,
        data
      }

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
