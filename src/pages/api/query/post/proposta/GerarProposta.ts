export const GerarProposta = async (
  lista: any,
  vendedor: string,
  empresa: any,
  Responsavel: string,
  DateContato: any,
  loja: string,
  CondPg: any,
  email: string,
) => {
  const itensMap = lista.map((i: any) => {
    const xmlItens = `<item>\n         <codigo>001</codigo>\n         <descricao>teste</descricao>\n         <qtde>5</qtde>\n         <valorUnidade>1</valorUnidade>\n         <un>un</un>\n     </item>\n     `;
    return xmlItens;
  });

  const urlCnpj = 'https://publica.cnpj.ws/cnpj/' + empresa;
  const response = await axios(urlCnpj);
  const Fantasia = response.data.estabelecimento.nome_fantasia;
  const End =
    response.data.estabelecimento.tipo_logradouro +
    ' ' +
    response.data.estabelecimento.logradouro;
  const Numero = response.data.estabelecimento.numero;
  const Bairro = response.data.estabelecimento.bairro;
  const Cep = response.data.estabelecimento.cep;
  const Cidade = response.data.estabelecimento.cidade.nome;
  const Uf = response.data.estabelecimento.estado.sigla;
  const Complemento = response.data.estabelecimento.complemento;
  const IE =
    response.data.estabelecimento.inscricoes_estaduais[0].inscricao_estadual;

  const formattedCep =
    Cep.slice(0, 2) + '.' + Cep.slice(2, 6) + '-' + Cep.slice(6);

  const formattedCnpj = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(empresa);

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
    `<?xml version="1.0" encoding="UTF-8"?>\n<propostacomercial>\n   <desconto></desconto>\n   <obsInterna></obsInterna>\n   <dataEmissao>${dataAtual}</dataEmissao>\n   <dataProximoContato>${DataPosterior}</dataProximoContato>\n   <numeroProposta></numeroProposta>\n   <vendedor>${vendedor}</vendedor>\n   <valorFrete></valorFrete>\n   <loja>${loja}</loja>\n   <aosCuidadosDe>${Responsavel}</aosCuidadosDe>\n   <garantia></garantia>\n   <validadeDaProposta>15</validadeDaProposta>\n   <observacao></observacao>\n   <prazoEntrega></prazoEntrega>\n   <assinaturaSaudacao>Atenciosamente,\n${vendedor}</assinaturaSaudacao>\n   <assinaturaResponsavel>Departamento de vendas</assinaturaResponsavel>\n   <idContato></idContato>\n   <cliente>\n     <nome>${Fantasia}</nome>\n     <cpfCnpj>${formattedCnpj}</cpfCnpj>\n     <tipoPessoa>J</tipoPessoa>\n     <ie>${IE}</ie>\n     <rg></rg>\n     <endereco>${End}</endereco>\n     <numero>${Numero}</numero>\n     <complemento>${Complemento}</complemento>\n     <cidade>${Cidade}</cidade>\n     <bairro>${Bairro}</bairro>\n     <cep>${formattedCep}</cep>\n     <uf>${Uf}</uf>\n     <email>teste@organisys.com.br</email>\n     <celular>(00) 00000-0000</celular>\n     <fone>(00) 0000-0000</fone>\n   </cliente>\n   <itens>\n     ${itensMap}</itens>\n    <parcelas>\n      <parcela>\n          <valor>90</valor>\n          <obs>Teste obs 1</obs>\n          <nrDias>50</nrDias>\n          <formaPagamento>\n          <id>0001</id>\n          </formaPagamento>\n      </parcela>\n      <parcela>\n         <valor>5000</valor>\n         <obs>Teste obs 2</obs>\n         <nrDias>100</nrDias>\n         <formaPagamento>\n             <id>0002</id>\n         </formaPagamento>\n      </parcela>\n   </parcelas>\n   <transporte>\n       <transportadora>Transportadora XYZ</transportadora>\n       <tipoFrete>s</tipoFrete>\n       <qtdVolumes>50</qtdVolumes>\n       <pesoBruto>5</pesoBruto>\n   </transporte>\n</propostacomercial>`,
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
