/* eslint-disable no-undef */

import { ApiErrorResponse } from '../../../../../../../types/axiosErrosPedido';

export const PostItems = async (dados: any) => {
  const apiKey = process.env.ATORIZZATION_TOKEN_BLING;
  const url = process.env.BLING_API_URL;

  const imafe = [
    {
      title: 'caixa_economica',
      url: 'https://ribermax.com.br/images/caixa-economica.webp',
    },
    {
      title: 'caixa_estruturada',
      url: 'https://ribermax.com.br/images/caixa-estruturada.webp',
    },
    {
      title: 'caixa_leve',
      url: 'https://ribermax.com.br/images/caixa-leve.webp',
    },
    {
      title: 'caixa_reforcada',
      url: 'https://ribermax.com.br/images/caixa-reforcada.webp',
    },
    {
      title: 'caixa_super_reforcada',
      url: 'https://ribermax.com.br/images/caixa-super-reforcada.webp',
    },
    {
      title: 'palete_sob_medida',
      url: 'https://ribermax.com.br/images/palete-sob-medida.webp',
    },
    {
      title: 'caixa_resistente',
      url: 'https://ribermax.com.br/images/caixa-resistente.webp',
    },
    {
      title: 'engradado_economico',
      url: 'https://ribermax.com.br/images/engradado_economico-300x273.webp',
    },
    {
      title: 'engradado_leve',
      url: 'https://ribermax.com.br/images/engradado-leve.webp',
    },
    {
      title: 'engradado_reforcado',
      url: 'https://ribermax.com.br/images/engradado-reforcado.webp',
    },
    {
      title: 'engradado_resistente',
      url: 'https://ribermax.com.br/images/engradado-resistente.webp',
    },
  ];

  const categoria = [
    { id: '6658489', descricao: 'caixa_estruturada' },
    { id: '6658469', descricao: 'caixa-super-leve' },
    { id: '5902313', descricao: 'caixa_economica' },
    { id: '6658499', descricao: 'caixa_reforcada' },
    { id: '6658495', descricao: 'caixa_leve' },
    { id: '6658486', descricao: 'caixa_reforcada_premium_8' },
    { id: '6658503', descricao: 'caixa_super_reforcada' },
    { id: '6658474', descricao: 'engradado-resistente' },
    { id: '6658472', descricao: 'engradado_economico' },
    { id: '6658478', descricao: 'engradado_leve' },
    { id: '6658482', descricao: 'engradado_reforcado' },
    { id: '6658459', descricao: 'palete_sob_medida' },
  ];

  const [CategiriaCuston] = categoria
    .filter((i) => i.descricao === dados.modelo)
    .map((i) => i.id);

  const [image] = imafe
    .filter((i) => i.title === dados.modelo)
    .map((i) => i.url);

  const date = new Date();
  const valit = `${
    date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
  }/${
    date.getMonth() + 10 < 10
      ? '0' + (date.getMonth() + 10)
      : date.getMonth() + 10
  }/${date.getFullYear()}`;

  const Mont = dados.prodId + '-mont';
  const Expo = dados.prodId + '-expo';
  const montExpo = dados.prodId + '-mont-expo';

  const codg =
    dados.expo === true && dados.mont === true
      ? montExpo
      : dados.expo === true
      ? Expo
      : dados.mont === true
      ? Mont
      : dados.prodId;

  const xml: string = `<?xml version="1.0" encoding="UTF-8"?>\n  <produto>\n    <codigo>${codg}</codigo>\n    <descricao>${
    dados.nomeProd
  }</descricao>\n    <situacao>Ativo</situacao>\n    <descricaoCurta>${
    dados.titulo
  }</descricaoCurta>\n    <descricaoComplementar>${
    dados.nomeProd
  }</descricaoComplementar>\n    <un>Un</un>\n    <vlr_unit>${parseFloat(
    dados.total,
  )}</vlr_unit>\n    <preco_custo>${parseFloat(
    dados.total,
  )}</preco_custo>\n    <peso_bruto>0000</peso_bruto>\n    <peso_liq>0000</peso_liq>\n    <class_fiscal>1000.01.01</class_fiscal>\n    <marca>Ribermax embalagens</marca>\n    <origem>0</origem>\n    <estoque>${parseFloat(
    dados.Qtd,
  )}</estoque>\n    <gtin>223435780</gtin>\n    <gtinEmbalagem>54546</gtinEmbalagem>\n    <largura>${parseInt(
    dados.largura,
  )}</largura>\n    <altura>${
    !dados.altura ? '00' : dados.altura
  }</altura>\n    <profundidade>${parseInt(
    dados.comprimento,
  )}</profundidade>\n    <estoqueMinimo>1</estoqueMinimo>\n    <estoqueMaximo>10000</estoqueMaximo>\n    <cest>28.057.00</cest>\n    <idGrupoProduto>${parseInt(
    dados.prodId,
  )}</idGrupoProduto>\n    <condicao>Novo</condicao>\n    <freteGratis>N</freteGratis>\n    <linkExterno>https://ribermax.com.br/produtos</linkExterno>\n    <observacoes></observacoes>\n    <producao>P</producao>\n    <dataValidade>${valit}</dataValidade>\n    <descricaoFornecedor></descricaoFornecedor>\n    <idFabricante>0</idFabricante>\n    <codigoFabricante>123</codigoFabricante>\n    <unidadeMedida>Centímetros</unidadeMedida>\n    <garantia>10</garantia>\n    <itensPorCaixa>1</itensPorCaixa>\n    <volumes>1</volumes>\n    <urlVideo></urlVideo>\n    <imagens>\n      <url>${image}</url>\n    </imagens>\n    <idCategoria>${CategiriaCuston}</idCategoria>\n  </produto>`;

  const formData = new FormData();
  formData.append('apikey', apiKey);
  formData.append('xml', xml);

  try {
    // console.log(formData);
    var requestOptions = {
      method: 'POST',
      body: formData,
    };

    const requet = await fetch(url + '/produto/json', requestOptions);
    const response = await requet.json();

    const { produtos, erros } = response.retorno;

    if (erros[0][0].erro) {
      throw Object.assign(new Error(erros[0][0].erro.msg), {
        response: {
          status: response.status,
        },
        erro: erros[0][0].erro,
        detalhes: erros[0][0].erro.msg,
      });
    }
    if (erros[0].erro) {
      throw Object.assign(new Error(erros[0].erro.msg), {
        response: {
          status: response.status,
        },
        erro: erros[0].erro,
        detalhes: erros[0].erro.msg,
      });
    }

    return produtos[0].produto;
  } catch (error) {
    const errorResponse: ApiErrorResponse = {
      message: error.message ?? `Solicitação inválida`,
      status: error.response?.status ?? 400,
      erro: error.erro ?? '[]',
      detalhes: error.detalhes ?? 'null',
    };
    throw errorResponse;
  }
};
