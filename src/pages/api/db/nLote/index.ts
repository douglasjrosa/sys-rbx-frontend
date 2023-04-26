import { ApiErrorResponse } from "@/types/axiosErrosPedido";
import axios from "axios";

const NloteEnvi: any = process.env.LOTE_INICIAL;
const token = process.env.ATORIZZATION_TOKEN;
const baseUrl = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

export const nLote = async () => {
  try {
    const resposta = await baseUrl.get(
      "/lotes?fields[0]=lote&sort=lote%3Adesc&pagination[limit]=1"
    );

    const [NLote]: any = resposta.data.data;

    if (!NloteEnvi && !NLote) {
      throw {
        response: {
          status: 404,
        },
        message: "Erro ao gerar numero de lote",
        erro: "Não foi possivel gera o numero de lote",
        detalhes:
          "O numero de lote inicial Não foi encontardo e o retorno do Database foi null",
      };
    }

    if (!NLote) {
      const ALote = parseInt(NloteEnvi) + 1;
      return ALote;
    }

    if (
      NLote.attributes.lote === "" ||
      NLote.attributes.lote === null ||
      NLote.attributes.lote === undefined
    ) {
      const ALote = parseInt(NloteEnvi) + 1;
      return ALote;
    }

    const AnLote = parseInt(NLote.attributes.lote) + 1;
    return AnLote;
    
  } catch (error: any) {
    console.log(error);
    const status = error.response?.status || 500;
    const message = error.message || "Erro do Servidor Interno";
    const errorResponse: ApiErrorResponse = {
      message,
      status,
      erro: error.erro || "[]",
      detalhes: error.detalhes || "null",
    };
    throw errorResponse;
  }
};
