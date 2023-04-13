/* eslint-disable no-undef */
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { Historico } from "../../lib/historico";
import { Populate } from "./populate";

export default async function PostEmpresa(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    // const data = JSON.parse(req.body);
    const data = req.body;
    const token = process.env.ATORIZZATION_TOKEN;
    const axiosRequet = axios.create({
      baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const response = await axiosRequet.get(
      "/pedidos?filters[nPedido][$notIn]=null&fields[0]=id&fields[1]=nPedido&sort=id%3Adesc"
    );
    const [request] = response.data.data;
    const primeiro =
      !request || request === undefined
        ? process.env.PEDIDO
        : request.attributes.nPedido;
    const nPedido = primeiro;

    const getclinete = await axiosRequet.get(
      `/empresas?filters[titulo][$containsi]=${data.cliente}&fields[0]=id&fields[1]=titulo`
    );
    const getclinete2 = await axiosRequet.get(
      `/empresas?filters[CNPJ][$containsi]=${data.cliente}&fields[0]=id&fields[1]=titulo`
    );
    const retorno2 = getclinete.data.data;
    const retornoclinete2 = getclinete2.data.data;

    const dadosfornecedores = {
      vendedor: data.vendedor,
      vendedorId: data.vendedorId,
      fornecedor: data.empresa,
    };

    const retornoCliente = [
      {
        id: "",
        attributes: { titulo: "" },
      },
    ];

    const identfi =
      retorno2.length !== 0
        ? getclinete.data.data
        : retornoclinete2.length !== 0
        ? getclinete2.data.data
        : await Populate(data.cliente, dadosfornecedores);

    const [retor] = identfi;
    const idCliente = retor.id;
    const ClienteTitle = retor.attributes.titulo;
    const pedidonomero = parseInt(nPedido) + 1;
    const NpedidoConvert = pedidonomero.toString();

    const fornecedorString: string = data.empresa;
    // console.log(data);

    const getfornecdor = await axiosRequet.get(
      `/empresas?filters[CNPJ][$containsi]=${fornecedorString}&fields[0]=id&fields[1]=titulo`
    );
    const [retorno] = getfornecdor.data.data;
    const idFornecedor: number = retorno.id;

    const date = new Date().toLocaleString;


    const DataPost = {
      data: {
        nPedido: NpedidoConvert,
        itens: data.itens,
        dataPedido: data.dataPedido,
        vencPedido: data.vencPedido,
        condi: data.condi,
        prazo: data.prazo,
        fornecedor: data.empresa,
        fornecedorId: idFornecedor,
        frete: data.frete,
        empresa: idCliente,
        empresaId: idCliente,
        vendedor: data.vendedor,
        user: data.vendedorId,
        totalGeral: data.totalGeral,
        desconto: data.deconto,
        CNPJClinet: data.cliente,
        status: true,
        andamento: "Proposta criada " + date,
        valorFrete: data.valorFrete.toString(),
        vencPrint: data.vencPrint,
        business: data.business,
        businessId: data.business,
        obs: data.obs,
      },
    };
    // console.log(DataPost);
    await axiosRequet
      .post(`/pedidos`, DataPost)
      .then(async (response) => {
        console.log(response.data);
        const now = new Date();
        const VisibliDateTime = `${
          now.getDate() < 10 ? "0" + now.getDate() : now.getDate()
        }/${
          now.getMonth() + 1 < 10
            ? "0" + (now.getMonth() + 1)
            : now.getMonth() + 1
        }/${now.getFullYear()}, as ${now.getHours()} H ${now.getMinutes()} mim ${
          now.getSeconds() < 10 ? "0" + now.getSeconds() : now.getSeconds()
        } Seconds.`;

        const isoDateTime = now.toISOString();
        const txt = {
          date: isoDateTime,
          vendedors: data.vendedor,
          msg: `Proposta comercial de numero: ${response.data.data.attributes.nPedido}, foi registrada para o cliente ${ClienteTitle} pelo vendedor ${data.vendedor} no dia ${VisibliDateTime}`,
        };

        const url = `empresas/${idCliente}`;
        const Register = await Historico(txt, url);
        const url2 = `businesses/${data.business}`;
        await Historico(txt, url2);

        res.status(200).json({
          status: 200,
          message: `Proposta comercial de numero: ${response.data.data.attributes.nPedido}, foi registrada para o cliente ${ClienteTitle} pelo vendedor ${data.vendedor} no dia ${VisibliDateTime}`,
          historico: Register,
        });
      })
      .catch(async (error) => {
        console.log(error.response.data);
        console.log(error.response.data.error.details.errors);

        const now = new Date();
        const isoDateTime = now.toISOString();
        const txt = {
          date: isoDateTime,
          vendedors: data.vendedor,
          msg: "Proposta não foi criada devido a erro",
          error: error.response.data,
          user: 'Sistema'
        };
        const url = `empresas/${idCliente}`;
        const Register = await Historico(txt, url);

        res.status(500).json({
          historico: Register,
          error: error.response.data,
          message: error.response.data,
        });
      });
  } else {
    return res.status(405).send({ message: "Only POST requests are allowed" });
  }
}
