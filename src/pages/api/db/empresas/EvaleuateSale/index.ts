// import axios from "axios";
// import { NextApiRequest, NextApiResponse } from "next";

// export default async function getId(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === "GET") {
//     const token = process.env.ATORIZZATION_TOKEN;
//     const { id, vendedor, vendedorId, valor } = req.query;
//     console.log("🚀 ~ file: index.ts:8 ~ getId ~ req.query:", req.query)
//     try {
//       const getEmpresa = await axios(
//         `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/empresas/${id}?populate=*`,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       const empresa = getEmpresa.data.data;
//       console.log("🚀 ~ file: index.ts:19 ~ getId ~ empresa:", empresa)

//       const inativStatus = empresa.attributes.inativStatus;
//       const ultima_compra = empresa.attributes.ultima_compra;

//       let update;

//       if (!inativStatus || inativStatus == 3) {
//         update = {
//           data: {
//             vendedor: vendedor,
//             user: Number(vendedorId),
//             inativStatus: 3,
//             ultima_compra: new Date().toISOString(),
//             valor_ultima_compra: valor,
//           },
//         };
//       } else if (inativStatus == 1 || inativStatus == 4) {
//         update = {
//           data: {
//             vendedor: vendedor,
//             user: Number(vendedorId),
//             inativStatus: 4,
//             ultima_compra: new Date().toISOString(),
//             valor_ultima_compra: valor,
//           },
//         };
//       } else if (inativStatus === 2 || inativStatus === 5) {
//         // inativStatus === 4
//         const update = {
//           data: {
//             ultima_compra: new Date().toISOString(),
//             valor_ultima_compra: valor,
//             penultima_compra: ultima_compra,
//           },
//         };

//         await axios({
//           method: "PUT",
//           url: process.env.NEXT_PUBLIC_STRAPI_API_URL + "/empresas/" + id,
//           data: update,
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         })
//           .then((Response) => {
//             res.status(200).json(Response.data);
//           })
//           .catch((err) => {
//             return res.status(400).json({
//               error: err.response.data,
//               mensage: err.response.data.error,
//               detalhe: err.response.data.error.details,
//             });
//           });
//       }

//       await axios({
//         method: "PUT",
//         url: process.env.NEXT_PUBLIC_STRAPI_API_URL + "/empresas/" + id,
//         data: update,
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       })
//         .then((Response) => {
//           return res.status(200).json(Response.data);
//         })
//         .catch((err) => {
//           return res.status(400).json({
//             error: err.response.data,
//             mensage: err.response.data.error,
//             detalhe: err.response.data.error.details,
//           });
//         });


//     } catch (err: any) {
//       console.log("🚀 ~ file: index.ts:99 ~ getId ~ err:", err)
//       res.status(400).json({
//         error: err.response?.data,
//         mensage: err.response?.data.error,
//         detalhe: err.response?.data.error?.details,
//       });
//       // res.status(400).json(err);
//     }
//   } else {
//     return res.status(405).send({ message: "Only GET requests are allowed" });
//   }
// }


import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function getId(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }

  const token = process.env.ATORIZZATION_TOKEN;
  const { id, vendedor, vendedorId, valor } = req.query;

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/empresas/${id}?populate=*`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const empresa = response.data.data;
    const inativStatus = empresa.attributes.inativStatus;
    const ultima_compra = empresa.attributes.ultima_compra;

    const update = {
      data: {
        vendedor,
        user: Number(vendedorId),
        inativStatus,
        ultima_compra: new Date().toISOString(),
        valor_ultima_compra: valor,
        penultima_compra: ultima_compra,
      },
    };

    if (!inativStatus || inativStatus == 3) {
      update.data.inativStatus = 3;
    } else if (inativStatus == 1 || inativStatus == 4) {
      update.data.inativStatus = 4;
    } else if (inativStatus === 2 || inativStatus === 5) {
      update.data.penultima_compra = ultima_compra;
    }

    if (inativStatus === 2 || inativStatus === 5) {
      await axios.put(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/empresas/${id}`,
        {
          data: {
            ultima_compra: update.data.ultima_compra,
            valor_ultima_compra: update.data.valor_ultima_compra,
            penultima_compra: ultima_compra,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    await axios.put(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/empresas/${id}`,
      update,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json(update.data);
    console.log("🚀 ~ file: index.ts:190 ~ getId ~ update.data:", update.data)
  } catch (err: any) {
    console.log("🚀 ~ file: index.ts:192 ~ getId ~ err:", err)
    const errorData = err.response?.data;
    const errorMessage = errorData?.error;
    const errorDetails = errorData?.error?.details;

    res.status(400).json({
      error: errorData,
      mensage: errorMessage,
      detalhe: errorDetails,
    });
  }
}
