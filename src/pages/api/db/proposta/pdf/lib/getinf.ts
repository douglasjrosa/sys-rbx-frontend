import axios from "axios";

export const getData = async (proposta: any) => {
  const token = process.env.ATORIZZATION_TOKEN;
  const url = `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/pedidos?populate=*&filters[nPedido][$eq]=${proposta}`;

  const config = {
    method: "GET",
    url,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    const response = await axios(config);
    const result = response.data?.data?.[0];
    const inf = result.attributes;
    console.log("🚀 ~ file: getinf.ts:19 ~ getData ~ inf:", inf)
    const Vendedor = inf.user.data.attributes.username
    const empresaFornec = inf.fornecedorId.data.attributes;

    const dadosFornecedor = {
      data: {
        razao: empresaFornec?.nome,
        fantasia: empresaFornec?.fantasia,
        cnpj: empresaFornec?.CNPJ.replace(
          /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
          "$1.$2.$3/$4-$5"
        ),
        endereco: empresaFornec?.endereco + ', ' + empresaFornec?.numero,
        cidade: "Riberão Preto",
        uf: "Sp",
        tel: "(16) 9 9765-5543",
        email: empresaFornec?.email,
      },
    };
    const nPedido = inf.nPedido;
    const frete = inf.frete;
    const Valfrete = inf.valorFrete;
    const datePop = inf.dataPedido;
    const fornecedor = dadosFornecedor;
    const cliente = inf.empresa.data.attributes;
    const condi = inf.condi;
    const Desconto = inf.desconto
    const itens = inf.itens;
    const prazo = inf.prazo === null ? "" : inf.prazo;
    const venc = inf.vencPrint;
    const totoalGeral = inf.totalGeral;
    const obs = inf.obs === null ? "" : inf.obs;
    const business = !inf.business.data
      ? ""
      : inf.business.data.id === null
      ? ""
      : inf.business.data.id;

    const pagina = Math.ceil(itens.length  / 6)



    const cliente_pedido = inf.cliente_pedido;

    const data = {
      nPedido,
      frete,
      Valfrete,
      datePop,
      fornecedor,
      cliente,
      itens,
      condi,
      prazo,
      venc,
      totoalGeral,
      obs,
      business,
      Vendedor,
      cliente_pedido,
      Desconto
    };
    return data;
  } catch (error) {
    console.error("🚀 ~ file: getinf.ts:23 ~ getData ~ error:", error);
    throw error;
  }
};
