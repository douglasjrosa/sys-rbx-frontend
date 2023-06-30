import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PUT") {
    const token = process.env.ATORIZZATION_TOKEN;
    const id = req.query.id;
    const data = req.body;
    // await axios
    //   .put(
    //     `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/users/${id}`,
    //     {
    //       data: data,
    //       headers: {
    //         Authorization: `Bearer ${token}`,
    //         "Content-Type": "application/json",
    //       },
    //     }
    //   )
    //   .then((response) => {
    //     res.status(200).json(response.data);
    //     console.log("🚀 ~ file: [id].ts:25 ~ .then ~ response.data:", response.data)
    //   })
    //   .catch((error) => {
    //     console.log("🚀 ~ file: [id].ts:27 ~ error:", error)
    //     res.status(500).json(error);
    //   });
    if (data.data.password) {
      const reset = {
        password: data.data.password,
        currentPassword: data.data.passwordAtual,
        passwordConfirmation: data.data.password,
      };

      await axios(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/auth/change-password`,
        {
          method: "POST",
          data: {
            password: data.data.password,
            currentPassword: data.data.passwordAtual,
            passwordConfirmation: data.data.password,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => {
          res.status(200).json(response.data);
          console.log(
            "🚀 ~ file: [id].ts:49 ~ .then ~ response.data:",
            response.data
          );
        })
        .catch((error) => {
          res.status(500).json(error);
          console.log("🚀 ~ file: [id].ts:53 ~ error:", error.response);
        });
    }
  } else {
    res.status(405).json({ message: "Only PUT requests are allowed" });
  }
}
