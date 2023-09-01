import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const Vendedor = req.query.Vendedor;
    const token = process.env.ATORIZZATION_TOKEN;
    const url =
      process.env.NEXT_PUBLIC_STRAPI_API_URL +
      `/empresas?filters[status][$eq]=true&filters[$or][0][inativStatus][$eq]=1&filters[$or][1][inativStatus][$null]=true&fields[0]=nome&fields[1]=ultima_compra&fields[2]=penultima_compra&fields[3]=valor_ultima_compra&fields[4]=inativStatus&fields[5]=inativOk`;

    console.log("🚀 ~ file: index.ts:12 ~ url:", url);

    await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((resp) => resp.json())
      .then((json) => {
        res.status(200).json(json.data);
        console.log("🚀 ~ file: index.ts:25 ~ .then ~ json.data:", json.data);
      })
      .catch((err) => {
        res.status(400).json(err);
        console.log("🚀 ~ file: index.ts:30 ~ err:", err)
      });
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
