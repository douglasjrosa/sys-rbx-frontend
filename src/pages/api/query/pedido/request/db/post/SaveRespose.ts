/* eslint-disable no-undef */
import axios from 'axios';

const token = process.env.ATORIZZATION_TOKEN;
const axiosRequet = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
});

export const SaveRespose = async (
  nPedido: string,
  Bpedido: string,
  Idnegocio: string,
) => {
  const dataDbPedido = {
    data: {
      Bpedido: Bpedido.toString(),
      stausPedido: true,
    },
  };

  await axiosRequet
    .put(`/pedidos/` + nPedido, dataDbPedido)
    .then((res) => console.log(res.data))
    .catch((err) => console.log(err.response.data.error));

  await axiosRequet
    .put(`/businesses/` + Idnegocio, dataDbPedido)
    .then((res) => console.log(res.data))
    .catch((err) => console.log(err.response.data.error));
};
