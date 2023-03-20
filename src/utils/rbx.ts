export const getEscala = (medida: number, maxima: number) => {
  const max: number = maxima || 710;
  return max / medida;
};

export const escalar = (medida: number, escala: number, isPx: boolean) => {
  const medidaNova = Math.ceil(medida * escala).toFixed(1);
  console.log(medidaNova);
  return isPx ? medidaNova.toString() + 'px' : medidaNova;
};
