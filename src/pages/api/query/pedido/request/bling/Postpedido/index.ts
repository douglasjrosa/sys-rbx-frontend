export const PostPedido = async (dados: any) => {
  console.log(dados);

  const empresa = dados.empresa.data.attributes;
  console.log(empresa);

  const produtos = dados.map((i: any) => {
    const prod = i.itens;
    const Mont = prod.prodId + '-mont';
    const Expo = prod.prodId + '-expo';
    const montExpo = prod.prodId + '-mont-expo';

    const codg =
      prod.expo === true && prod.mont === true
        ? montExpo
        : prod.expo === true
        ? Expo
        : prod.mont === true
        ? Mont
        : prod.prodId;

    const setItens = `<item>
    <codigo>${codg}</codigo>
    <descricao>${prod.titulo}</descricao>
    <un>Un</un>
    <qtde>${prod.Qtd}</qtde>
    <vlr_unit>${prod.total}</vlr_unit>
 </item>`;
    return setItens;
  });

  const parcela = () => {

    <parcela>
           <data></data>
           <vlr>100</vlr>
           <obs>Teste obs 1</obs>
        </parcela>
        <parcela>
           <data>06/09/2009</data>
           <vlr>50</vlr>
           <obs />
        </parcela>
        <parcela>
           <data>11/09/2009</data>
           <vlr>50</vlr>
           <obs>Teste obs 3</obs>
        </parcela>
  }

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
        <fone>${empresa.celular === '' ? empresa.fone : empresa.celular}</fone>
        <email>${empresa.email}</email>
     </cliente>
     <transporte>
        <transportadora></transportadora>
        <tipo_frete></tipo_frete>
        <servico_correios></servico_correios>
        <dados_etiqueta>
           <nome></nome>
           <endereco></endereco>
           <numero></numero>
           <complemento></complemento>
           <municipio></municipio>
           <uf></uf>
           <cep></cep>
           <bairro></bairro>
        </dados_etiqueta>
        <volumes>
           <volume>
              <servico></servico>
              <codigoRastreamento />
           </volume>
           <volume>
              <servico />
              <codigoRastreamento />
           </volume>
        </volumes>
     </transporte>
     <itens>
        ${produtos}
     </itens>
     <parcelas>

     </parcelas>
     <vlr_frete>15</vlr_frete>
     <vlr_desconto>10</vlr_desconto>
     <obs>Testando o campo observações do pedido</obs>
     <obs_internas>Testando o campo observações internas do pedido</obs_internas>
  </pedido>`;

  try {
  } catch (error) {}
};
