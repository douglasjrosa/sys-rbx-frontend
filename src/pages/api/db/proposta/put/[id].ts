/* eslint-disable no-undef */
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { IncidentRecord } from "../../lib/businesses";
import { Historico } from "../../lib/historico";

export default async function PUTEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PUT") {
    // const data = JSON.parse(req.body);
    const data = req.body;

    const ID = req.query.id;
    const token = process.env.ATORIZZATION_TOKEN;
    const axiosRequet = axios.create({
      baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const fornecedorString: string = data.matriz;

    const getfornecdor = await axiosRequet.get(
      `/empresas?filters[CNPJ][$eq]=${fornecedorString}&fields[0]=id&fields[1]=nome`
    );
    const [retorno] = getfornecdor.data.data;
    const idFornecedor: number = retorno.id;

    const GetEmpresaCliente = await axiosRequet.get(`/empresas/${data.clienteId}?&fields[0]=id&fields[1]=nome`);
    const ClienteName = GetEmpresaCliente.data.data.attributes.nome

    const date = new Date().toLocaleString();

    const clienteId = data.clienteId;


    const DataPost = {
      data: {
        itens: data.itens,
        dataPedido: data.dataPedido,
        vencPedido: data.vencPedido,
        condi: data.condi,
        prazo: data.prazo,
        fornecedor: data.matriz,
        fornecedorId: idFornecedor,
        frete: data.frete,
        totalGeral: data.totalGeral,
        desconto: data.deconto,
        andamento: "Proposta Atualizada " + date,
        valorFrete: data.valorFrete,
        vencPrint: data.vencPrint,
        obs: data.obs,
        cliente_pedido: data.cliente_pedido
      },
    };

    const now = new Date();
    const VisibliDateTime =  new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
    const isoDateTime = now.toISOString();
    const txt = {
      date: isoDateTime,
      vendedors: data.vendedor,
      msg: `Proposta comercial de numero: ${data.nPedido}, do cliente ${ClienteName}, foi atualizada pelo vendedor ${data.vendedor} no dia ${VisibliDateTime}`,
    };
    const ItensPropsta = data.itens;
    const mapItens = ItensPropsta.map((i: any) => {
      const prod = i.nomeProd;
      const noldProd = i.modelo;
      const quant = i.Qtd;
      const text =
        i.expo === true && i.mont === false
          ? "este item, deve ser feito tratamento para exportação"
          : i.expo === false && i.mont === true
          ? "este item, deve ser enviado montado para cliente"
          : i.expo === true && i.mont === true
          ? "este item, deve ser enviado montado para cliente, e tambem feito o tratamento para exportação"
          : "";

      const resp = `✔️ produto: ${prod}  medelo: ${noldProd}  quant.: ${quant},${
        text !== "" ? ` observação: ${text},` : "\n"
      }\n`;
      return resp;
    });
    const txtOcorrencia = {
      date: isoDateTime,
      user: "Sistema",
      msg: `Proposta comercial de numero: ${data.nPedido}, do cliente ${ClienteName},\nfoi atualizada pelo vendedor ${data.vendedor} no dia ${VisibliDateTime},\nconteudo da proposta: \n\n${mapItens} \n\nObservaçoes gerais: \n\n ${data.obs}`,
    };

    await axiosRequet
      .put(`/pedidos/${ID}`, DataPost)
      .then(async (response) => {
        console.log(response.data);

        const url = `empresas/${clienteId}`;
        const Register = await Historico(txt, url);
        await IncidentRecord(txtOcorrencia, data.business);
        const url2 = `businesses/${data.business}`;
        await Historico(txt, url2);
        res.status(200).json({
          status: 200,
          message: `Proposta comercial de numero: ${data.nPedido}, do cliente ${ClienteName}, foi atualizada pelo vendedor ${data.vendedor} no dia ${VisibliDateTime}`,
          historico: Register,
        });
      })
      .catch(async (error) => {
        console.log(error);
        console.log(error.response.data.error.details.errors);

        const now = new Date();
        const isoDateTime = now.toISOString();
        const txt = {
          date: isoDateTime,
          vendedors: data.vendedor,
          msg: "Proposta não foi atualizada devido a erro",
          error: error.response,
          user: 'Sistema'
        };
        const url = `empresas/${clienteId}`;
        const Register = await Historico(txt, url);
        const url2 = `businesses/${data.business}`;
        await Historico(txt, url2);

        res.status(500).json({
          historico: Register,
          error: error.response,
          message: error.response,
        });
      });
  } else {
    return res.status(405).send({ message: "Only PUT requests are allowed" });
  }
}
