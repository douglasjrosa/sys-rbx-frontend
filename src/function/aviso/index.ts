// utils.ts
import { parseISO, startOfDay, differenceInDays } from 'date-fns';

// Definimos o tipo para o objeto do array de dados
type ObjetoDados = {
  attributes: {
    CNPJ: string;
    createdAt: string;
    descricao: string;
    objetivo: number;
    pontual: boolean;
    proxima: string;
    publishedAt: string;
    tipo: number;
    updatedAt: string;
  };
  id: number;
};

// Função para calcular a diferença entre duas datas em dias
export const calcularDiferencaEmDias = (data1: Date, data2: Date): number => {
  const umDiaEmMilissegundos = 24 * 60 * 60 * 1000;
  const data1UTC = Date.UTC(data1.getFullYear(), data1.getMonth(), data1.getDate());
  const data2UTC = Date.UTC(data2.getFullYear(), data2.getMonth(), data2.getDate());
  return Math.floor((data2UTC - data1UTC) / umDiaEmMilissegundos);
};

// Função para encontrar o objeto mais próximo da data atual e definir a cor
export const encontrarObjetoMaisProximoComCor = (
  dados: ObjetoDados[]
): { data: Date; cor: 'yellow' | 'red' | 'blue', info: string } | null => {
  const dataAtual = startOfDay(new Date()); // Zera o horário da data atual
  let objetoMaisProximo: ObjetoDados | null = null;
  let menorDiferencaEmDias = Number.MAX_SAFE_INTEGER;
  let objetoMaisProximoDataMaior: ObjetoDados | null = null;

  for (const objeto of dados) {
    const proximaData = startOfDay(parseISO(objeto.attributes.proxima)); // Converte a string para um objeto Date e zera o horário
    const diferencaEmDias = differenceInDays(dataAtual, proximaData); // Calcula a diferença em dias

    if (diferencaEmDias === 0) {
      return { data: proximaData, cor: 'yellow', info : 'Você tem interação agendada para hoje' };
    }

    if (diferencaEmDias < 0 && diferencaEmDias > -1) {
      return { data: proximaData, cor: 'red', info: 'Você tem interação que ja passou, a data agendada era' };
    }

    if (diferencaEmDias > 1 && diferencaEmDias <= 5) {
      if (proximaData > dataAtual) {
        if (!objetoMaisProximoDataMaior || proximaData < new Date(Date.parse(objetoMaisProximoDataMaior.attributes.proxima))) {
          objetoMaisProximoDataMaior = objeto;
        }
      } else {
        if (diferencaEmDias < menorDiferencaEmDias) {
          menorDiferencaEmDias = diferencaEmDias;
          objetoMaisProximo = objeto;
        }
      }
    }
  }

  if (objetoMaisProximoDataMaior) {
    return { data: new Date(Date.parse(objetoMaisProximoDataMaior.attributes.proxima)), cor: 'blue', info: 'Você tem interação agendada para'};
  }

  return objetoMaisProximo ? { data: new Date(Date.parse(objetoMaisProximo.attributes.proxima)), cor: 'blue', info: 'Você tem interação agendada para' } : null;
};
