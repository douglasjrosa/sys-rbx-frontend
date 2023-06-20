import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const token = process.env.ATORIZZATION_TOKEN;
    const Vendedor = req.query.Vendedor;
    const url =
      process.env.NEXT_PUBLIC_STRAPI_API_URL +
      `/empresas?filters[status][$eq]=true&filters[inativStatus][$eq]=3&filters[user][username][$eq]=${Vendedor}&filters[ultima_compra][$notNull]=true&fields[0]=nome&fields[1]=ultima_compra&fields[2]=penultima_compra&fields[3]=valor_ultima_compra&fields[4]=inativStatus&fields[5]=inativOk&fields[6]=createdAt&populate[user][fields][0]=username`;

    await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((resp) => resp.json())
      .then((json) => {
        const retorno = json.data;
        res.status(200).json(retorno);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
