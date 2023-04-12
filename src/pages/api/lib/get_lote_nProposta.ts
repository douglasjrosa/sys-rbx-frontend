import { ApiErrorResponse } from "@/types/axiosErrosPedido";
import axios from "axios"

const token = process.env.ATORIZZATION_TOKEN;
const STRAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

export const GetLoteProposta = async(nProposta: any) => {

  try {
    const resposta = await STRAPI.get(`/lotes`,{
      params: {
        populate: '*',
        'filters[nProposta][$eq]': nProposta,
      },
    });

    const data: any = resposta.data;

    if (data.error) {
      return data.error.response.data.error
    }

    if (data.data.length === 0) {
      throw {
        response: {
          status: 404,
        },
        message: 'Esse Negocio não possui pedidos',
        erro: '[]',
        detalhes:
          'A solicitação de pedidos referente a esse Negocio retornou 0',
      };
    }

    return data.data;

  } catch (error: any) {
    const status = error.response?.status || 500;
    const message = error.message || 'Erro do Servidor Interno';
    const errorResponse: ApiErrorResponse = {
      message,
      status,
      erro: error.erro || '[]',
      detalhes: error.detalhes || 'null',
    };
    throw errorResponse;
  }
}
