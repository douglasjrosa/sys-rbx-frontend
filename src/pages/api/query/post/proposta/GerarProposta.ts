export const GerarProposta = async (
  lista: any,
  vendedor: string,
  empresa: any,
  Responsavel: string,
  DateContato: any,
) => {
  const itensMap = lista.map((i: any) => {
    const xmlItens = `<item>\n         <codigo>001</codigo>\n         <descricao>teste</descricao>\n         <qtde>5</qtde>\n         <valorUnidade>1</valorUnidade>\n         <un>un</un>\n     </item>\n     `;
    return xmlItens;
  });

  const hoje = new Date();
  const dataAtual = hoje.toLocaleDateString();

  hoje.setDate(hoje.getDate() + 2);
  const DataPosterior = hoje.toLocaleDateString();

  var axios = require('axios');
  var FormData = require('form-data');
  var data = new FormData();
  data.append(
    'apikey',
    'e1925d308b2a64e2e7ee189183d56a51e10bc03b30ec175a529931176b40cce8efe8a191',
  );
  data.append(
    'xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<propostacomercial>\n   <desconto></desconto>\n   <obsInterna></obsInterna>\n   <dataEmissao>${dataAtual}</dataEmissao>\n   <dataProximoContato>${DataPosterior}</dataProximoContato>\n   <numeroProposta></numeroProposta>\n   <vendedor>${vendedor}</vendedor>\n   <valorFrete></valorFrete>\n   <loja>49708527</loja>\n   <aosCuidadosDe></aosCuidadosDe>\n   <garantia>9999</garantia>\n   <validadeDaProposta>15</validadeDaProposta>\n   <observacao>Teste</observacao>\n   <prazoEntrega>5</prazoEntrega>\n   <assinaturaSaudacao>Atenciosamente,</assinaturaSaudacao>\n   <assinaturaResponsavel>Departamento de vendas</assinaturaResponsavel>\n   <idContato>0000001</idContato>\n   <cliente>\n     <nome>Organisys Software</nome>\n     <cpfCnpj>00.000.000/0000-1</cpfCnpj>\n     <tipoPessoa>J</tipoPessoa>\n     <ie></ie>\n     <rg></rg>\n     <endereco>Rua Visconde de São Gabriel</endereco>\n     <numero>001</numero>\n     <complemento>Sala 03</complemento>\n     <cidade>Bento Gonçalves</cidade>\n     <bairro>Cidade Alta</bairro>\n     <cep>95.700-000</cep>\n     <uf>RS</uf>\n     <email>teste@organisys.com.br</email>\n     <celular>(00) 00000-0000</celular>\n     <fone>(00) 0000-0000</fone>\n   </cliente>\n   <itens>\n     ${itensMap}</itens>\n    <parcelas>\n      <parcela>\n          <valor>90</valor>\n          <obs>Teste obs 1</obs>\n          <nrDias>50</nrDias>\n          <formaPagamento>\n          <id>0001</id>\n          </formaPagamento>\n      </parcela>\n      <parcela>\n         <valor>5000</valor>\n         <obs>Teste obs 2</obs>\n         <nrDias>100</nrDias>\n         <formaPagamento>\n             <id>0002</id>\n         </formaPagamento>\n      </parcela>\n   </parcelas>\n   <transporte>\n       <transportadora>Transportadora XYZ</transportadora>\n       <tipoFrete>s</tipoFrete>\n       <qtdVolumes>50</qtdVolumes>\n       <pesoBruto>5</pesoBruto>\n   </transporte>\n</propostacomercial>`,
  );

  var config = {
    method: 'post',
    url: 'https://bling.com.br/Api/v2/propostacomercial/json/',
    headers: {
      ...data.getHeaders(),
    },
    data: data,
  };

  axios(config)
    .then(function (response: any) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error: any) {
      console.log(error);
    });
};
