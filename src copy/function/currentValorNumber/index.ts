export const SetValueNumero = (numero: string): number => {
  if (!numero || numero.trim().length === 0) {
    return 0;
  }

  const numeroLimpo = numero.replace(/[^0-9]/g, "");

  const parteInteira = numeroLimpo.slice(0, -2);
  const parteDecimal = numeroLimpo.slice(-2);

  const numeroFormatado = parteInteira + "." + parteDecimal;

  return parseFloat(numeroFormatado);
}
