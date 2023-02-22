/* eslint-disable no-undef */
import axios from 'axios';

export const Historico = async (txt: any, url: string) => {
  const token = process.env.ATORIZZATION_TOKEN;
  const axiosRequet = axios.create({
    baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const verifique = await axiosRequet.get(url);
  const respVerifique = verifique.data.data;
  const { SalesHistory } = respVerifique.attributes;

  const data = {
    data: {
      SalesHistory: [...SalesHistory, txt],
    },
  };
  await axiosRequet
    .put(url, data)
    .then((response) => {
      const resp = `Aleteração do cliente id: ${response.data.data.id}, nome: ${response.data.data.attributes.nome}, foi registrada!`;
      return resp;
    })
    .catch((error) => {
      return error;
    });
};
