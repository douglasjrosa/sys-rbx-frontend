/* eslint-disable no-undef */
import axios from 'axios';
import { ApiErrorResponse } from '../../../../../../../types/axiosErrosPedido';
import { PostItems } from '../postItems';

export const GetItemsBling = async (data: any[]) => {
  const token = process.env.ATORIZZATION_TOKEN_BLING;

  const url = axios.create({
    baseURL: process.env.BLING_API_URL,
    params: {
      apikey: token,
    },
  });

  const items = await Promise.all(
    data.map(async (i) => {
      try {
        const resp = await url.get(`/produto/${i.prodId}/json/`);
        const { produtos, erros } = resp.data.retorno;

        if (erros && erros[0].erro.cod === 14) {
          const post = await PostItems(i);
          return post;
        }
        if (resp.data.retorno.erros[0].erro.cod !== 14) {
          throw Object.assign(new Error(resp.data.retorno.erros[0].erro.msg), {
            response: {
              status: 404,
            },
            erro: resp.data.retorno.erros[0].erro,
            detalhes: resp.data.retorno.erros[0].erro.msg,
          });
        }

        return produtos[0].produto;
      } catch (error) {
        const errorResponse: ApiErrorResponse = {
          message: error.message ?? `Solicitação invalida`,
          status: error.response?.status ?? 400,
          erro: error.erro ?? '[]',
          detalhes: error.detalhes ?? 'null',
        };
        throw errorResponse;
      }
    }),
  );

  return items;
};
