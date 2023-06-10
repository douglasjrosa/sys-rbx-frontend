import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const hoje = new Date();
    const DataIncicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const DataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    const token = process.env.ATORIZZATION_TOKEN;
    const url =
      process.env.NEXT_PUBLIC_STRAPI_API_URL +
      `/empresas?filters[status][$eq]=true&filters[createdAt][$between]=${DataIncicio}&filters[createdAt][$between]=${DataFim}&fields[0]=nome&fields[1]=ultima_compra&fields[2]=ultima_compra_comcluida&fields[3]=valor_ultima_compra`;

    await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((resp) => resp.json())
      .then((json) => {
        const retorno = json.data
        res.status(200).json(retorno);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
