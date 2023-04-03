/* eslint-disable no-undef */

import { ApiErrorResponse } from '../../../../../../../types/axiosErrosPedido';

export const UpDateItens = async (dados: any) => {
  const apiKey = process.env.ATORIZZATION_TOKEN_BLING;
  const url = process.env.BLING_API_URL;

  const items = await Promise.all(
    dados.map(async (item: any) => {
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
          url: 'https://ribermax.com.br/images/engradado-leve.webp',
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
        .filter((i) => i.descricao === item.modelo)
        .map((i) => i.id);

      const [image] = imafe
        .filter((i) => i.title === item.modelo)
        .map((i) => i.url);

      const date = new Date();
      const valit = `${
        date.getDate() < 10 ? '0' + date.getDate() : date.getDate()
      }/${
        date.getMonth() + 10 < 10
          ? '0' + (date.getMonth() + 10)
          : date.getMonth() + 10
      }/${date.getFullYear()}`;

      const Mont = item.prodId + '-mont';
      const Expo = item.prodId + '-expo';
      const montExpo = item.prodId + '-mont-expo';

      const codg =
        item.expo === true && item.mont === true
          ? montExpo
          : item.expo === true
          ? Expo
          : item.mont === true
          ? Mont
          : item.prodId;

      const xml: string = `<?xml version="1.0" encoding="UTF-8"?>\n  <produto>\n    <codigo>${codg}</codigo>\n    <descricao>${
        item.nomeProd
      }</descricao>\n    <situacao>Ativo</situacao>\n    <descricaoCurta>${
        item.titulo
      }</descricaoCurta>\n    <descricaoComplementar>${
        item.nomeProd
      }</descricaoComplementar>\n    <un>Un</un>\n    <vlr_unit>${parseFloat(
        item.total,
      )}</vlr_unit>\n    <preco_custo>${parseFloat(
        item.total,
      )}</preco_custo>\n    <peso_bruto>0000</peso_bruto>\n    <peso_liq>0000</peso_liq>\n    <class_fiscal>1000.01.01</class_fiscal>\n    <marca>Ribermax embalagens</marca>\n    <origem></origem>\n    <estoque>${parseFloat(
        item.Qtd,
      )}</estoque>\n    <gtin>223435780</gtin>\n    <gtinEmbalagem>54546</gtinEmbalagem>\n    <largura>${
        item.largura
      }</largura>\n    <altura>${item.altura}</altura>\n    <profundidade>${
        item.comprimento
      }</profundidade>\n    <estoqueMinimo>1</estoqueMinimo>\n    <estoqueMaximo>10000</estoqueMaximo>\n    <cest>28.057.00</cest>\n    <idGrupoProduto></idGrupoProduto>\n    <condicao>Novo</condicao>\n    <freteGratis>N</freteGratis>\n    <linkExterno>https://ribermax.com.br/produtos</linkExterno>\n    <observacoes></observacoes>\n    <producao>P</producao>\n    <dataValidade>${valit}</dataValidade>\n    <descricaoFornecedor></descricaoFornecedor>\n    <idFabricante></idFabricante>\n    <codigoFabricante></codigoFabricante>\n    <unidadeMedida>Centímetros</unidadeMedida>\n    <garantia>10</garantia>\n    <itensPorCaixa>1</itensPorCaixa>\n    <volumes>1</volumes>\n    <urlVideo></urlVideo>\n    <imagens>\n      <url>${image}</url>\n    </imagens>\n    <idCategoria>${CategiriaCuston}</idCategoria>\n  </produto>`;

      const formData = new FormData();
      formData.append('apikey', apiKey);
      formData.append('xml', xml);
      try {
        var requestOptions = {
          method: 'POST',
          body: formData,
        };

        const requet = await fetch(
          url + `/produto/${item.prodId}/json`,
          requestOptions,
        );
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
      } catch (error) {
        const errorResponse: ApiErrorResponse = {
          message: error.message ?? `Solicitação invalida`,
          status: error.response?.status ?? 400,
          erro: error.erro ?? '[]',
          detalhes: error.detalhes ?? 'null',
        };
        throw errorResponse;
      }
    }),
  );

  return items;
};
