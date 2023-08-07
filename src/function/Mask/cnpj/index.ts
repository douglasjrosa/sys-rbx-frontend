export const MaskCnpj = (valor: string) => {
  const CNPJMask = valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  return CNPJMask
}
