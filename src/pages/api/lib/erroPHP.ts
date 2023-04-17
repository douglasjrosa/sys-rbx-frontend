import axios from "axios";

export const ErroPHP = async (ERROR: any) => {
  const token = process.env.ATORIZZATION_TOKEN;
  const STRAPI = axios.create({
    baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const DodyData = {
    data: {
      ...ERROR,
    },
  };
//  console.log(ERROR.log.error.message)
  await STRAPI.post(`/erro-phps`, DodyData)
    .then((rest: any) => {
      // console.log(rest.data.data)
      const msg = ERROR.log.error.message +" lote "+ ERROR.log.nLote
      return msg;
    })
    .catch((err: any) => {
      // console.log(err.response.data)
     return err.response.data;
    });
};
