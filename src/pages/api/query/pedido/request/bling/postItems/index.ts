/* eslint-disable no-undef */

import axios, { AxiosRequestConfig } from 'axios';
import { ApiErrorResponse } from '../../../../../../../types/axiosErrosPedido';

export const PostItems = async (dados: any) => {
  const apiKey = process.env.ATORIZZATION_TOKEN_BLING;

  const imafe = [
    {
      title: 'caixa_economica',
      url: 'https://ribermax.com.br/images/caixa-economica.webp?w=1080&q=75',
    },
    {
      title: 'caixa_estruturada',
      url: 'https://ribermax.com.br/images/caixa-estruturada.webp?w=1080&q=75',
    },
    {
      title: 'caixa_leve',
      url: 'https://ribermax.com.br/images/caixa-leve.webp?w=1080&q=75',
    },
    {
      title: 'caixa_reforcada',
      url: 'https://ribermax.com.br/images/caixa-reforcada.webp?w=1080&q=75',
    },
    {
      title: 'caixa_super_reforcada',
      url: 'https://ribermax.com.br/images/caixa-super-reforcada.webp?w=1080&q=75',
    },
    {
      title: 'palete_sob_medida',
      url: 'https://ribermax.com.br/images/palete-sob-medida.webp?w=1080&q=75',
    },
    {
      title: 'caixa_resistente',
      url: 'https://ribermax.com.br/images/caixa-resistente.webp?w=1080&q=75',
    },
    {
      title: 'engradado_economico',
      url: 'https://ribermax.com.br/images/engradado_economico-300x273.webp?w=1080&q=75',
    },
    {
      title: 'engradado_leve',
      url: 'https://ribermax.com.br/images/engradado-leve.webp?w=1080&q=75',
    },
    {
      title: 'engradado_reforcado',
      url: 'https://ribermax.com.br/images/engradado-reforcado.webp?w=1080&q=75',
    },
    {
      title: 'engradado_resistente',
      url: 'https://ribermax.com.br/images/engradado-resistente.webp?w=1080&q=75',
    },
  ];

  const [image] = imafe
    .filter((i) => i.title === dados.modelo)
    .map((i) => i.url);

  const formData = new FormData();
  formData.append('apikey', apiKey);
  formData.append(
    'xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n  <produto>\n    <codigo>${dados.prodId}</codigo>\n    <descricao>${dados.nomeProd}</descricao>\n    <situacao>Ativo</situacao>\n    <descricaoCurta>${dados.titulo}</descricaoCurta>\n    <descricaoComplementar>${dados.nomeProd}</descricaoComplementar>\n    <un>Un</un>\n    <vlr_unit>${dados.total}</vlr_unit>\n    <preco_custo></preco_custo>\n    <peso_bruto>${dados.pesoProd}</peso_bruto>\n    <peso_liq></peso_liq>\n    <class_fiscal></class_fiscal>\n    <marca>Ribermax embalagens</marca>\n    <origem>0</origem>\n    <estoque>${dados.Qtd}</estoque>\n    <gtin></gtin>\n    <gtinEmbalagem></gtinEmbalagem>\n    <largura>${dados.largura}</largura>\n    <altura>${dados.altura}</altura>\n    <profundidade>${dados.comprimento}</profundidade>\n    <estoqueMinimo></estoqueMinimo>\n    <estoqueMaximo></estoqueMaximo>\n    <cest>28.057.00</cest>\n    <idGrupoProduto>${dados.prodId}</idGrupoProduto>\n    <condicao>Novo</condicao>\n    <freteGratis>N</freteGratis>\n    <linkExterno>https://ribermax.com.br/produtos</linkExterno>\n    <observacoes></observacoes>\n    <producao>P</producao>\n    <dataValidade></dataValidade>\n    <descricaoFornecedor></descricaoFornecedor>\n    <idFabricante></idFabricante>\n    <codigoFabricante></codigoFabricante>\n    <unidadeMedida>Centímetros</unidadeMedida>\n    <garantia></garantia>\n    <itensPorCaixa></itensPorCaixa>\n    <volumes>1</volumes>\n    <urlVideo></urlVideo>\n    <imagens>\n      <url>${image}</url>\n    </imagens>\n  </produto>`,
  );

  try {
    // console.log(formData);
    var requestOptions = {
      method: 'POST',
      body: formData,
    };

    const requet = await fetch(
      'https://bling.com.br/Api/v2/produto/json',
      requestOptions,
    );
    const response = await requet.json();

    console.log(response);

    const { produtos, erros } = response.retorno;
    console.log(erros[0][0]);

    if (erros) {
      throw Object.assign(new Error(erros[0][0].erro.msg), {
        response: {
          status: response.status,
        },
        erro: erros[0][0].erro,
        detalhes: erros[0][0].erro.msg,
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
