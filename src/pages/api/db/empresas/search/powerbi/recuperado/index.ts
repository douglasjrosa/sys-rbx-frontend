import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {

    const Vendedor = req.query.Vendedor

    const token = process.env.ATORIZZATION_TOKEN;
    const url =
      process.env.NEXT_PUBLIC_STRAPI_API_URL +
      `/empresas?filters[status][$eq]=true&filters[inativStatus][$eq]=4&filters[user][username][$eq]=${Vendedor}&fields[0]=nome&fields[1]=ultima_compra&fields[2]=penultima_compra&fields[3]=valor_ultima_compra&fields[4]=inativStatus&fields[5]=inativOk&populate[user][fields][0]=username`;

    await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((resp) => resp.json())
    .then((json) => {

        const retorno = json.data.map((i: any) => {
          const empresa = i;
          if (
            empresa.attributes.ultima_compra !==
            empresa.attributes.ultima_compra_comcluida
          ) {
            return empresa;
          }
        });
        res.status(200).json(retorno);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
