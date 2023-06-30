export const SetValue = (numero: string): string => {
  if (!numero || numero.trim().length === 0) {
    return "0,00";
  }

  const numeroLimpo = numero.replace(/[^0-9]/g, "");

  const parteInteira = numeroLimpo.slice(0, -2).replace(/^0+/, "");
  const parteDecimal = numeroLimpo.slice(-2);

  let parteInteiraFormatada = parteInteira.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  if (parteInteiraFormatada === "") {
    parteInteiraFormatada = "0";
  }

  if (numeroLimpo.length > 15) {
    parteInteiraFormatada = parteInteiraFormatada.slice(-15);
  }

  let numeroFormatado = parteInteiraFormatada;
  if (parteDecimal) {
    numeroFormatado += "," + parteDecimal;
  }

  return numeroFormatado;
}
