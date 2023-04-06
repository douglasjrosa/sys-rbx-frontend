/* eslint-disable no-undef */

import axios from 'axios';
import { ApiErrorResponse } from '../../../../../../../types/axiosErrosPedido';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
  timeout: 1000,
  headers: {
    Authorization: `Bearer ${process.env.ATORIZZATION_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export const GetPedido = async (nPedido: any) => {
  try {
    const resP = await api.get('/pedidos', {
      params: {
        populate: '*',
        'filters[nPedido][$eq]': nPedido,
      },
    });

    const data = resP.data.data;
    if (data.length === 0) {
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

    return data;
  } catch (erro: any) {
    const status = erro.response?.status || 500;
    const message = erro.message || 'Erro do Servidor Interno';
    const errorResponse: ApiErrorResponse = {
      message,
      status,
      erro: erro.erro || '[]',
      detalhes: erro.detalhes || 'null',
    };
    throw errorResponse;
  }
};
