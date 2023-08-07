export const MaskCep = (valor: string) => {
  const CEPMask = valor.replace(/^(\d{2})(\d{3})(\d{3})$/, "$1.$2-$3");
  return CEPMask
}
