import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const token = process.env.ATORIZZATION_TOKEN;
    const {Pesqisa, Vendedor, Empresa} = req.query

    const Url = Pesqisa === 'EM ANDAMENTO'
    ? `/businesses?populate=*&filters[andamento][$eq]=3&filters[vendedor][username][$eq]=${Vendedor}&sort[0]=id%3Adesc&pagination[limit]=50`
    :Pesqisa === 'PERDIDO'
    ? `/businesses?populate=*&filters[andamento][$eq]=1&filters[vendedor][username][$eq]=${Vendedor}&sort[0]=id%3Adesc&pagination[limit]=50`
    : Pesqisa === 'CONCLUÍDOS'
    ? `/businesses?populate=*&filters[andamento][$eq]=5&filters[vendedor][username][$eq]=${Vendedor}&sort[0]=id%3Adesc&pagination[limit]=50`
    : Pesqisa === 'TODOS OS NEGÓCIOS'
    ? `/businesses?populate=*&filters[vendedor][username][$eq]=${Vendedor}&sort[0]=id%3Adesc&pagination[limit]=50`
    : `/businesses?populate=*&filters[empresa][id][$eq]=${Empresa}&sort[0]=id%3Adesc&pagination[limit]=50`

    await axios({
      method: "GET",
      url:
        process.env.NEXT_PUBLIC_STRAPI_API_URL + Url,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((resp: any) => {
        res.status(200).json(resp.data.data);
      })
      .catch((err) => {
        res
          .status(err.response.status || 400)
          .send(err.response.data.error.message);
      });
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
