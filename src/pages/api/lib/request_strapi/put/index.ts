import axios from "axios";

/**
 * Logs empresa data.
 *
 * @param dados - The empresa data.
 * @param tipo - The tipo of the log.
 * @param solicitante - The solicitante of the log.
 *
 * @returns A promise that resolves to a string indicating the success of the operation.
 */

export const PUT_Strapi = async (dados: any, url: string) => {
  try {
    const token = process.env.ATORIZZATION_TOKEN;
    const STRAPI = axios.create({
      baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const response = await STRAPI.put(url, dados);
    console.log("registro salvo", response.data.data);
    return response.data;
  } catch (err: any) {
    console.log("registro erro", err.response.data);
    return err.response.data;
  }
};
