import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function Tackle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }

  try {
    const token = process.env.ATORIZZATION_TOKEN;
    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
    const vendedor = req.query.Vendedor;
    const empresaId = req.query.EMPRESAID;

    const url = `${baseUrl}/businesses?&filters[andamento][$eq]=3&filters[vendedor][username][$ne]=${vendedor}&filters[empresa][id][$eq]=${empresaId}&fields[0]=id`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const lista = response.data.data;

    const promises = lista.map(async (item: any) => {
      const updateUrl = `${baseUrl}/businesses/${item.id}`;
      await axios.put(
        updateUrl,
        { data: { vendedor: null } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    });

    await Promise.all(promises);

    res.status(200).send("FIRST DOWN");
  } catch (error: any) {
    console.error(error.response?.data?.error);
    res.status(400).json(error);
  }
}
