import { ApiErrorResponse } from "@/types/axiosErrosPedido";
import axios from "axios";

const token = process.env.ATORIZZATION_TOKEN;

const STRAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

export const GetTrelloId = async () => {
  try {
    const resposta = await STRAPI.get(`/users`, {
      params: {
        "filters[$or][0][setor][$eq]": "Vendas",
        "filters[$or][1][setor][$eq]": "Expedição",
        "filters[$or][2][setor][$eq]": "Produção",
        "filters[$or][3][setor][$eq]": "Gvendas",
      },
    });

    const data: any = resposta.data;
    if (data.length === 0) {
      throw {
        status: 400,
        name: "Vazio",
        message: "retornou vazio",
      };
    }

    const MapSetor = data.map((i: any) => i.trello_id);
    return MapSetor;
  } catch (error: any) {
    const err = error.response.data.error;
    throw {
      status: err.status,
      name: err.name,
      message: err.message,
    };
  }
};
