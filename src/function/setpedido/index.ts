import axios from "axios";

export const pedido = async (nPedido: string, empresaId: any, ValorVenda: string, Vendedor: string | undefined, vendedorId: number | undefined, negocioId: string) => {
  console.log({
    nPedido: nPedido, empresaId: empresaId, ValorVenda: ValorVenda, Vendedor: Vendedor, vendedorId: vendedorId, negocioId: negocioId
  })
  try {
    await axios({
      url: `/api/db/nLote/${nPedido}`,
      method: "POST",
    });

    const response1 = await axios({
      url: "/api/query/pedido/" + nPedido,
      method: "POST",
    });

    console.log(response1.data);

    const tackle = await axios(`/api/db/empresas/tackle?Vendedor=${Vendedor}&EMPRESAID=${empresaId}`);
    console.log(tackle.data);

    await axios({
      url: `/api/db/trello/${nPedido}`,
      method: "POST",
    });

    const response2 = await axios(`/api/db/empresas/EvaleuateSale?id=${empresaId}&vendedor=${Vendedor}&vendedorId=${vendedorId}&valor=${ValorVenda}`);
    console.log(response2.data);

    const requeste = await axios(`/api/db/proposta/get/business/${negocioId}`);
    const resp = requeste.data;

    return {
      response1: response1.data,
      response2: response2.data,
      resp: resp
    };
  } catch (error: any) {
    console.log(error.response.data.message);
    console.log(error);

    if (error.response.data.message) {
      await axios({
        url: `/api/db/trello/${nPedido}`,
        method: "POST",
      });

      const response = await axios(`/api/db/empresas/EvaleuateSale?id=${empresaId}&vendedor=${Vendedor}&vendedorId=${vendedorId}&valor=${ValorVenda}`);
      console.log(response.data);

      return {
        error: error.response.data.message,
        response: response.data
      };
    } else {
      return { error: null };
    }
  }
};
