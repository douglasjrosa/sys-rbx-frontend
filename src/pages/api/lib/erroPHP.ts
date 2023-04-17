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
  console.log(DodyData);

  await STRAPI.post(`/erro-phps`, DodyData)
    .then((rest: any) => {
      console.log(rest.data.data)
      return rest.data.data;
    })
    .catch((err: any) => {
      console.log(err.response.data)
     return err.response.data;
    });
};
