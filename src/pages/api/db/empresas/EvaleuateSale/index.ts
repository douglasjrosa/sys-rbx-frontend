import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function getId(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const token = process.env.ATORIZZATION_TOKEN;
    const { id, vendedor, vendedorId, valor } = req.query;
    try {
      const getEmpresa = await axios(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/empresas/${id}?populate=*`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const empresa = getEmpresa.data.data;

      const inativStatus = empresa.attributes.inativStatus;
      const ultima_compra = empresa.attributes.ultima_compra;

      let update;

      if (!inativStatus || inativStatus == 3) {
        update = {
          data: {
            vendedor: vendedor,
            user: Number(vendedorId),
            inativStatus: 3,
            ultima_compra: new Date().toISOString(),
            valor_ultima_compra: valor,
          },
        };
      } else if (inativStatus == 1 || inativStatus == 4) {
        update = {
          data: {
            vendedor: vendedor,
            user: Number(vendedorId),
            inativStatus: 4,
            ultima_compra: new Date().toISOString(),
            valor_ultima_compra: valor,
          },
        };
      } else if (inativStatus === 2 || inativStatus === 5) {
        // inativStatus === 4
        const update = {
          data: {
            ultima_compra: new Date().toISOString(),
            valor_ultima_compra: valor,
            penultima_compra: ultima_compra,
          },
        };

        await axios({
          method: "PUT",
          url: process.env.NEXT_PUBLIC_STRAPI_API_URL + "/empresas/" + id,
          data: update,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
          .then((Response) => {
            console.log("🚀 ~ file: index.ts:66 ~ .then ~ Response.data:", Response.data)
            res.status(200).json(Response.data);
          })
          .catch((err) => {
            return res.status(400).json({
              error: err.response.data,
              mensage: err.response.data.error,
              detalhe: err.response.data.error.details,
            });
          });
      }

      await axios({
        method: "PUT",
        url: process.env.NEXT_PUBLIC_STRAPI_API_URL + "/empresas/" + id,
        data: update,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((Response) => {
          return res.status(200).json(Response.data);
        })
        .catch((err) => {
          return res.status(400).json({
            error: err.response.data,
            mensage: err.response.data.error,
            detalhe: err.response.data.error.details,
          });
        });


    } catch (err: any) {
      res.status(400).json({
        error: err.response.data,
        mensage: err.response.data.error,
        detalhe: err.response.data.error.details,
      });
    }
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}
