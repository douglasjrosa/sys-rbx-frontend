/* eslint-disable no-undef */
import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

const token = process.env.ATORIZZATION_TOKEN;
const STRAPI = axios.create({
  baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

export default async function GetEmpresa(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {

    const data



  } else {
    return res.status(405).send({ message: 'Only POST requests are allowed' });
  }
}





export const SaveTrello = async (Npedido: any) => {



  const type = items.mont === true && items.expo === false ? 'MONT': items.mont === false && items.expo === true ? 'EXP': 'EXP & MONT';

  const nomeCard = `${cliente} - ${items.Qtd}cx - ${items.titulo} - Medidas ${items.comprimento} x ${items.largura} x ${items.altura} - peso ${}(kg) - ${type} - ${nlote}`;

  //Membros
const trelloMembers = [
  '5fd10678fbc6b504679737d4', /*Daniela*/
  '62a736038685171186013ba4', /*Expedição*/
  '5ff74138721978652e0293bb', /*Jesuila*/
  '63e13cb526cca27c0d30f648', /*Edna*/
  '63e13887ef5b25eea224493e', /*Luciana*/
  '5d7bbf629972e80b374829bb', /*Fábrica*/
]

  var dataBoard = {
  'key': '7f3afdbb72cb272f2ef99089cd9066c8',
  'token': 'ad565886cde4f9d1466040864b94a879d2281ec2f83c43d9cf0d74dbd752509d',
  'idList': '5fac446c22f5d05364052362',
  'boardId': '5fac445b3c5274707a309d61',
  'name': nomeCard , //Colocar as informações na seguinte sequência: Nome do cliente - Qtd. de caixas - Nome da caixa - Medidas internas  - Peso (kg) - SE exportação = EXP - SE montada = MONT - Numero do lote
  'desc': 'Proposta: Nº. '+ Npedido +'\n'+
  'Vendedor(a): '+ NOME DO VENDEDOR +'\n'+
  'Empresa: '+ EMPRESA DO GRUPO MAX BRASIL QUE FEZ A VENDA +'\n'+
  'Tipo de frete: '+ CIF OU FOB +'\n'+
  'Pedido: Nº. '+ NUMERO DO PEDIDO DO CLIENTE +'\n'+
  'Lote: Nº. '+ NUMERO DO LOTE +'\n'+
  'Forma de pagamento: '+ FORMA DE PAGAMENTO +'\n'+
  'Modelo:'+ MODELO DA CAIXA,
  'idMembers': trelloMembers,
  'due': DATA DE ENTREGA,
  'dueReminder':2880,
  'pos':'top'
  }

  var enviarCard = {
  'method' : 'post',
  'contentType': 'application/json',
  'payload' : JSON.stringify(dataBoard)
  }

  await.fetch('https://api.trello.com/1/cards', enviarCard)
}
