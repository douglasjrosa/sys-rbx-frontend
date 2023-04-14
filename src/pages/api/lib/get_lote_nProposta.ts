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

export const GetLoteProposta = async (nProposta: any) => {
  try {
    const resposta = await STRAPI.get(`/lotes?populate=*&filters[nProposta][$eq]=${nProposta}&sort[0]=updatedAt%3Adesc&sort[1]=id%3Adesc`);

    const data: any = resposta.data;

    if (data.error) {
      return data.error.response.data.error;
    }

    if (data.data.length === 0) {
      throw {
        response: {
          status: 404,
          message: "Esse pedido não possui lotes",
          detalhes:
            "A solicitação de lotes referente a esse pedidos retornou 0",
        },
      };
    }

    return data.data;
  } catch (error: any) {

    const status = error.response?.status || 500;
    const message =
      error.message ||
      error.response.data.error.message ||
      "Erro do Servidor Interno";
    const errorResponse: ApiErrorResponse = {
      message,
      status,
      erro: error.erro || error.response.data.error.name || "[]",
      detalhes: error.detalhes|| error.response.data.error.message || "null",
    };
    throw errorResponse;
  }
};
