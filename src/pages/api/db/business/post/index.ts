/* eslint-disable no-undef */
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { Historico } from "../../lib/historico";
import { RegCompra } from "../../lib/empresa_reg_compra";

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const token = process.env.ATORIZZATION_TOKEN;
    const data = req.body;

    const axiosRequet = axios.create({
      baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const consulta = await axiosRequet.get(
      "/businesses?fields[0]=id&fields[1]=nBusiness&sort=id%3Adesc"
    );
    const [respostaConsulta] = !consulta.data.data ? null : consulta.data.data;
    const resposta =
      respostaConsulta === null
        ? "001"
        : respostaConsulta === undefined
        ? "001"
        : respostaConsulta.attributes.nBusiness;
    const dateNow = new Date();
    const anoVigente = dateNow.getFullYear();
    const resto = resposta.toString().replace(anoVigente, "");
    const restoInt = parseInt(resto) + 1;
    const newResto =
      restoInt < 10
        ? "000" + restoInt
        : restoInt > 99
        ? "00" + restoInt
        : restoInt > 999
        ? "0" + restoInt
        : restoInt;
    const newNuber = anoVigente.toString() + newResto;
    const newBusinesses = Number(newNuber);

    const nBusiness = !respostaConsulta
      ? Number(anoVigente + "000" + 1)
      : newBusinesses;

    const getVendedor = await axiosRequet.get("/users/" + data.vendedor);
    const respVendedor = getVendedor.data.username;

    const getCliente = await axiosRequet.get("/empresas/" + data.empresa);
    const respCliente = getCliente.data.data.attributes.nome;

    const dataAtualizado = {
      data: {
        status: true,
        statusAnd: "Ativo",
        DataRetorno: data.DataRetorno,
        nBusiness: nBusiness.toString(),
        Budget: data.Budget,
        Approach: data.Approach,
        history: [data.history],
        incidentRecord: data.incidentRecord,
        empresa: Number(data.empresa),
        vendedor: data.vendedor,
        andamento: 3,
        etapa: 2,
      },
    };

    await axiosRequet
      .post(`/businesses`, dataAtualizado)
      .then(async (response) => {
        console.log(response.data);
        const isoDateTime = new Date().toISOString();
        const VisibliDateTime = new Date().toISOString();
        await RegCompra(Number(data.empresa), data.Budget)

        const txt = {
          date: isoDateTime,
          vendedor: data.vendedor,
          msg: `Business numero: ${nBusiness}, foi criado pelo vendedor ${respVendedor} para o cliente ${respCliente} no dia ${VisibliDateTime}`,
        };
        const url = `empresas/${data.empresa}`;
        const Register = await Historico(txt, url);

        res.status(200).json({
          status: 200,
          nBusiness: response.data.data.id,
          message: `Business numero: ${nBusiness}, foi criado pelo vendedor ${respVendedor} para o cliente ${respCliente} no dia ${VisibliDateTime}`,
          historico: Register,
        });
      })
      .catch(async (error) => {
        console.log("🚀 ~ file: index.ts:95 ~ error:", error.response.data);
        // console.log(error.response);
        const isoDateTime = new Date().toISOString();

        const txt = {
          date: isoDateTime,
          vendedor: data.vendedor,
          msg: "Proposta não foi criada devido a erro",
          error: error.response,
        };
        const url = `empresas/${data.empresa}`;
        const Register = await Historico(txt, url);

        res.status(500).json({
          historico: Register,
          error: error.response,
          message: error.response,
        });
      });
  } else {
    return res.status(405).send({ message: "Only POST requests are allowed" });
  }
}
