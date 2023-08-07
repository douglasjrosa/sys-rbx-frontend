export const DateIso = () => {
  const currentTime = new Date();
  const year = currentTime.getFullYear();
  const month = String(currentTime.getMonth() + 1).padStart(2, '0');
  const day = String(currentTime.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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
