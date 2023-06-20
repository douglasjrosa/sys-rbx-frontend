export const DateIso = () => {
  const currentTime = new Date();
  const mesOriginal = currentTime.getMonth() + 1;
  const mes = mesOriginal < 10 ? '0' + mesOriginal : mesOriginal;
  const diaOriginal = currentTime.getDate();
  const dia = diaOriginal < 10 ? '0' + diaOriginal : diaOriginal;
  const date = currentTime.getFullYear() + '-' + mes + '-' + dia;
  return date;
};

export const DateTimeIso = () => {
  const currentTime = new Date();
  const date = currentTime.toISOString();
  return date;
};

export const TimeIso = () => {
  const currentTime = new Date();
  const date =
    currentTime.getHours() +
    ':' +
    currentTime.getMinutes() +
    ':' +
    currentTime.getSeconds();
  return date;
};
