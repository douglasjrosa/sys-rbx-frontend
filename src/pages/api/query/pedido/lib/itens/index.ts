import { GetItemsBling } from '../../request/bling/getItens';

export const VerifiqItems = async (data: any) => {
  const dataItens = data.attributes.itens;
  const dataEmpresa = data.attributes.empresa.data;
  try {
    const verifiBlingItens = await GetItemsBling(dataItens);

    console.log(verifiBlingItens);
    return verifiBlingItens;
  } catch (error) {
    throw Object.assign(new Error(error.message), {
      status: error.status,
      erro: error.erro,
      detalhes: error.detalhes,
    });
  }
};
