import { RegCompraFim } from "@/pages/api/db/lib/empresa_reg_final";
import { ApiErrorResponse } from "../../../../../../../types/axiosErrosPedido";
import { SaveRespose } from "../../db/post/SaveRespose";

export const PostPedido = async (dados: any) => {
  const url = process.env.BLING_API_URL;
  const apiKeyMax: any = process.env.ATORIZZATION_TOKEN_BLING_MAX;
  const apiKeyBragheto: any = process.env.ATORIZZATION_TOKEN_BLING_BRAGHETO;
  const apiKeyRenato: any = process.env.ATORIZZATION_TOKEN_BLING_RENATO;

  const DaDos = await dados.attributes;
  console.log("🚀 ~ file: index.ts:12 ~ PostPedido ~ DaDos:", DaDos)

  const empresa = DaDos.empresa.data.attributes;
  const empresaId = DaDos.empresa.data.id;
  const empresaUlt = DaDos.empresa.data.attributes.ultima_compra;
  const Produto = await DaDos.itens;

  const CnpjFornecedor = DaDos.fornecedorId.data.attributes.CNPJ
  const numeroClinete = DaDos.cliente_pedido

  const apiKey = CnpjFornecedor == 17757153000180 ? apiKeyMax : CnpjFornecedor == '04586593000170' ? apiKeyBragheto : apiKeyRenato
  // console.log("🚀 ~ file: index.ts:19 ~ PostPedido ~ apiKey:", apiKey)
  // console.log("🚀 ~ file: index.ts:19 ~ PostPedido ~ apiKey:", CnpjFornecedor)


  const Produtos = Produto.map((i: any) => {
    const valorOriginal = Number(i.vFinal.replace(".", "").replace(",", "."));

    const acrec: number =
      i.mont && i.expo
        ? 1.2
        : i.expo && !i.mont
        ? 1.1
        : !i.expo && i.mont
        ? 1.1
        : 0;
    const somaAcrescimo: number =
      acrec === 0 ? 0 : valorOriginal * acrec - valorOriginal;
    const valor: number = somaAcrescimo + valorOriginal;
    const valorUnit = Math.round(parseFloat(valor.toFixed(2)) * 100) / 100;


    const setItens = `
    <item>
      <codigo>${i.prodId}</codigo>
      <descricao>${
        i.expo === true && i.mont === true
          ? i.nomeProd + " -EXP -MONTADA"
          : i.expo === true && i.mont === false
          ? i.nomeProd + " -EXP"
          : i.expo === false && i.mont === true
          ? i.nomeProd + " -MONTADA"
          : i.nomeProd
      }</descricao>
      <un>Un</un>
      <qtde>${i.Qtd}</qtde>
      <vlr_unit>${valorUnit}</vlr_unit>
      <tipo>P</tipo>
      <peso_bruto>${i.pesoCx}</peso_bruto>
      <peso_liq>${i.pesoCx}</peso_liq>
      <class_fiscal>${i.ncm}</class_fiscal>
      <origem>0</origem>
    </item>
    `;
    return setItens;
  });

  const xmlprodutos = Array.isArray(Produtos)
  ? Produtos.reduce((acc: any, cur: any) => acc + cur)
  : Produtos;

  const prazo1 = !DaDos.prazo || DaDos.prazo === "" ? "5 Dias" : DaDos.prazo;
  const Valor = DaDos.totalGeral
    .replace("R$", "")
    .replace(".", "")
    .replace(",", ".");
  const ValorTotal = Valor;
  const prazo = prazo1.replace("Dias", "");

  const parcelasDay = prazo.split(" / ");
  const ParcelasMult = parcelasDay.length;
  const hoje = new Date();

  const datasParcelas = parcelasDay.map((p: string, x: number) => {
    const pp = parseInt(p);
    const dataParcela = new Date(hoje);
    dataParcela.setDate(dataParcela.getDate() + pp);
    const valorParcela = ValorTotal / ParcelasMult;

    // Verifica se a data cai em sábado ou domingo
    if (dataParcela.getDay() === 6) {
      dataParcela.setDate(dataParcela.getDate() + 2); // Adiciona dois dias para cair na segunda-feira
    } else if (dataParcela.getDay() === 0) {
      dataParcela.setDate(dataParcela.getDate() + 1); // Adiciona um dia para cair na segunda-feira
    }

    const obs = x === 0 ? "Entrada" : `Parcela N°:${x + 1}`;
    const templateParcela = `<parcela>
          <data>${dataParcela.toLocaleDateString()}</data>
          <vlr>${valorParcela.toFixed(2)}</vlr>
          <obs>${obs}</obs>
        </parcela>`;

    return templateParcela;
  });


  const parcela = () => {
    const prazo1 = "5 Dias";
    const prazo = prazo1.replace("Dias", "");
    const pp = parseInt(prazo);
    const dataParcela = new Date();
    dataParcela.setDate(dataParcela.getDate() + pp);
    const Valor = DaDos.totalGeral
      .replace("R$", "")
      .replace(".", "")
      .replace(",", ".");
    const ValorTotal = parseFloat(Valor);

    if (dataParcela.getDay() === 6) {
      dataParcela.setDate(dataParcela.getDate() + 2); // Adiciona dois dias para cair na segunda-feira
    } else if (dataParcela.getDay() === 0) {
      dataParcela.setDate(dataParcela.getDate() + 1); // Adiciona um dia para cair na segunda-feira
    }
    const obs =
      DaDos.condi === "Antecipado"
        ? "pagamento antecipado"
        : DaDos.condi === "À vista"
        ? "pagamento a vista"
        : null;

    const retorno = `
      <parcela>
        <data>${dataParcela.toLocaleDateString()}</data>
        <vlr>${ValorTotal.toFixed(2)}</vlr>
        <obs>${obs}</obs>
      </parcela>
    `;
    return retorno;
  };

  const [xmlParcelas] =
  DaDos.condi === "Antecipado" || DaDos.condi === "À vista"
  ? parcela()
  : datasParcelas;


  const desconto = parseFloat(DaDos.desconto.replace("R$", "").replace(".", "").replace(",", "."));
  // console.log("🚀 ~ file: index.ts:150 ~ PostPedido ~ DaDos.desconto:", DaDos.desconto)
  // console.log("🚀 ~ file: index.ts:150 ~ PostPedido ~ DaDos.desconto:", desconto)

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <pedido>
     <cliente>
        <nome>${empresa.nome}</nome>
        <tipoPessoa>J</tipoPessoa>
        <endereco>${empresa.endereco}</endereco>
        <cpf_cnpj>${empresa.CNPJ}</cpf_cnpj>
        <ie>${empresa.Ie}</ie>
        <numero>${empresa.numero}</numero>
        <complemento>${empresa.complemento}</complemento>
        <bairro>${empresa.bairro}</bairro>
        <cep>${empresa.cep}</cep>
        <cidade>${empresa.cidade}</cidade>
        <uf>${empresa.uf}</uf>
        <fone>${empresa.celular === "" ? empresa.fone : empresa.celular}</fone>
        <email>${empresa.email}</email>
     </cliente>
     <transporte />
     <itens>${xmlprodutos}</itens>
     <parcelas>${xmlParcelas}</parcelas>
     <nf_produtor_rural_referenciada />
     <vlr_frete>${DaDos.frete !== 'CIF'? '' : !DaDos.valorFrete? 0.00 : parseFloat(DaDos.valorFrete.replace("R$", "").replace(".", "").replace(",", "."))}</vlr_frete>
     <vlr_desconto>${desconto}</vlr_desconto>
     <obs>${DaDos.obs}${!numeroClinete? '' : `N° pedido cliente: ${numeroClinete}`}</obs>
  </pedido>`;
  console.log("🚀 ~ file: index.ts:172 ~ PostPedido ~ xml:", xml)

  try {
    const formData = new FormData();
    formData.append("apikey", apiKey);
    formData.append("xml", xml);

    var requestOptions = {
      method: "POST",
      body: formData,
    };
      // console.log("🚀 ~ file: index.ts:173 ~ PostPedido ~ formData:", formData)

    const requet = await fetch(url + "/pedido/json/", requestOptions);
    const response = await requet.json();

    const { pedidos, erros } = response.retorno;
    console.log("🚀 ~ file: index.ts:193 ~ PostPedido ~ erros:", erros)

    const txt =
      "Pedido ja cadastrado no sistema - Um pedido com o mesmo hash ja encontra-se cadastrado (25)";

    if (erros) {
      if (erros?.erro.msg === txt) {
        const resposta = {
          msg: `${erros?.erro.msg}, mas Pedido, foi salvo`,
          status: 201,
        };

        return resposta;
      } else {
        throw Object.assign(new Error(erros[0]?.erro.msg), {
          response: {
            status: response.status,
          },
          erro: erros[0]?.erro?.cod,
          detalhes: erros[0]?.erro.msg,
        });
      }
    }

    const resposta = {
      msg:
        "pedido gerando com susseso, pedido N°: " + pedidos[0].pedido.idPedido,
      pedido: pedidos[0].pedido.idPedido,
      status: 201,
    };
    const nPedido = dados.id;
    const Bpedido = pedidos[0].pedido.idPedido;
    const IdNegocio = DaDos.business.data.id;
    await SaveRespose(nPedido, Bpedido, IdNegocio);
    await RegCompraFim(empresaId, DaDos.totalGeral, empresaUlt);

    return resposta;
  } catch (error: any) {
    console.log("🚀 ~ file: index.ts:230 ~ PostPedido ~ error:", error)
    const errorResponse: ApiErrorResponse = {
      message: error.message ?? `Solicitação inválida`,
      status:  400,
      erro: '',
      detalhes: error.detalhes ?? "",
    };
    throw errorResponse;
  }
};
