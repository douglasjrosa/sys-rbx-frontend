/* eslint-disable no-undef */
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { GetPedido } from "../../query/pedido/request/db/get";

interface TrelloCard {
  key: string;
  token: string;
  idList: string;
  boardId: string;
  name: string;
  desc: string;
  idMembers: string[];
  due: string;
  dueReminder: number;
  pos: string;
}

const token = process.env.ATORIZZATION_TOKEN;
const STRAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

export default async function PostTrello(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { numero } = req.query;

    const [pedido] = await GetPedido(numero);
    console.log(pedido.attributes.business.data);

    const items = pedido.attributes.itens;
    const empresa = pedido.attributes.empresa.data.id;
    const cliente = pedido.attributes.empresa.data.attributes.nome;
    const negocio = pedido.attributes.business.data.attributes.nBusiness;
    const fornecedor = pedido.attributes.fornecedorId.data.attributes.name;
    const vendedor = pedido.attributes.vendedorId;
    const frete =
      pedido.attributes.frete === "" ? "Fob" : pedido.attributes.frete;
    const pgto = pedido.attributes.condi;
    const Bpedido = pedido.attributes.Bpedido;
    const estrega = pedido.attributes.business.data.attributes.deadline;

    const VendedorName = pedido.attributes.user.data.attributes.username;
    const fornecedorName = pedido.attributes.fornecedorId.data.attributes.name;

    await items.map(async (i: any) => {
      const nlote = "";
      const type =
        i.mont === true && i.expo === false
          ? "MONT"
          : i.mont === false && i.expo === true
          ? "EXP"
          : "EXP - MONT";

      const nomeCard = `${cliente} - ${i.Qtd} - ${i.titulo} - Medidas ${i.comprimento} x ${i.largura} x ${i.altura} - peso ${i.pesoCx}(kg) - ${type} - ${nlote}`;

      //Membros
      const trelloMembers: string[] = [
        "5fd10678fbc6b504679737d4" /*Daniela*/,
        "62a736038685171186013ba4" /*Expedição*/,
        "5ff74138721978652e0293bb" /*Jesuila*/,
        "63e13cb526cca27c0d30f648" /*Edna*/,
        "63e13887ef5b25eea224493e" /*Luciana*/,
        "5d7bbf629972e80b374829bb" /*Fábrica*/,
      ];

      const dataBoard = JSON.stringify({
        key: "7f3afdbb72cb272f2ef99089cd9066c8",
        token:
          "ad565886cde4f9d1466040864b94a879d2281ec2f83c43d9cf0d74dbd752509d",
        // idList: "5fac446c22f5d05364052362",
        idList: "6438073ecc85f294325f74ac", //board teste
        // idList: "6438073ecc85f294325f74", //board testeerr
        boardId: "5fac445b3c5274707a309d61",
        name: nomeCard,
        desc: `Negocio: Nº. ${negocio},
        Vendedor(a): ${VendedorName},
        Empresa: ${fornecedorName},
        Tipo de frete: ${frete},
        Bling: Nº. ${Bpedido},
        Pedido: Nº. ,
        Lote: Nº. ${nlote},
        Forma de pagamento: ${pgto},
        Modelo: ${i.titulo}

        OBS: é um teste`,
        idMembers: trelloMembers,
        due: estrega,
        dueReminder: 2880,
        pos: "top",
      });

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.trello.com/1/cards',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': 'preAuthProps=s%3A5d7b946bb2d92e57d8d07e4d%3AisEnterpriseAdmin%3Dfalse.xktum%2BounyUl8SGrzLx%2BKGezb8C94Hysn%2FNSdI77YcY'
        },
        data : dataBoard
      };

      try {
        const response = await axios.request(config);
        console.log(JSON.stringify(response.data));
      }
      catch (error) {
        console.log(error);
      }

    });
  } else {
    return res.status(405).send({ message: "Only POST requests are allowed" });
  }
}
