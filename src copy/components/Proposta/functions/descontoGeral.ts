export const DescontoGeral = async (itens: any) => {
  const result = await itens
    .reduce((acc: any, i: any) => acc + i.desconto, 0)
    .toLocaleString('pt-br', {
      style: 'currency',
      currency: 'BRL',
    });
  return result;
};
