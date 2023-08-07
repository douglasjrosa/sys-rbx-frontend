/* eslint-disable no-undef */
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function PostEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const data = req.body;
    const token = process.env.ATORIZZATION_TOKEN;
    const bodyData = data.data;
    const { Email } = req.query;

    await axios({
      method: "POST",
      url: process.env.NEXT_PUBLIC_STRAPI_API_URL + "/empresas",
      data: data,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then(async (Response) => {
        console.log(Response.data);

        const DataRbx = {
          nome: bodyData.nome,
          email: bodyData.email,
          xNome: bodyData.fantasia,
          CNPJ: bodyData.CNPJ,
          IE: bodyData.Ie,
          IM: "",
          fone: bodyData.cidade,
          indIEDest: "",
          CNAE: bodyData.CNAE,
          xLgr: bodyData.endereco,
          nro: bodyData.numero,
          xCpl: bodyData.complemento,
          cMun: "",
          cPais: bodyData.codpais,
          xPais: bodyData.pais,
          xBairro: bodyData.bairro,
          CEP: bodyData.cep,
          xMun: bodyData.cidade,
          UF: bodyData.uf,
          ativo: bodyData.status !== true ? "" : "1",
          tabela: bodyData.tablecalc,
          ultima_compra: "",
          LatAdFrSN: bodyData.adFrailLat === true ? "on" : "off",
          CabAdFrSN: bodyData.adFrailCab === true ? "on" : "off",
          LatAdExSN: bodyData.adEspecialLat === true ? "on" : "off",
          CabAdExSN: bodyData.adEspecialCab === true ? "on" : "off",
          LatForaSN: bodyData.latFCab === true ? "on" : "off",
          CabChaoSN: bodyData.cabChao === true ? "on" : "off",
          CabTopoSN: bodyData.cabTop === true ? "on" : "off",
          caixa_economica: bodyData.cxEco === true ? "on" : "off",
          caixa_estruturada: bodyData.cxEst === true ? "on" : "off",
          caixa_leve: bodyData.cxLev === true ? "on" : "off",
          caixa_reforcada: bodyData.cxRef === true ? "on" : "off",
          caixa_resistente: bodyData.cxResi === true ? "on" : "off",
          caixa_super_reforcada: bodyData.cxSupRef === true ? "on" : "off",
          engradado_economico: bodyData.engEco === true ? "on" : "off",
          engradado_leve: bodyData.engLev === true ? "on" : "off",
          engradado_reforcado: bodyData.engRef === true ? "on" : "off",
          engradado_resistente: bodyData.engResi === true ? "on" : "off",
          palete_sob_medida: bodyData.platSMed === true ? "on" : "off",
          modelo_especial: bodyData.modEsp === true ? "on" : "off",
          formaPagto: bodyData.forpg,
          prefPagto: bodyData.maxPg,
          frete: bodyData.frete === "" ? "fob" : bodyData.frete,
        };

        await axios({
          method: "post",
          url: process.env.RIBERMAX_API_URL + "/empresas",
          headers: {
            Email: Email,
            Token: process.env.ATORIZZATION_TOKEN_RIBERMAX,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          data: new URLSearchParams(DataRbx).toString(),
        })
          .then((response) => {
            console.log(response.data);
          })
          .catch((error) => {
            console.log(error.response.data);
          });
        res.status(200).json(Response.data);
      })
      .catch((err) => {
        console.log(err.response.data);
        console.log(err.response.data.error);
        console.log(err.response.data.error.details);
        res.status(400).json({
          error: err.response.data,
          mensage: err.response.data.error,
          detalhe: err.response.data.error.details,
        });
      });
  } else {
    return res.status(405).send({ message: "Only POST requests are allowed" });
  }
}
