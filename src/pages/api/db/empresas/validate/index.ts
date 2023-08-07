import axios, { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

interface Empresa {
  id: string;
  attributes: {
    user: { data: any };
    inativStatus: number;
    ultima_compra: string;
    valor_ultima_compra: number;
    penultima_compra: string;
    inativOk: number;
  };
}

export default async function getId(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method === "GET") {
    try {
      const token = process.env.ATORIZZATION_TOKEN;
      const getEmpresas = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/empresas?filters[status][$eq]=true&filters[inativStatus][$gt]=1&fields[0]=nome&fields[1]=ultima_compra&fields[2]=penultima_compra&fields[3]=valor_ultima_compra&fields[4]=inativStatus&fields[5]=inativOk&populate[user][fields][0]=username`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const empresas: Empresa[] = getEmpresas.data.data;

      const EmpresasMap = empresas.map(async (empresa: Empresa) => {
        try {
          const { inativStatus, ultima_compra, inativOk } = empresa.attributes;
          
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

          var update;
          if (
            inativStatus == 5 &&
            dataAtual > dataLimite &&
            diferencaEmDias <= 10
          ) {
            update = {
              data: {
                inativStatus: 2,
              },
            };
          } else if (
            inativStatus == 2 &&
            dataAtual > dataLimite &&
            diferencaEmDias > 10
          ) {
            update = {
              data: {
                vendedor: "",
                user: null,
                inativStatus: 1,
              },
            };
            // return `A data atual passou ${diferencaEmDias} dias além do período de ${periodo} dias, id do cliente ${empresa.id}, =>cliente perdido<=.`;
          }

          if (inativStatus == 3 || inativStatus == 4) {
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

          if (update) {
            const response: AxiosResponse = await axios(
              `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/empresas/${empresa.id}`,
              {
                method: "PUT",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                data: update,
              }
            );

            return response.data;
          }else return inativStatus;
        } catch (err: any) {
          return {
            error: err.response.data,
            mensage: err.response.data.error,
            detalhe: err.response.data.error.details,
          };
        }
      });

      const result = await Promise.all(EmpresasMap);

      res.json(result);
    } catch (err: any) {
      console.log(err);
      res.status(400).json(err);
    }
  } else {
    res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
