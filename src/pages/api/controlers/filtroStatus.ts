
export const Filtro = async (get) => {
  const dados = get.data
  const resp = dados.filter((s) => s.attributes.status === true);
  return resp
}
