export const SimplesRetur = async (get) => await Promise.all(get.map(async (item) => {
  const obj = {
    id: item.id,
    attributes: {
      nome: item.attributes.nome,
      fantasia: item.attributes.fantasia,
      endereco: item.attributes.endereco,
      numero: item.attributes.numero,
      complemento: item.attributes.complemento,
      bairro: item.attributes.bairro,
      cep: item.attributes.cep,
      cidade: item.attributes.cidade,
      uf: item.attributes.uf,
      fone: item.attributes.fone,
      celular: item.attributes.celular,
      site: item.attributes.site,
      email: item.attributes.email,
      emailNfe: item.attributes.emailNfe,
      CNPJ: item.attributes.CNPJ
    }
  }
  return obj
}))
