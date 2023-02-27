/* eslint-disable no-undef */
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { IncidentRecord } from '../../lib/businesses';
import { Historico } from '../../lib/historico';

export default async function PUTEmpresa(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'PUT') {
    // const data = JSON.parse(req.body);
    const data = req.body;
    const ID = req.query.id;
    const token = process.env.ATORIZZATION_TOKEN;
    const axiosRequet = axios.create({
      baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const fornecedorString: string = data.matriz;
    // console.log(data);

    const getfornecdor = await axiosRequet.get(
      `/fornecedores?filters[titulo][$containsi]=${fornecedorString}&fields[0]=id&fields[1]=titulo`,
    );
    const [retorno] = getfornecdor.data.data;
    const idFornecedor: number = retorno.id;

    const DataPost = {
      data: {
        itens: data.itens,
        matriz: data.matriz,
        dataPedido: data.dataPedido,
        vencPedido: data.vencPedido,
        condi: data.condi,
        prazo: data.prazo,
        fornecedor: idFornecedor,
        fornecedorId: idFornecedor,
        frete: data.frete,
        totalGeral: data.totalGeral,
        desconto: data.desconto,
        andamento: 'Proposta Atualizada',
        valorFrete: data.valorFrete,
        vencPrint: data.vencPrint,
        business: data.business,
        obs: data.obs,
      },
    };
    console.log(DataPost.data.itens);
    await axiosRequet
      .put(`/pedidos/` + ID, DataPost)
      .then(async (response) => {
        console.log(response.data);
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
          msg: `Proposta comercial de numero: ${data.nPedido}, do cliente ${data.empresa.attributes.nome}, foi atualizada pelo vendedor ${data.vendedor} no dia ${VisibliDateTime}`,
        };
        const ItensPropsta = data.itens;
        const mapItens = ItensPropsta.map((i: any) => {
          const prod = i.nomeProd;
          const noldProd = i.modelo;
          const quant = i.Qtd;
          const text =
            i.expo === true && i.mont === false
              ? 'este item, deve ser feito tratamento para exportação'
              : i.expo === false && i.mont === true
              ? 'este item, deve ser enviado montado para cliente'
              : i.expo === true && i.mont === true
              ? 'este item, deve ser enviado montado para cliente, e tambem feito o tratamento para exportação'
              : '';

          const resp = `✔️ produto: ${prod}  medelo: ${noldProd}  quant.: ${quant}${
            text !== '' ? ` observação: ${text}` : ''
          }\n `;
          return resp;
        });
        const txtOcorrencia = {
          date: isoDateTime,
          vendedors: data.vendedor,
          msg: `Proposta comercial de numero: ${data.nPedido}, do cliente ${data.empresa.attributes.nome}, foi atualizada pelo vendedor ${data.vendedor} no dia ${VisibliDateTime},\n conteudo da proposta: \n\n ${mapItens} \n\n Observaçoes gerais: \n\n ${data.obs}`,
        };

        const url = `empresas/${data.empresa.id}`;
        const Register = await Historico(txt, url);
        await IncidentRecord(txtOcorrencia, data.business);
        const url2 = `businesses/${data.business}`;
        await Historico(txt, url2);
        res.status(200).json({
          status: 200,
          message: `Proposta comercial de numero: ${data.nPedido}, do cliente ${data.empresa.attributes.nome}, foi atualizada pelo vendedor ${data.vendedor} no dia ${VisibliDateTime}`,
          historico: Register,
        });
      })
      .catch(async (error) => {
        console.log(error.response);
        // console.log(error.response.data.error);
        // console.log(error.response.data.error.details);
        // console.log(error.response.data.error.details.errors);

        const now = new Date();
        const isoDateTime = now.toISOString();
        const txt = {
          date: isoDateTime,
          vendedors: data.vendedor,
          msg: 'Proposta não foi atualizada devido a erro',
          error: error.response,
        };
        const url = `empresas/${data.empresa.id}`;
        const Register = await Historico(txt, url);
        const url2 = `businesses/${data.business}`;
        await Historico(txt, url2);

        res.status(500).json({
          historico: Register,
          error: error.response.data,
          message: error.response.data,
        });
      });
  } else {
    return res.status(405).send({ message: 'Only PUT requests are allowed' });
  }
}
