import axios from "axios";

export const getData = async (pedidoId: any) => {
  const token = process.env.ATORIZZATION_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;

  const idStr = Array.isArray(pedidoId) ? pedidoId[0] : String(pedidoId ?? "");

  const fetchById = async (publicationState: string) => {
    try {
      const url = `${baseUrl}/pedidos/${idStr}?populate=*&publicationState=${publicationState}`;
      const res = await axios({
        method: "GET",
        url,
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data?.data ? { id: res.data.data.id, attributes: res.data.data.attributes } : null;
    } catch {
      return null;
    }
  };

  const DATA_ENTREGA_FIXO = "7 dias após oficialização do pedido.";

  try {
    let result = await fetchById("preview");
    if (!result?.attributes) {
      result = await fetchById("live");
    }
    if (!result?.attributes) {
      return null;
    }
    const inf = result.attributes;
    const Vendedor = inf.user.data.attributes.username
    const empresaFornec = inf.fornecedorId.data.attributes;
    const dataEntrega = DATA_ENTREGA_FIXO

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
    const propostaId = result.id;
    const frete = inf.frete;
    const Valfrete = inf.valorFrete;
    const datePop = inf.dataPedido;
    const fornecedor = dadosFornecedor;
    const cliente = inf.empresa.data.attributes;
    const condi = inf.condi;
    const Desconto_Converte =!inf.desconto? null : parseFloat(inf.desconto.replace('.', '').replace(',', '.'));
    const Desconto = !Desconto_Converte? 0 : Desconto_Converte;
    const DescontoAdd_Converte =!inf.descontoAdd? null : parseFloat(inf.descontoAdd.replace('.', '').replace(',', '.'))

    const DescontoAdd = !DescontoAdd_Converte? 0 : DescontoAdd_Converte
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

    const custoAdicional = inf.custoAdicional ?? "";
    const data = {
      propostaId,
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
      Desconto,
      DescontoAdd,
      dataEntrega,
      custoAdicional
    };
    return data;
  } catch (error) {
    throw error;
  }
};
