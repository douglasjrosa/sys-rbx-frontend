/* eslint-disable no-undef */
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { Historico } from '../../lib/historico';

export default async function PostEmpresa(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const data = req.body;
    const token = process.env.ATORIZZATION_TOKEN;
    const axiosRequet = axios.create({
      baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const response = await axiosRequet.get(
      '/pedidos?fields[0]=id&fields[1]=nPedido&sort=id%3Adesc',
    );
    const [request] = response.data.data;
    const FalsePrimeiro = {
      nPedido: process.env.PEDIDO,
    };
    const primeiro =
      !request || request === undefined ? FalsePrimeiro : request.attributes;
    const { nPedido } = primeiro;

    const getfornecdor = await axiosRequet.get(
      `/fornecedores?filters[titulo][$containsi]=${data.empresa}&fields[0]=id&fields[1]=titulo`,
    );
    const [retorno] = getfornecdor.data.data;
    const idFornecedor = retorno.id;

    const getclinete = await axiosRequet.get(
      `/empresas?filters[titulo][$containsi]=${data.cliente}&fields[0]=id&fields[1]=titulo`,
    );
    const [retorno2] = getclinete.data.data;
    const idCliente = retorno2.id;
    const ClienteTitle = retorno2.attributes.titulo;

    const DataPost = {
      data: {
        nPedido: parseInt(nPedido) + 1,
        itens: data.itens,
        matriz: data.empresa,
        dataPedido: data.dataPedido,
        vencPedido: data.vencPedido,
        condi: data.condi,
        prazo: data.prazo,
        fornecedor: idFornecedor,
        fornecedorId: idFornecedor,
        frete: data.frete,
        empresa: idCliente,
        empresaId: idCliente,
        vendedor: data.vendedor,
        vendedorId: data.vendedorId,
        totalGeral: data.totalGeral,
      },
    };
    await axiosRequet
      .post(`/pedidos`, DataPost)
      .then(async (response) => {
        const now = new Date();
        const VisibliDateTime = `${
          now.getDate() < 10 ? '0' + now.getDate() : now.getDate()
        }/${
          now.getMonth() + 1 < 10
            ? '0' + (now.getMonth() + 1)
            : now.getMonth() + 1
        }/${now.getFullYear()}, as ${now.getHours()} H ${now.getMinutes()} mim ${
          now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds()
        } Seconds.`;
        const isoDateTime = now.toISOString();
        const txt = {
          date: isoDateTime,
          vendedors: data.vendedor,
          msg: 'Proposta criada',
        };
        const url = `empresas/${idCliente}`;
        const Register = await Historico(txt, url);
        res.status(200).json({
          status: 200,
          message: `Proposta comercial de numero: ${response.data.data.attributes.nPedido}, foi registrada para o cliente ${ClienteTitle} pelo vendedor ${data.vendedor} no dia ${VisibliDateTime}`,
          historico: Register,
        });
      })
      .catch(async (error) => {
        console.log(error.data);

        const now = new Date();
        const isoDateTime = now.toISOString();
        const txt = {
          date: isoDateTime,
          vendedors: data.vendedor,
          msg: 'Proposta não foi criada devido a erro',
          error: error.data,
        };
        const url = `empresas/${idCliente}`;
        const Register = await Historico(txt, url);

        res.json({
          historico: Register,
          error: error.data,
        });
      });
  } else {
    return res.status(405).send({ message: 'Only POST requests are allowed' });
  }
}
