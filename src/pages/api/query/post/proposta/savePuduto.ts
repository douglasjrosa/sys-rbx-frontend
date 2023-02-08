import axios from 'axios';
import FormData from 'form-data';

export const SaveProd = async (i: any) => {
  console.log('Linsta 1');
  console.log(i);
  try {
    const results = [];
    for (let index = 0; index < i.length; index++) {
      const iten = i[index];
      console.log('aki');
      console.log(iten);
      // eslint-disable-next-line no-undef
      const url = process.env.BLING_API_URL + '/produto/json';
      // eslint-disable-next-line no-undef
      const token = process.env.ATORIZZATION_TOKEN_BLING;

      const caixa: string = '4415.10.00';
      const palet: string = '4415.20.00';
      const NCM = iten.modelo === 'palete_sob_medida' ? palet : caixa;

      const paletImg: string =
        'https://ribermax.com.br/images/palete-sob-medida.webp';
      const CxRefcImg: string =
        'https://ribermax.com.br/images/caixa-reforcada.webp';
      const CxSuperRefcImg: string =
        'https://ribermax.com.br/images/caixa-super-reforcada.webp';
      const CxEstrutImg: string =
        'https://ribermax.com.br/images/caixa-estruturada.webp';
      const CxResistenteImg: string =
        'https://ribermax.com.br/images/caixa-resistente.webp';
      const CxEconomicoImg: string =
        'https://ribermax.com.br/images/caixa-economica.webp';
      const CxLeveImg: string =
        'https://ribermax.com.br/images/caixa-leve.webp';
      const CxSupLeveImg: string =
        'https://ribermax.com.br/images/caixa-super-leve.webp';
      const EngraResistenteImg: string =
        'https://ribermax.com.br/images/engradado-resistente.webp';
      const EngraEconomicoImg: string =
        'https://ribermax.com.br/images/engradado_economico-300x273.webp';
      const EngraReforcadoImg: string =
        'https://ribermax.com.br/images/engradado-reforcado.webp';
      const EngraLeveImg: string =
        'https://ribermax.com.br/images/engradado-leve.webp';

      const valorInc = iten.vFinal.replace('.', '');
      const valor: string = valorInc.replace(',', '.');

      const imgLink =
        iten.modelo === 'palete_sob_medida'
          ? paletImg
          : iten.modelo === 'caixa_economica'
          ? CxEconomicoImg
          : iten.modelo === 'caixa_super_reforcada'
          ? CxSuperRefcImg
          : iten.modelo === 'caixa_reforcada'
          ? CxRefcImg
          : iten.modelo === 'caixa_estruturada'
          ? CxEstrutImg
          : iten.modelo === 'caixa_leve'
          ? CxLeveImg
          : iten.modelo === 'caixa_reforcada_premium_8'
          ? CxRefcImg
          : iten.modelo === 'engradado_reforcado'
          ? EngraReforcadoImg
          : iten.modelo === 'engradado_leve'
          ? EngraLeveImg
          : iten.modelo === 'engradado-resistente'
          ? EngraResistenteImg
          : iten.modelo === 'engradado_economico'
          ? EngraEconomicoImg
          : iten.modelo === 'caixa-super-leve'
          ? CxSupLeveImg
          : CxResistenteImg;

      var data = new FormData();
      data.append('apikey', `${token}`);
      data.append(
        'xml',
        `<?xml version="1.0" encoding="UTF-8"?>\n        <produto>\n          <codigo>${iten.prodId}</codigo>\n          <descricao>${iten.nomeProd}</descricao>\n          <situacao>Ativo</situacao>\n          <descricaoCurta>${iten.nomeProd}</descricaoCurta>\n          <descricaoComplementar>${iten.modelo}</descricaoComplementar>\n          <un>un</un>\n          <vlr_unit>${valor}</vlr_unit>\n          <preco_custo>1.23</preco_custo>\n          <peso_bruto>${iten.pesoProd}</peso_bruto>\n          <peso_liq>0.18</peso_liq>\n          <class_fiscal>${NCM}</class_fiscal>\n          <marca>RiberMax embalagens</marca>\n          <origem>0</origem>\n          <estoque>${iten.unid}</estoque>\n          <gtin>223435780</gtin>\n          <gtinEmbalagem>54546</gtinEmbalagem>\n          <largura>${iten.largura}</largura>\n          <altura>${iten.altura}</altura>\n          <profundidade>${iten.comprimento}</profundidade>\n          <estoqueMinimo>1.00</estoqueMinimo>\n          <estoqueMaximo>100.00</estoqueMaximo>\n          <cest>28.057.00</cest>\n          <idGrupoProduto>${iten.prodId}</idGrupoProduto>\n          <condicao>Novo</condicao>\n          <freteGratis>N</freteGratis>\n          <linkExterno>https://minhaloja.com.br/meu-produto</linkExterno>\n          <observacoes>Observações do meu produtos</observacoes>\n          <producao>P</producao>\n          <dataValidade>20/11/2019</dataValidade>\n          <descricaoFornecedor>Descrição do fornecedor</descricaoFornecedor>\n          <idFabricante>0</idFabricante>\n          <codigoFabricante>123</codigoFabricante>\n          <unidadeMedida>Centímetros</unidadeMedida>\n          <garantia>4</garantia>\n          <itensPorCaixa>6</itensPorCaixa>\n          <volumes>1</volumes>\n          <urlVideo>https://www.youtube.com/watch?v=zKKL-SgC5lY</urlVideo>\n          <imagens>\n            <url>${imgLink}</url>\n          </imagens>\n        </produto>`,
      );
      console.log(iten);
      var config: any = {
        method: 'post',
        url: url,
        headers: {
          ...data.getHeaders(),
        },
        data: data,
      };

      const request = await axios(config);
      const [[response]] = request.data.retorno.erros;
      const responseA = request.data.retorno;
      if (!request.data.retorno.erros) {
        results.push(response);
      } else {
        results.push(responseA);
      }
      await new Promise((resolve) => setTimeout(resolve, 450));
      // console.log(request.data.retorno);
    }
    return results;
  } catch (errors) {
    console.error(errors);
  }
};
