/* eslint-disable no-undef */
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function getId(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const token = process.env.ATORIZZATION_TOKEN;
    const {id} = req.query
    const getEmpresa = await axios(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/empresas?filters[status][$eq]=true&fields[0]=nome&fields[1]=ultima_compra&fields[2]=penultima_compra&fields[3]=valor_ultima_compra&fields[4]=inativStatus&fields[5]=inativOk&populate[user][fields][0]=username`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const empresa = getEmpresa.data.data

    try {
      const EmpresaMap = empresa.map((item: any) => {
        const user = item.attributes.user.data;
        const inativStatus = item.attributes.inativStatus;
        const ultima_compra = item.attributes.ultima_compra;
        const valor_ultima_compra = item.attributes.valor_ultima_compra;
        const penultima_compra = item.attributes.penultima_compra;
        const inativOk = item.attributes.inativOk;
        const periodoInativo = !inativOk ? 0 : inativOk;

        if(ultima_compra){
          const dataReferencia: Date = new Date(ultima_compra);
          const periodo: number = periodoInativo; // período em dias

          // Adiciona o período de dias à data de referência
          const dataLimite: Date = new Date(dataReferencia.getTime());
          dataLimite.setDate(dataLimite.getDate() + periodo);

          const dataAtual: Date = new Date(); // Utiliza a data atual

          // Calcula a diferença em milissegundos
          const diferencaEmMilissegundos: number = Math.abs(
            dataAtual.getTime() - dataLimite.getTime()
          );

          // Converte para dias
          const diferencaEmDias: number = Math.ceil(
            diferencaEmMilissegundos / (1000 * 60 * 60 * 24)
          );

          if (dataAtual > dataLimite) {
            if(diferencaEmDias <= 10 ){
              return `A data atual passou ${diferencaEmDias} dias além do período de ${periodo} dias, id do cliente ${item.id}, =>Cliente em estado de alerta<=.`;
            }
            if(diferencaEmDias > 10 ){
              return `A data atual passou ${diferencaEmDias} dias além do período de ${periodo} dias, id do cliente ${item.id}, =>cliente perdido<=.`;
            }
          } else {
            return`Ainda não passou do período de ${periodo} dias, id do cliente ${item.id}.`;
          }
        }
       
      });
      res.json(EmpresaMap)
    } catch (err: any) {
      console.log(err)
      // res.status(400).json({
      //   error: err.response.data,
      //   mensage: err.response.data.error,
      //   detalhe: err.response.data.error.details,
      // });
    }
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
