/* eslint-disable no-undef */

import axios from "axios";
import { ApiErrorResponse } from "../../../../../../../types/axiosErrosPedido";

export const GetPedido = async (nPedido: any) => {
  await axios({
    url: `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/pedidos?populate=*&filters[nPedido][$eq]=${nPedido}`,
    headers: {
      Authorization: `Bearer ${process.env.ATORIZZATION_TOKEN}`,
      "Content-Type": "application/json",
    },
  })
    .then((response: any) => {
      console.log("🚀 ~ file: index.ts:15 ~ .then ~ response:", response)
      return response.data;
    })
    .catch((error: ApiErrorResponse) => {
      console.log("🚀 ~ file: index.ts:19 ~ GetPedido ~ error:", error)
      throw new Error(error.message);
    });
};
