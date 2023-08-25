import axios from "axios";

const fetchTackle = async (Vendedor: string | undefined, empresaId: any) => {
  return axios(`/api/db/empresas/tackle?Vendedor=${Vendedor}&EMPRESAID=${empresaId}`);
};

const postNLote = async (nPedido: string) => {
  return axios.post(`/api/db/nLote/${nPedido}`);
};

const fetchPedidoData = async (nPedido: string) => {
  return axios.post("/api/query/pedido/" + nPedido);
};

const postTrello = async (nPedido: string) => {
  return axios.post(`/api/db/trello/${nPedido}`);
};

const evaluateSale = async (empresaId: any, Vendedor: string | undefined, vendedorId: number | undefined, ValorVenda: string) => {
  return axios(`/api/db/empresas/EvaleuateSale?id=${empresaId}&vendedor=${Vendedor}&vendedorId=${vendedorId}&valor=${ValorVenda}`);
};

const fetchPropostaData = async (negocioId: string) => {
  return axios(`/api/db/proposta/get/business/${negocioId}`);
};

export const pedido = async (nPedido: string, empresaId: any, ValorVenda: string, Vendedor: string | undefined, vendedorId: number | undefined, negocioId: string) => {
  try {
    console.log({
      nPedido,
      empresaId,
      ValorVenda,
      Vendedor,
      vendedorId,
      negocioId
    });

    const [tackle, response1] = await Promise.all([
      fetchTackle(Vendedor, empresaId),
      postNLote(nPedido),
      fetchPedidoData(nPedido)
    ]);

    console.log(tackle.data);
    console.log(response1.data);

    await postTrello(nPedido);

    const response2 = await evaluateSale(empresaId, Vendedor, vendedorId, ValorVenda);
    console.log(response2.data);

    const resp = await fetchPropostaData(negocioId);

    const tackle2 = await fetchTackle(Vendedor, empresaId);
    console.log(tackle2.data);

    return {
      response1: response1.data,
      response2: response2.data,
      resp: resp.data
    };
  } catch (error: any) {
    console.log(error.response?.data.message || error);

    if (error.response?.data.message) {
      try {
        await postTrello(nPedido);
        const response = await evaluateSale(empresaId, Vendedor, vendedorId, ValorVenda);
        console.log(response.data);

        return {
          error: error.response.data.message,
          response: response.data
        };
      } catch (innerError) {
        console.log(innerError);
      }
    } else {
      return { error: null };
    }
  }
};
