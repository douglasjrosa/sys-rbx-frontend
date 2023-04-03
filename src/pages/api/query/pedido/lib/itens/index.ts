import { PostPedido } from '../../request/bling/Postpedido';
import { UpDateItens } from '../../request/bling/UpDateItens';
import { GetItemsBling } from '../../request/bling/getItens';

export const VerifiqItems = async (data: any) => {
  const dataItens = data.attributes.itens;
  const pedido = data.attributes;
  const dataEmpresa = data.attributes.empresa.data;
  try {
    // const verifiBlingItens = await GetItemsBling(dataItens);
    // const Estoque = await UpDateItens(dataItens);
    const getPedido = await PostPedido(pedido);

    // console.log(verifiBlingItens);
    // const res = {
    //   retorno: [verifiBlingItens],
    //   estoque: [Estoque],
    // };

    return getPedido;
  } catch (error) {
    throw Object.assign(new Error(error.message), {
      status: error.status,
      erro: error.erro,
      detalhes: error.detalhes,
    });
  }
};
