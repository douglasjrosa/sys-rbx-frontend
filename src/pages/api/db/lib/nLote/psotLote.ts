import { ApiErrorResponse } from "@/types/axiosErrosPedido";
import axios from "axios";
import { nLote } from ".";

const NloteEnvi: any = process.env.LOTE_INICIAL;
const token = process.env.ATORIZZATION_TOKEN;
const baseUrl = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

export const PostLote = async (
  item: any,
  negocio: number,
  empresa: number,
  fornecedor: number,
  vendedor: number
) => {
  const NLote = await nLote();
  const postLote = {
    data: {
      lote: NLote,
      empresa: empresa,
      empresaId: empresa,
      business: negocio,
      produtosId: item.prodId,
      emitente: fornecedor,
      emitenteId: fornecedor,
      qtde: item.Qtd,
      info: "",
      status: "",
      checklist: "",
      logs: "",
      vendedor: vendedor,
    },
  };

  try {
    const resposta = await baseUrl
      .post("/lotes", postLote)
      .then((res: any) => {
        return res.data;
      })
      .catch((err: any) => {
        throw {
          response: {
            status: 404,
          },
          message: "Erro ao gerar numero de lote",
          erro: "Não foi possivel gera o numero de lote",
          detalhes:
            "O numero de lote inicial Não foi encontardo e o retorno do Database foi null",
        };
      });
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
