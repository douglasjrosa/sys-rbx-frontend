import axios from 'axios';

/* eslint-disable no-undef */
export const Populate = async (Cliente: string, dados: any) => {
  const cnpj = Cliente;
  const token = process.env.ATORIZZATION_TOKEN;
  const axiosRequet = axios.create({
    baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const axiosRibermax = axios.create({
    baseURL: process.env.RIBERMAX_API_URL,
    headers: {
      'Content-Type': 'application/json',
      Email: process.env.ATORIZZATION_EMAIL,
      Token: process.env.ATORIZZATION_TOKEN_RIBERMAX,
    },
  });

  const now = new Date();
  const isoDateTime = now.toISOString();

  const dataHistory = [
    {
      date: isoDateTime,
      vendedors: dados.vendedor,
      msg: 'Empresa criada',
    },
  ];

  const response = await axiosRibermax.get('/empresas?CNPJ=' + cnpj);
  const rep = response.data;
  const dataPost = {
    data: {
      nome: rep.nome,
      fantasia: rep.xNome,
      tipoPessoa: 'CNPJ',
      endereco: rep.xLgr,
      numero: rep.nro,
      complemento: rep.xCpl,
      bairro: rep.xBairro,
      cep: rep.CEP.replace(/[^0-9]/g, ''),
      cidade: rep.xMun,
      uf: rep.UF,
      pais: rep.xPais,
      simples: false,
      ieStatus: rep.IE === '' ? false : true,
      status: true,
      adFrailLat: rep.LatAdFrSN === 'on' ? true : false,
      adFrailCab: rep.CabAdFrSN === 'on' ? true : false,
      adEspecialLat: rep.LatAdExSN === 'on' ? true : false,
      adEspecialCab: rep.CabAdExSN === 'on' ? true : false,
      latFCab: rep.LatForaSN === 'on' ? true : false,
      cabChao: rep.CabChaoSN === 'on' ? true : false,
      cabTop: false,
      cxEco: rep.caixa_economica === 'on' ? true : false,
      cxEst: rep.caixa_estruturada === 'on' ? true : false,
      cxLev: rep.caixa_leve === 'on' ? true : false,
      cxRef: rep.caixa_reforcada === 'on' ? true : false,
      cxSupRef: rep.caixa_super_reforcada === 'on' ? true : false,
      platSMed: rep.palete_sob_medida === 'on' ? true : false,
      cxResi: rep.caixa_resistente === 'on' ? true : false,
      engEco: rep.engradado_economico === 'on' ? true : false,
      engLev: rep.engradado_leve === 'on' ? true : false,
      engRef: rep.engradado_reforcado === 'on' ? true : false,
      engResi: rep.engradado_resistente === 'on' ? true : false,
      email: rep.email,
      emailNfe: rep.email,
      tablecalc: rep.tabela === 0 ? null : rep.tabela,
      maxPg: rep.prefPagto === 0 ? null : rep.prefPagto,
      forpg: rep.formaPagto === 0 ? null : rep.formaPagto,
      frete: rep.frete === 0 ? null : rep.frete,
      CNPJ: rep.CNPJ.replace(/[^0-9]/g, ''),
      Ie: rep.IE.replace(/[^0-9]/g, ''),
      fone: rep.fone.replace(/[^0-9]/g, ''),
      celular: rep.cel,
      CNAE: rep.CNAE,
      codpais: rep.cPais,
      history: dataHistory,
      titulo: rep.nome,
      vendedor: dados.vendedor,
      vendedorId: dados.vendedorId,
      fornecedor: dados.fornecedor,
      fornecedorId: dados.fornecedorId,
      codigo: rep.Cod,
    },
  };

  const postEmpresa = await axios({
    method: 'POST',
    url: process.env.NEXT_PUBLIC_STRAPI_API_URL + '/empresas',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: JSON.stringify(dataPost),
  });
  const resposta = postEmpresa.data.data;

  const retornoCliente = [
    {
      id: resposta.id,
      attributes: { titulo: resposta.attributes.titulo },
    },
  ];
  return retornoCliente;
};
