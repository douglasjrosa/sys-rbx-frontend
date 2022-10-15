import axios from "axios";

export const clienteHttp = axios.create({
 baseURL: process.env.EXT_PUBLIC_STRAPI_API_URL +'/api',
});


export const GetEmpresa = async () => {
     return clienteHttp.get("/empresas");
};

export const GetEmpresaId = async (id) => {
     return clienteHttp.get(`/empresas/${id}`);
};

export const PostEmpresa = async (
  nome, fantasia, tipoPessoa, contribuinte, cpf_cnpj, ie_rg, endereco, numero, complemento, bairro, cep, cidade, uf, fone, celular, email, emailNfe, informacaoContato, limiteCredito, paisOrigem, codigo, site, obs, modelos, pessoa, status
) => {
     return clienteHttp.post("/empresas", {
       nome, fantasia, tipoPessoa, contribuinte, cpf_cnpj, ie_rg, endereco, numero, complemento, bairro, cep, cidade, uf, fone, celular, email, emailNfe, informacaoContato, limiteCredito, paisOrigem, codigo, site, obs, modelos, pessoa, status
     });
};

export const PutEmpresa = async (
  id, nome, fantasia, tipoPessoa, contribuinte, cpf_cnpj, ie_rg, endereco, numero, complemento, bairro, cep, cidade, uf, fone, celular, email, emailNfe, informacaoContato, limiteCredito, paisOrigem, codigo, site, obs, modelos, pessoa, status
) => {
     return clienteHttp.put(`/empresas/${id}`, {
       nome, fantasia, tipoPessoa, contribuinte, cpf_cnpj, ie_rg, endereco, numero, complemento, bairro, cep, cidade, uf, fone, celular, email, emailNfe, informacaoContato, limiteCredito, paisOrigem, codigo, site, obs, modelos, pessoa, status
     });
};
export const DelEmpresa = async (id) => {
     return clienteHttp.put(`/empresas/${id}`, {status: 0});
};



