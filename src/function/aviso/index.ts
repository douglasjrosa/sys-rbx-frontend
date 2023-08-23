// utils.ts
import { parseISO, startOfDay } from 'date-fns';

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
  dados: any[]
): { data: Date | null; cor: 'yellow' | '#FC0707' | '#3B2DFF'| 'gray', info: string } => {
  const dataAtual = startOfDay(new Date()); // Zera o horário da data atual
  let objetoMaisProximo: any | null = null;
  let menorDiferencaEmDias = Number.MAX_SAFE_INTEGER;
  let objetoMaisProximoDataMaior: any | null = null;

  const data = dados.slice(-1)


  for (const objeto of data) {
    if (!objeto.attributes.proxima) {
      // Caso não haja data disponível, retorna o objeto específico
      return { data: null, cor: 'gray', info: 'Você não tem interação agendada' };
    }

    const proximaData = startOfDay(parseISO(objeto.attributes.proxima)); // Converte a string para um objeto Date e zera o horário

    const diferencaEmDias = calcularDiferencaEmDias(dataAtual, proximaData); // Calcula a diferença em dias

    if (diferencaEmDias === 0) {
      return { data: proximaData, cor: 'yellow', info : 'Você tem interação agendada para hoje' };
    }

    if (diferencaEmDias < 0) {
      return { data: proximaData, cor: '#FC0707', info: 'Você tem interação que já passou, a data agendada era' };
    }

    if (diferencaEmDias > 0) {
      return { data: proximaData, cor: '#3B2DFF', info: 'Você tem interação agendada para'};
    }
  }

  return objetoMaisProximo ? { data: new Date(Date.parse(objetoMaisProximo.attributes.proxima)), cor: '#3B2DFF', info: 'Você tem interação agendada para' } : { data: null, cor: 'gray', info: 'Você não tem interação agendada' };
};
