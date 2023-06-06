export const getAllDaysOfMonth = (month: number | undefined) => {
  const Month: any = !month ? new Date().getMonth() + 1 : month;

  const firstDay = new Date(new Date().getFullYear(), Month - 1, 1);
  const lastDay = new Date(new Date().getFullYear(), Month, 0);
  const days: string[] = [];
  let currentDate = new Date(firstDay);

  while (currentDate <= lastDay) {
    const formattedDate = currentDate.toLocaleDateString('pt-BR');
    days.push(formattedDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const retorno = {
    DataInicio: firstDay.toISOString(),
    DataFim: lastDay.toISOString(),
    Dias: days
  }
  return retorno;
};

