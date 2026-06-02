import axios from "axios";
import { normalizeCnpj } from "@/utils/blingOAuth";

const DATA_ENTREGA_FIXO = "7 dias após oficialização do pedido.";

const PEDIDO_POPULATE =
  "populate[fornecedorId]=*&populate[empresa]=*&populate[user]=*"
  + "&populate[business]=*";

type PedidoResult = {
  id: number;
  attributes: Record<string, any>;
};

const formatCnpj = (cnpj: string): string => {
  const digits = normalizeCnpj(cnpj);
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
};

const buildEndereco = (empresa: Record<string, any>): string => {
  const endereco = empresa?.endereco ?? "";
  const numero = empresa?.numero ?? "";
  if (!endereco) return "";
  return numero ? `${endereco}, ${numero}` : endereco;
};

const pickLatestPedido = (
  live: PedidoResult | null,
  preview: PedidoResult | null
): PedidoResult | null => {
  if (live?.attributes) return live;
  return preview;
};

const resolveEmitenteAttributes = (
  inf: Record<string, any>
): Record<string, any> | null => {
  return inf.fornecedorId?.data?.attributes ?? null;
};

const buildFornecedorData = (empresa: Record<string, any>) => ({
  data: {
    razao: empresa.razao || empresa.nome || "",
    fantasia: empresa.fantasia ?? "",
    cnpj: formatCnpj(empresa.CNPJ ?? ""),
    endereco: buildEndereco(empresa),
    cidade: empresa.cidade ?? "",
    uf: empresa.uf ?? "",
    tel: empresa.fone ?? "",
    email: empresa.email ?? "",
  },
});

export const getData = async (pedidoId: any) => {
  const token = process.env.ATORIZZATION_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;

  const idStr = Array.isArray(pedidoId) ? pedidoId[0] : String(pedidoId ?? "");

  const fetchById = async (publicationState: string): Promise<PedidoResult | null> => {
    try {
      const url =
        `${baseUrl}/pedidos/${idStr}?${PEDIDO_POPULATE}`
        + `&publicationState=${publicationState}`;

      const res = await axios({
        method: "GET",
        url,
        headers: { Authorization: `Bearer ${token}` },
      });

      return res.data?.data
        ? { id: res.data.data.id, attributes: res.data.data.attributes }
        : null;
    } catch {
      return null;
    }
  };

  try {
    const [liveResult, previewResult] = await Promise.all([
      fetchById("live"),
      fetchById("preview"),
    ]);

    const result = pickLatestPedido(liveResult, previewResult);
    if (!result?.attributes) {
      return null;
    }

    const inf = result.attributes;
    const Vendedor = inf.user?.data?.attributes?.username ?? "";

    const empresaFornec = resolveEmitenteAttributes(inf);

    if (!empresaFornec) {
      return null;
    }

    const fornecedor = buildFornecedorData(empresaFornec);
    const propostaId = result.id;
    const frete = inf.frete;
    const Valfrete = inf.valorFrete;
    const datePop = inf.dataPedido;
    const cliente = inf.empresa.data.attributes;
    const condi = inf.condi;
    const Desconto_Converte = !inf.desconto
      ? null
      : parseFloat(inf.desconto.replace(".", "").replace(",", "."));
    const Desconto = !Desconto_Converte ? 0 : Desconto_Converte;
    const DescontoAdd_Converte = !inf.descontoAdd
      ? null
      : parseFloat(inf.descontoAdd.replace(".", "").replace(",", "."));

    const DescontoAdd = !DescontoAdd_Converte ? 0 : DescontoAdd_Converte;
    const itens = inf.itens;
    const prazo = inf.prazo === null ? "" : inf.prazo;
    const venc = inf.vencPrint;
    const totoalGeral = inf.totalGeral;
    const obs = inf.obs === null ? "" : inf.obs;
    const business = !inf.business?.data
      ? ""
      : inf.business.data.id === null
        ? ""
        : inf.business.data.id;

    const cliente_pedido = inf.cliente_pedido;
    const custoAdicional = inf.custoAdicional ?? "";

    return {
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
      dataEntrega: DATA_ENTREGA_FIXO,
      custoAdicional,
    };
  } catch (error) {
    throw error;
  }
};
