/* eslint-disable no-undef */

import axios, { AxiosResponse } from 'axios';
import { ApiErrorResponse } from '../../../../../../../types/axiosErrosPedido';

export const GetPedido = async (nPedido: any): Promise<AxiosResponse> => {
  const token = process.env.ATORIZZATION_TOKEN;

  const url = axios.create({
    baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
    timeout: 1000,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  try {
    const resposta = await url.get(
      '/pedidos?populate=*&filters[nPedido][$eq]=' + nPedido,
    );
    if (resposta.data.data.length === 0 && resposta.status === 200) {
      console.log('aki');
      throw Object.assign(new Error('Esse Negocio não possui pedidos'), {
        response: {
          status: 404,
        },
        erro: '[]',
        detalhes:
          'A solicitação de pedidos referente a esse Negocio retornou 0',
      });
    }
    return resposta.data.data;
  } catch (erro) {
    console.log(erro);
    if (erro.response?.status === 400) {
      const errorResponse: ApiErrorResponse = {
        message: erro.message ?? `Solicitação invalida`,
        status: erro.response?.status ?? 400,
        erro: erro.erro ?? '[]',
        detalhes: erro.detalhes ?? 'null',
      };
      throw errorResponse;
    }
    if (erro.response?.status === 401) {
      const errorResponse: ApiErrorResponse = {
        message: erro.message ?? 'Você não é autorizado',
        status: erro.response?.status ?? 401,
        erro: erro.erro ?? '[]',
        detalhes: erro.detalhes ?? 'null',
      };
      throw errorResponse;
    }
    if (erro.response?.status === 403) {
      const errorResponse: ApiErrorResponse = {
        message: erro.message ?? 'Proibido',
        status: erro.response?.status ?? 403,
        erro: erro.erro ?? '[]',
        detalhes: erro.detalhes ?? 'null',
      };
      throw errorResponse;
    }
    if (erro.response?.status === 404) {
      const errorResponse: ApiErrorResponse = {
        message: erro.message ?? 'Não encontrado',
        status: erro.response?.status ?? 404,
        erro: erro.erro ?? '[]',
        detalhes: erro.detalhes ?? 'null',
      };
      throw errorResponse;
    }
    if (erro.response?.status === 500) {
      const errorResponse: ApiErrorResponse = {
        message: erro.message ?? 'Erro do Servidor Interno',
        status: erro.response?.status ?? 500,
        erro: erro.erro ?? '[]',
        detalhes: erro.detalhes ?? 'null',
      };
      throw errorResponse;
    }
  }
};
