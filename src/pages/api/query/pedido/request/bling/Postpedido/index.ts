/* eslint-disable no-undef */

import fs from "fs";
import { ApiErrorResponse } from "../../../../../../../types/axiosErrosPedido";
import { SaveRespose } from "../../db/post/SaveRespose";

export const PostPedido = async (dados: any) => {
  const url = process.env.BLING_API_URL;
  const apiKey: any = process.env.ATORIZZATION_TOKEN_BLING;
  const DaDos = await dados.attributes;
  const empresa = DaDos.empresa.data.attributes;
  const Produto = await DaDos.itens;

  // console.log(empresa)
  const Produtos = Produto.map((i: any) => {
    const Mont = i.prodId + "-mont";
    const Expo = i.prodId + "-expo";
    const montExpo = i.prodId + "-mont-expo";


    const codg =
      i.expo === true && i.mont === true
        ? montExpo
        : i.expo === true
        ? Expo
        : i.mont === true
        ? Mont
        : i.prodId;

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
      <vlr_unit>${i.total}</vlr_unit>
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

  const prazo1 = DaDos.prazo === "" ? "5 Dias" : DaDos.prazo;
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

  const desconto = DaDos.desconto
    .replace("R$", "")
    .replace(".", "")
    .replace(",", ".");

console.log(empresa.CNPJ)

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
     <vlr_frete>${
       DaDos.valorFrete === "0"
         ? ""
         : DaDos.valorFrete === ""
         ? ""
         : DaDos.valorFrete
     }</vlr_frete>
     <vlr_desconto>${desconto}</vlr_desconto>
     <obs>${DaDos.obs}</obs>
  </pedido>`;



  try {
    const formData = new FormData();
    formData.append("apikey", apiKey);
    formData.append("xml", xml);

    var requestOptions = {
      method: "POST",
      body: formData,
    };

    const requet = await fetch(url + "/pedido/json/", requestOptions);
    const response = await requet.json();
    console.log("🚀 ~ file: index.ts:189 ~ PostPedido ~ response:", response)


    const { pedidos, erros } = response.retorno;
    console.log("🚀 ~ file: index.ts:193 ~ PostPedido ~ erros:", erros)
    console.log("🚀 ~ file: index.ts:193 ~ PostPedido ~ pedidos:", pedidos)

    if (erros) {
      throw Object.assign(new Error(erros[0].erro.msg), {
        response: {
          status: response.status,
        },
        erro: erros[0].erro,
        detalhes: erros[0].erro.msg,
      });
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

    return resposta;
  } catch (error: any) {
    const errorResponse: ApiErrorResponse = {
      message: error.message ?? `Solicitação inválida`,
      status: error.response?.status ?? 400,
      erro: error.erro ?? "[]",
      detalhes: error.detalhes ?? "null",
    };
    throw errorResponse;
  }
};
