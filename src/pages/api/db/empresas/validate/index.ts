/* eslint-disable no-undef */
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function getId(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const token = process.env.ATORIZZATION_TOKEN;
    const { id } = req.query;
    const getEmpresas = await axios(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/empresas?filters[status][$eq]=true&filters[inativStatus][$gt]=1&fields[0]=nome&fields[1]=ultima_compra&fields[2]=penultima_compra&fields[3]=valor_ultima_compra&fields[4]=inativStatus&fields[5]=inativOk&populate[user][fields][0]=username`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const empresas = getEmpresas.data.data;

    try {
      const EmpresasMap = empresas.map(async (empresa: any) => {
        const user = empresa.attributes.user.data;
        const inativStatus = empresa.attributes.inativStatus;
        const ultima_compra = empresa.attributes.ultima_compra;
        const valor_ultima_compra = empresa.attributes.valor_ultima_compra;
        const penultima_compra = empresa.attributes.penultima_compra;
        const inativOk = empresa.attributes.inativOk;
        const periodoInativo = !inativOk ? 60 : inativOk;

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

        let update;
        if (inativStatus == 5) {
          if (dataAtual > dataLimite) {
            if (diferencaEmDias <= 10) {
              update = {
                data: {
                  inativStatus: 2,
                },
              };

              // return `A data atual passou ${diferencaEmDias} dias além do período de ${periodo} dias, id do cliente ${empresa.id}, =>Cliente em estado de alerta<=.`;
            } else {
              update = {
                data: {
                  vendedor: "",
                  user: null,
                  inativStatus: 1,
                },
              };
              // return `A data atual passou ${diferencaEmDias} dias além do período de ${periodo} dias, id do cliente ${empresa.id}, =>cliente perdido<=.`;
            }
          } else {
            return `Ainda não passou do período de ${periodo} dias, id do cliente ${empresa.id}.`;
          }
        } else if (inativStatus == 3 || inativStatus == 4) {
          const mesUltimaCompra = new Date(ultima_compra).getMonth();
          const mesAtual = new Date().getMonth();
          if (mesUltimaCompra != mesAtual) {
            update = {
              data: {
                inativStatus: 5,
              },
            };
          }
        }

        await axios({
          method: "PUT",
          url:
            process.env.NEXT_PUBLIC_STRAPI_API_URL +
            "/empresas/" +
            empresa.id,
          data: update,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
          .then((Response) => {
            return Response.data;
          })
          .catch((err) => {
            return {
              error: err.response.data,
              mensage: err.response.data.error,
              detalhe: err.response.data.error.details,
            };
          });

      });
      res.json(EmpresasMap);
    } catch (err: any) {
      console.log(err);
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
