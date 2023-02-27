/* eslint-disable no-undef */
import axios from 'axios';

export const IncidentRecord = async (txt: any, business: string) => {
  const token = process.env.ATORIZZATION_TOKEN;
  const axiosRequet = axios.create({
    baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const url = '/businesses/' + business;
  const verifique = await axiosRequet.get(url);
  const respVerifique = verifique.data.data;
  const { incidentRecord } = respVerifique.attributes;

  const data = {
    data: {
      incidentRecord: [...incidentRecord, txt],
    },
  };
  await axiosRequet
    .put(url, data)
    .then((response) => {
      const resp = `acresentado mais 1 registro`;
      return resp;
    })
    .catch((error) => {
      return error;
    });
};
