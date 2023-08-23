import axios from "axios";

export const LogEmpresa = async (
  nome: string,
  dados: any,
  tipo: string,
  solicitante: string
) => {
  const token = process.env.ATORIZZATION_TOKEN;
  const STRAPI = axios.create({
    baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const DobyData = {
    data: {
      nome: nome,
      dados: dados,
      tipo: tipo,
      solicitante: solicitante,
    },
  };
  await STRAPI.post(`/log-empresas`, DobyData)
    .then((rest: any) => {
      console.log('registro de log alteração de empresas',rest.data.data)
      const msg = "Empresa alterada com sucesso";
      return msg;
    })
    .catch((err: any) => {
      console.log('registro erro de log alteração de empresas',err.response.data)
      return err.response.data;
    });
};
