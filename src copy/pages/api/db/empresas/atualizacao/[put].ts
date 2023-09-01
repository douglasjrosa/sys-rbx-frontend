/* eslint-disable no-undef */
import { LogEmpresa } from "@/pages/api/lib/logEmpresa";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";


export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PUT") {
    const id = req.query.put;
    const token = process.env.ATORIZZATION_TOKEN;
    const data = req.body;
    const cnpj = data.data.CNPJ;
    const bodyData = data.data;
    const { Email } = req.query;
    const USER: any = req.query.Vendedor;

    await axios({
      method: 'GET',
      url:
        process.env.NEXT_PUBLIC_STRAPI_API_URL +
        `/empresas/${id}?&populate=%2A`,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(async (Response) => {
        // res.status(200).json(Response.data);
        console.log(Response.data);
        await LogEmpresa(Response.data.data.attributes.nome, Response.data.data, "PUT", USER);
      })
      .catch((err) => {
        console.log("🚀 ~ file: [id].ts:27 ~ err:", err)
        console.log({
          error: err.response?.data,
          mensage: err.response?.data.error,
          detalhe: err.response?.data.error?.details,
        });
      });



    await axios({
      method: "PUT",
      url: process.env.NEXT_PUBLIC_STRAPI_API_URL + "/empresas/" + id,
      data: data,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((Response) => {
        res.status(200).json(Response.data);

      })
      .catch((err) => {
        res.status(400).json({
          error: err.response.data,
          mensage: err.response.data.error,
          detalhe: err.response.data.error.details,
        });
      });

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
    if (bodyData.status === false) {

      let dataExclud ={
        'CNPJ': bodyData.CNPJ
      };

      await axios({
        method: "DELET",
        url: process.env.RIBERMAX_API_URL + "/empresas",
        headers: {
          Email: Email,
          Token: process.env.ATORIZZATION_TOKEN_RIBERMAX,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: new URLSearchParams(dataExclud).toString(),
      })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.log(error.response.data);
        });
    } else {
      await axios({
        method: "put",
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
    }
  } else {
    return res.status(405).send({ message: "Only GET requests are allowed" });
  }
}

