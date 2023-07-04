import axios from "axios";

export const getAllDaysOfMonth = async (month: number | undefined) => {
  const Month: any = !month ? new Date().getMonth() + 1 : month;

  const firstDay = new Date(new Date().getFullYear(), Month - 1, 1);
  const lastDay = new Date(new Date().getFullYear(), Month, 0);
  const days: { id: number, date: string }[] = [];
  let currentDate = new Date(firstDay);

  while (currentDate <= lastDay) {
    const formattedDate = currentDate.toISOString().slice(0, 10); // Ajuste para formato ISO
    const dayObj = { id: currentDate.getDate(), date: formattedDate };
    days.push(dayObj);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Função para obter a lista de feriados
  const obterFeriados = async () => {
    try {
      const response = await axios.get('/api/db/business/get/calendar/feriado');
      const valor = response.data;
      const resultado = valor.map((i: any) => i.attributes.date);
      return resultado;
    } catch (error) {
      console.log(error);
      return [];
    }
  };

  // Obtendo a lista de feriados
  const feriados = await obterFeriados();

  // Filtrando os dias da semana, excluindo feriados, domingos e sábados
  const diasDaSemana = days.filter((day) => {
    const isFeriado = feriados.includes(day.date);
    const diaDaSemana = new Date(day.date).getUTCDay(); // 0 (domingo) a 6 (sábado)
    return !isFeriado && diaDaSemana !== 0 && diaDaSemana !== 6;
  });

  const retorno = {
    DataInicio: firstDay.toISOString(),
    DataFim: lastDay.toISOString(),
    Dias: diasDaSemana
  };

  return retorno;
};
